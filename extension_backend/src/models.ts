import {
  AuthRole,
  DataSource,
  JwtClaims,
  TwitchApiConfiguration,
  TwitchConfig,
  PerkWithRank,
  OauthToken as OauthEntry,
} from "./types";
import { verify } from "jsonwebtoken";
import { sign } from "jsonwebtoken";
import fetch, { Response } from "node-fetch";
import { log } from "./logging";
import { EnvironmentError, ValidationError, OauthError } from "./errors";
import { authRanks } from "./auth";
import { clientId, GameData, setupRedisCache } from "./data";
import { capitalize } from "./util";
import { Cacheable } from "@type-cacheable/core";
import buildUrl from "build-url";
import { RedisClient } from "redis";

export class AuthenticatedUser {
  get rank() {
    return authRanks[this.role];
  }

  private _role: AuthRole;
  get role() {
    return this._role;
  }
  private _channelId: string;
  get channelId() {
    return this._channelId;
  }
  private _isUnlinked: boolean;
  get isUnlinked() {
    return this._isUnlinked;
  }
  private _opaqueUserId: string;
  get opaqueUserId() {
    return this._opaqueUserId;
  }
  private _pubsubPerms: { listen: string[]; send: string[] };
  get pubsubPerms() {
    return this._pubsubPerms;
  }
  private _userId: string | null;
  get userId() {
    return this._userId;
  }
  private _jwt: string;
  get jwt() {
    return this._jwt;
  }

  constructor(jwt: string, secretKey: Buffer) {
    const {
      channel_id,
      is_unlinked,
      role,
      opaque_user_id,
      pubsub_perms,
      user_id,
    } = verify(jwt, secretKey) as JwtClaims;
    this._role = role;
    this._channelId = channel_id;
    this._isUnlinked = is_unlinked;
    this._opaqueUserId = opaque_user_id;
    this._pubsubPerms = pubsub_perms;
    this._userId = user_id;
    this._jwt = jwt;
  }
}

export class TwitchApi {
  private configuration: {
    [K in keyof TwitchApiConfiguration]: "extensionSecret" extends K
      ? Buffer
      : TwitchApiConfiguration[K];
  };

  set oauthSource(source: DataSource) {
    this._oauthSource = source;
  }
  private _oauthSource: DataSource | null = null;

  private readonly oauth = {
    get: async (key: string) => {
      if (!this._oauthSource)
        throw new EnvironmentError(`No OAuth source set yet`);
      return await this._oauthSource.get(key);
    },
    set: async (key: string, value: any) => {
      if (!this._oauthSource)
        throw new EnvironmentError(`No OAuth source set yet`);
      return await this._oauthSource.set(key, value);
    },
    name: () =>
      this._oauthSource ? this._oauthSource.sourceName : `NOT SET YET`,
  };

  // This static method is being called to generate a cache key based on the given arguments.
  // Not featured here: the second argument, context, which is the instance the method
  // was called on.
  static setCacheKey = (args: any[]) => args[0];

  static fromEnv(redis: RedisClient): TwitchApi {
    const { CLIENT_SECRET, API_SECRET, NODE_ENV, CLIENT_ID } = process.env;
    if (NODE_ENV === "test" || NODE_ENV === "testing")
      return new TwitchApi({
        testing: true,
        apiSecret: `test`,
        clientId,
        extensionSecret: `test`,
        redisCache: redis,
      });

    if (!CLIENT_SECRET)
      throw new EnvironmentError(`Missing CLIENT_SECRET in env variables`);
    if (!API_SECRET)
      throw new EnvironmentError(`Mising API_SECRET in env variables`);

    return new TwitchApi({
      apiSecret: API_SECRET,
      clientId,
      extensionSecret: CLIENT_SECRET,
      redisCache: redis,
    });
  }

  private constructor(configuration: TwitchApiConfiguration) {
    const secretKey = Buffer.from(configuration.extensionSecret, "base64");
    setupRedisCache(configuration.redisCache);
    this.configuration = {
      ...configuration,
      extensionSecret: secretKey,
    };
  }

