import express, { Handler, json, ErrorRequestHandler } from "express";
import cors from "cors";
import {
  EnvironmentError,
  OauthError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
} from "./errors";
import { log } from "./logging";
import { maySetBuild, requireAuth } from "./auth";
import { FirestoreSource, GameData, RedisSource, clientId } from "./data";
import buildUrl from "build-url";
import { DbdBuild, TwitchApi } from "./models";
import { BroadCasterConfig, OauthToken } from "./types";
import morgan from "morgan";
import fetch from "node-fetch";

const port = Number(process.env.PORT ?? "5000");
const app = createExpressApp();
let redis = RedisSource.fromEnv();
let twitchApi = TwitchApi.fromEnv(redis.client);
twitchApi.oauthSource = new FirestoreSource();

function createExpressApp() {
  const app = express();
  if (process.env.CLIENT_SECRET)
    app.set("SECRET_KEY", Buffer.from(process.env.CLIENT_SECRET, "base64"));
  else if (process.env.NODE_ENV === "production")
    throw new EnvironmentError(
      `No CLIENT_SECRET found in env variables, refusing to use dev secret in production mode`
    );
  else {
    log.warn(`Using development/test secret \`super-secret\``);
    app.set("SECRET_KEY", Buffer.from(`super-secret`, "base64"));
  }
  app.disable('etag');
  return app;
}

const async = (func: Handler): Handler => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch((e) => {
    log.error(e);
    throw new Error(e);
  });
};

app.use(cors({ origin: "*" }));
app.use(morgan("common", { skip: () => process.env.NODE_ENV === "test" }));

app.get(
  "/perks",
  requireAuth("viewer"),
  async(async (req, res, next) => {
    res.json({
      data: {
        survivor: GameData.survivorPerks,
        killer: GameData.killerPerks,
      },
    });
  })
);

app.get(
  "/addons",
  requireAuth("viewer"),
  async(async (req, res, next) => {
    res.json({ data: GameData.addons });
  })
);

app.get(
  "/killer_names",
  requireAuth("viewer"),
  async(async (req, res, next) => {
    res.json({ data: GameData.powersPerKiller });
  })
);

app.get(
  "/killer_addons",
  requireAuth("viewer"),
  async(async (req, res, next) => {
    res.json({ data: GameData.addons });
  })
);

app.get(
  "/get_oauth_status",
  requireAuth("broadcaster"),
  async(async (req, res, next) => {
    if (!req.user) return;
    const { channelId } = req.user;
    log.debug(`get_oauth_status for ${channelId}`);
    try {
      var token = await new FirestoreSource().get(`oauth/${channelId}`);
    } catch (e) {
      log.debug(`No oauth available for ${channelId}`);
      res.json({ data: { available: false } });
      next();
      return;
    }
    log.debug(`Found: ${JSON.stringify(token)}`);
    res.json({ data: { available: true } });
  })
);

app.post(
  "/set_build",
  json(),
  requireAuth("moderator"),
  async(async (req, res, next) => {
    log.debug(
      `set_build request received for ${req.user?.channelId ?? "Unknown id"}`
    );
    if (!req.user) return;
    const { user } = req;
    const broadcasterConfig = await twitchApi.getConfigurationSegment(
      req.user.channelId,
      "broadcaster"
    );
    const config = JSON.parse(
      broadcasterConfig?.content ?? "null"
    ) as BroadCasterConfig | null;

    if (maySetBuild(req.user, config)) {
      try {
        var build = await DbdBuild.fromData(req.body);
      } catch (e) {
        if (e instanceof ValidationError)
          res.status(400).json({ error: e.message });
        return;
      }
      await redis.set(`${user.channelId}_build`, build.toString());
      await twitchApi.sendMessage(
        user.channelId,
        JSON.stringify({
          event: "newBuild",
          data: build.toObject(),
        })
      );
      log.debug(
        `Successfully set build for ${user.channelId} to ${build.toString()}`
      );
      res.sendStatus(204);
    } else {
      res.status(403).json({
        error: `According to current configuration settings, you do not have permission to set the build for ${user.channelId}`,
      });
    }
  })
);

