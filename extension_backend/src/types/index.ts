import { RedisClient } from "redis";

export const enum RarityScaling {
  brownYellowGreen,
  yellowGreenPurple,
  greenPurplePurple,
}

export type RarityScalings = [
  RarityScaling | null,
  RarityScaling | null,
  RarityScaling | null,
  RarityScaling | null
];

export type AddonData = {
  [power: string]: {
    [addonName: string]: InfoTextTree;
  };
};

export type PerkData = {
  killer: {
    [perkName: string]: {
      text: InfoTextTree;
      rarityScaling: RarityScaling;
    };
  };
  survivor: {
    [perkName: string]: {
      text: InfoTextTree;
      rarityScaling: RarityScaling;
    };
  };
};

export type KillerPowers = {
  [killerName: string]: string;
};

export type PerkWithRank = [string, 0 | 1 | 2] | null;

export type InfoTextNodeType =
  | "li"
  | "ul"
  | "b"
  | "i"
  | "p"
  | "yellow"
  | "purple"
  | "red"
  | "darkred"
  | "green"
  | "quote"
  | "brown";

export type InfoTextNode =
  | string
  | { type: InfoTextNodeType; content: InfoTextNode[] };

export type InfoTextTree = InfoTextNode[];

export type AuthRole =
  | "viewer"
  | "moderator"
  | "broadcaster"
  | "extensionAdmin";

export interface RouteError {
  name: string;
  message: string;
  code: string;
  status: number;
}

export interface JwtClaims {
  iat: number;
  exp: number;
  role: AuthRole;
  channel_id: string;
  is_unlinked: boolean;
  opaque_user_id: string;
  pubsub_perms: { listen: string[]; send: string[] };
  user_id: string | null;
}

export interface GameDataSegments {
  killerPerks: PerkData["killer"];
  survivorPerks: PerkData["survivor"];
  allAddons: AddonData;
  powersPerKiller: KillerPowers;
  addonsPerKiller: {
    [killerName: string]: string[];
  };
}

export interface DataSource<T = any> {
  readonly sourceName: string;
  get: (key: string) => Promise<T>;
  set: (key: string, value: T) => Promise<void>;
}

export interface TwitchApiConfiguration {
  testing?: boolean;
  apiSecret: string;
  extensionSecret: string;
  clientId: string;
  redisCache: RedisClient;
}

export type TwitchConfig = { version: string; content: string } | undefined;

export enum ModeratorsCanSet {
  no,
  all,
  some,
}

export type Moderators = { [id: string]: { name: string; allowed: boolean } };

export type BroadCasterConfig = {
  modsCanSet: ModeratorsCanSet;
  modList: Moderators;
  displayName: string;
};

export type RedisClientPromisified = RedisClient & {
  getAsync: (key: string) => Promise<string | null>;
  setAsync: (key: string, value: string) => Promise<void>;
};

export interface OauthToken {
  accessToken: string;
  refreshToken: string;
}