  async getConfigurationSegment(
    channelId: string,
    segment: "broadcaster" | "global" | "developer" = "broadcaster"
  ): Promise<TwitchConfig | null> {
    const url = `https://api.twitch.tv/extensions/${clientId}/configurations/segments/${segment}?${channelId}`;
    const jwt = this.makeJwt({ user_id: channelId });
    try {
      var response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "client-id": clientId,
          "content-type": "application/json",
        },
      });
      await this.checkResponse(response);
    } catch (e: unknown) {
      return null;
    }
    return await response.json();
  }

  async sendMessage(channelId: string, message: string) {
    const url = `https://api.twitch.tv/extensions/message/${channelId}`;
    const jwt = this.makeJwt({
      channel_id: channelId,
      user_id: channelId,
      pubsub_perms: {
        send: ["broadcast"],
      },
    });
    try {
      var response = await fetch(url, {
        body: JSON.stringify({
          content_type: "application/json",
          targets: ["broadcast"],
          message,
        }),
        method: "post",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "client-id": clientId,
          "content-type": "application/json",
        },
      });
      await this.checkResponse(response);
    } catch (e: unknown) {
      return null;
    }
  }

  async getModerators(channelId: string) {
    const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${channelId}`;
    const response = await this.makeOAuthRequest(url, channelId);
    if (response.ok) return await response.json();
    log.error(await response.json());
    throw new Error(`Something went wrong requesting moderators`);
  }

  private async makeOAuthRequest(
    url: string,
    userId: string
  ): Promise<Response> {
    log.debug(
      `Retrieving Oauth token for ${userId} from source: ${this.oauth.name()}`
    );
    const oauth = (await this.oauth.get(
      `oauth/${userId}`
    )) as OauthEntry | null;
    log.debug({ oauth });
    if (!oauth)
      throw new OauthError(
        `Oauth access has not yet been granted by this user`
      );
    const { accessToken } = (await this.refreshToken(userId, oauth)) ?? {};
    if (!accessToken)
      throw new OauthError(
        `Access token could not be validated/refreshed. May have been revoked by user.`
      );
    log.info(`Making OAuth request to ${url} for ${userId}`);
    return await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "client-id": clientId,
      },
    });
  }

  private makeJwt(
    claims: { [index: string]: number | string | object } = {}
  ): string {
    return sign(
      {
        exp: Date.now() + 6000,
        role: "external",
        ...claims,
      },
      this.configuration.extensionSecret
    );
  }

  private async checkResponse(response: Response) {
    if (!response.ok) {
      log.error(
        `Error while requesting ${response.url}: ${await response.text()}`
      );
      throw Error(`Error ${response.status} - ${await response.text()}`);
    }
  }

  @Cacheable({
    cacheKey: TwitchApi.setCacheKey,
    ttlSeconds: 3500,
  })
  private async refreshToken(
    userId: string,
    oauth: OauthEntry
  ): Promise<{ accessToken: string } | null> {
    log.debug(`Refreshing token for ${userId}`);
    const { apiSecret, clientId } = this.configuration;
    const { refreshToken } = oauth;
    const refreshUrl = buildUrl(`https://id.twitch.tv/oauth2/token`, {
      queryParams: {
        grant_type: "refresh_token",
        refresh_token: escape(refreshToken),
        client_id: clientId,
        client_secret: apiSecret,
      },
    });
    log.debug(`Sending request to ${refreshUrl}`);
    const response = await fetch(refreshUrl, {
      method: "post",
    });
    if (!response.ok) {
      log.error(`Could not get refresh token: ${await response.text()}`);
      return null;
    }
    const {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    } = await response.json();
    await this.oauth.set(`oauth/${userId}`, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    return { accessToken: newAccessToken };
  }
}