app.get(
  "/get_build",
  requireAuth("viewer"),
  async(async (req, res, next) => {
    if (!req.user) return;
    const { channelId } = req.user;
    let build: DbdBuild;
    let buildDataString = await redis.get(`${channelId}_build`);
    log.debug(`Existing build for ${channelId}: ${buildDataString}`);
    if (buildDataString)
      build = await DbdBuild.fromData(JSON.parse(buildDataString));
    else build = await DbdBuild.new();
    log.debug(`Sending back ${build} for ${channelId}`);
    res.status(200).json({ data: build.toObject() });
  })
);

app.get(
  "/oauth",
  requireAuth("broadcaster"),
  async(async (req, res) => {
    const clientSecret = process.env.API_SECRET;
    if (!clientSecret)
      throw new EnvironmentError(`No API_SECRET in env variables`);
    log.debug(`Got oauth request`);
    const redirectUri = process.env.REDIRECT_URI!;
    log.debug(`redirectUri: ${redirectUri}`);
    const { error_description: error } = req.query;
    const { code = null } = req.query;
    if (code !== null && typeof code !== "string")
      throw TypeError(`Type of code was not string`);
    if (error) {
      log.error(`OAuth error: ${error}`);
      res.status(400).json({
        error:
          "Something went wrong with your OAuth request. Please try again later.",
      });
    } else if (!code) {
      log.debug(`No code found, redirecting`);

      const url = buildUrl(`https://id.twitch.tv/oauth2/authorize`, {
        queryParams: {
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "code",
          scope: "moderation:read",
          state: req.user!.jwt,
        },
      });

      log.debug(`Redirecting to ${url}`);
      res.status(302).redirect(url);
    } else {
      const { userId, channelId } = req.user!;
      log.debug("OAuth code received");
      const url = buildUrl(`https://id.twitch.tv/oauth2/token`, {
        queryParams: {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        },
      });
      log.debug(`Fetching ${url}`);
      const response = await fetch(url, { method: "post" });
      const data = await response.json();
      await new FirestoreSource().set(`oauth/${userId}`, {
        accessToken: data["access_token"],
        refreshToken: data["refresh_token"],
      } as OauthToken);
      log.debug(`Stored oauth code`);
      await twitchApi.sendMessage(
        channelId,
        JSON.stringify({
          event: "oauthReady",
          data: null,
        })
      );
      log.debug(`Sent oauthReady via pubsub`);
      res.status(200).sendFile(`${__dirname}/assets/oauth_success.html`);
    }
  })
);

app.get(
  "/moderators/:channelId",
  requireAuth("broadcaster"),
  async(async (req, res, next) => {
    log.debug(`/moderators request for ${req.user?.channelId ?? "Unknown"}`);
    const { channelId } = req.params;
    if (channelId !== req.user!.channelId) {
      res
        .status(403)
        .json({ error: `You are not the broadcaster of ${channelId}` });
      return;
    }
    try {
      var moderators = await twitchApi.getModerators(channelId);
    } catch (e) {
      log.error(`In /moderators/${channelId}: ${e}`);
      if (e instanceof OauthError)
        res.status(400).json({
          error: `OAuth is not available for ${channelId}`,
        });
      else {
        res.status(503).json({
          error: `Something went wrong processing oauth request`,
        });
      }
      return;
    }
    log.debug("Returning moderators");
    res.status(200).json({
      data: moderators,
    });
  })
);

app.use((req, res, next) => {
  throw new NotFoundError(`This route could not be found`);
});

const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  log.error(`Error for ${req.originalUrl}: ${err.message}`);
  if (err instanceof AuthorizationError) res.status(403);
  else if (err instanceof AuthenticationError) res.status(401);
  else if (err instanceof OauthError) res.status(401);
  else if (err instanceof ValidationError) res.status(400);
  else if (err instanceof NotFoundError) res.status(404);
  else {
    res.status(500).json({ error: "Unknown error, please try again later" });
    return;
  }
  res.json({ error: err.message });
};

app.use(errorHandler);
// For tests, so they can close the redis instance
function closeInstance() {
  redis.close();
}

export { port, app, closeInstance };
