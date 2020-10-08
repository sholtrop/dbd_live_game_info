import { Handler } from "express";
import { AuthenticationError, AuthorizationError } from "./errors";
import { log } from "./logging";
import { AuthenticatedUser } from "./models";
import { AuthRole, BroadCasterConfig, ModeratorsCanSet } from "./types";

export const authRanks = {
  viewer: 0,
  moderator: 1,
  broadcaster: 2,
  extensionAdmin: 3,
};

export function maySetBuild(
  user: AuthenticatedUser,
  config: BroadCasterConfig | null
): boolean {
  if (user.rank >= authRanks["broadcaster"]) return true;
  if (!config || config.modsCanSet === ModeratorsCanSet.no) return false;
  if (config.modsCanSet === ModeratorsCanSet.all)
    return user.rank >= authRanks["moderator"];
  if (config.modsCanSet === ModeratorsCanSet.some) {
    const moderators = config.modList;
    if (moderators[user.userId!]?.allowed) return true;
  }
  return false;
}

export function requireAuth(requiredRole: AuthRole): Handler {
  return (req, res, next) => {
    log.debug(`Required permissions: ${requiredRole}`);
    let authorization =
      req.get("Authorization") ?? req.query.auth ?? req.query.state;
    if (!authorization || typeof authorization !== "string")
      throw new AuthenticationError(`No token found in request`);

    let token = authorization;
    if (authorization.includes("Bearer")) token = authorization.split(" ")[1];
    try {
      const authUser = new AuthenticatedUser(token, req.app.get("SECRET_KEY"));
      req.user = authUser;
    } catch (e) {
      log.error(e);
      throw e;
    }
    const requiredRank = authRanks[requiredRole];
    const actualRank = authRanks[req.user.role];
    if (actualRank < requiredRank)
      throw new AuthorizationError(
        `You do not have the permissions to perform this action`
      );

    log.debug(
      `Successfully authorized ${req.user.opaqueUserId} for ${req.url}`
    );
    next();
  };
}