export class DbdBuild {
  static readonly baseBuild = {
    mode: "notPlaying" as const,
    perks: [null, null, null, null] as [
      PerkWithRank,
      PerkWithRank,
      PerkWithRank,
      PerkWithRank
    ],
    addons: null,
    killerName: null,
  };

  static async new(): Promise<DbdBuild> {
    const build = new DbdBuild(null);
    return build;
  }

  static async fromData(userData: object): Promise<DbdBuild> {
    const build = new DbdBuild(userData);
    await build.validate();
    return build;
  }

  toString(): string {
    return JSON.stringify({
      perks: this.perks,
      addons: this.addons,
      killerName: this.killerName,
      mode: this.mode,
    });
  }

  toObject(): object {
    return {
      perks: this.perks,
      addons: this.addons,
      killerName: this.killerName,
      mode: this.mode,
    };
  }

  private perks: [PerkWithRank, PerkWithRank, PerkWithRank, PerkWithRank];

  private addons: [string | null, string | null] | null;

  private mode: "notPlaying" | "killer" | "survivor";

  private killerName: string | null;

  private constructor(userData: any) {
    if (typeof userData !== "object")
      throw new ValidationError(
        `${userData} is not a valid DbD build; must be of type object`
      );
    if (userData != null) {
      this.mode = userData.mode;
      this.perks = userData.perks;
      this.killerName = userData.killerName;
      this.addons = userData.addons;
      return;
    }

    this.perks = [...DbdBuild.baseBuild.perks];
    this.addons = DbdBuild.baseBuild.addons;
    this.killerName = DbdBuild.baseBuild.killerName;
    this.mode = DbdBuild.baseBuild.mode;
  }

  private async validate() {
    await this.validateMode();
    await this.validatePerks();
    await this.validateKillerName();
    await this.validateAddons();
  }
  private async validateMode() {
    const validModes = ["notPlaying", "killer", "survivor"];
    if (!validModes.includes(this.mode))
      throw new ValidationError(
        `Error: mode must be one of ${validModes.map((mode) => mode + " ")}`
      );
  }
  private async validatePerks() {
    if (this.mode === "notPlaying" && this.perks.find((perk) => perk !== null))
      throw new ValidationError(
        `When mode is notPlaying, all perks must be null`
      );
    else {
      this.perks.forEach((perk) => {
        if (perk != null && (perk[1] < 0 || perk[1] > 2))
          throw new ValidationError(
            `Error at ${perk[0]} with rank ${perk[1]}: Perk rank must be 0, 1 or 2`
          );
        const perkNames =
          this.mode === "killer"
            ? GameData.killerPerks
            : GameData.survivorPerks;

        if (perk !== null && !perkNames[perk[0]])
          throw new ValidationError(
            `${perk} is not a valid perk name for ${this.mode}`
          );
      });
    }
  }
  private async validateKillerName() {
    if (this.mode !== "killer") {
      if (this.killerName !== null)
        throw new ValidationError(
          `killerName must be null when mode is ${this.mode}`
        );
    } else {
      const killerNames = GameData.powersPerKiller;
      // Compare the killer name without The, e.g. 'The Trapper' -> 'Trapper'
      if (
        !killerNames[
          `The ${this.killerName!.split(" ").map(capitalize).join(" ")}`
        ]
      )
        throw new ValidationError(
          `${this.killerName} is not a valid killer name`
        );
    }
  }
  private async validateAddons() {
    if (this.mode !== "killer") {
      if (this.addons !== null)
        throw new ValidationError(
          `Addons must be null when mode is ${this.mode}`
        );
    } else {
      if (!this.addons)
        throw new ValidationError(`Addons may not be null when mode is killer`);
      this.addons.forEach((addon) => {
        const thisKillersAddons =
          GameData.addonsPerKiller[`The ${capitalize(this.killerName!)}`];
        if (
          addon !== null &&
          !thisKillersAddons.find((killerAddon) => killerAddon === addon)
        )
          throw new ValidationError(
            `${addon} is not a valid addon for ${this.killerName}`
          );
      });
    }
  }
}
