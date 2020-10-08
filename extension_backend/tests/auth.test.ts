import { SuperTest, Test } from "supertest";
import { Server } from "http";
import { closeServer, setupServer } from "./util";
import { tokens as makeToken } from "./util";
import { maySetBuild } from "../src/auth";
import { AuthenticatedUser } from "../src/models";
import { BroadCasterConfig, ModeratorsCanSet } from "../src/types";

const { stringContaining } = expect;

let request: SuperTest<Test>;
let testApp: Server;

beforeEach(async (done) => {
  [request, testApp] = await setupServer();
  done();
});
afterEach(() => {
  closeServer();
  testApp.close();
});

describe("Auth router middleware", () => {
  it("Returns 401 with an error message if request does not have a valid JWT", async () => {
    const response = await request.get("/perks");
    expect(response.status).toEqual(401);
    expect(response.text).toEqual(stringContaining("No token"));
  });

  it("Returns 200 if request has a valid JWT with correct privileges", async () => {
    const token = makeToken.for("viewer");
    const response = await request.get("/perks").set("Authorization", token);
    expect(response.status).toEqual(200);
  });

  it("Returns 401 with an error message if request has a JWT with insufficient privileges", async () => {
    const token = makeToken.for("viewer");
    const response = await request
      .get("/get_oauth_status")
      .set("Authorization", token);
    expect(response.status).toEqual(403);
  });
});

describe("maySetBuild function", () => {
  const devSecret = Buffer.from(`super-secret`, "base64");
  const baseConfig = {
    displayName: "",
    modList: {
      fakeid: { allowed: true, name: "fakeuser" },
      fakeid2: { allowed: false, name: "fakeuser2" },
    },
  };
  const possibleConfigs: BroadCasterConfig[] = [
    { ...baseConfig, modsCanSet: ModeratorsCanSet.no },
    { ...baseConfig, modsCanSet: ModeratorsCanSet.all },
    { ...baseConfig, modsCanSet: ModeratorsCanSet.some },
  ];
  it("always allows a broadcaster to set the build", () => {
    const user = new AuthenticatedUser(
      makeToken.for("broadcaster").split(" ")[1],
      devSecret
    );
    possibleConfigs.forEach((config) =>
      expect(maySetBuild(user, config)).toBe(true)
    );
  });

  it("never allows a normal viewer to set the build", () => {
    const user = new AuthenticatedUser(
      makeToken.for("viewer").split(" ")[1],
      devSecret
    );
    possibleConfigs.forEach((config) =>
      expect(maySetBuild(user, config)).toBe(false)
    );
  });

  const user = new AuthenticatedUser(
    makeToken.for("moderator").split(" ")[1],
    devSecret
  );

  it("does not allow a moderator to set the build if configuration says moderators cannot set", () => {
    expect(maySetBuild(user, possibleConfigs[0])).toBe(false);
  });

  it("does allow a moderator to set the build if configuration says all moderators can set", () => {
    expect(maySetBuild(user, possibleConfigs[1])).toBe(true);
  });

  it("does allow a moderator to set the build if configuration says some moderators may set, and the moderator is one of those", () => {
    const config: BroadCasterConfig = {
      ...possibleConfigs[2],
      modList: { fake_user_id: { name: "fakeuser", allowed: true } },
    };
    expect(maySetBuild(user, config)).toBe(true);
  });

  it("does not allow a moderator to set the build if the configuration says some moderators may set, but the moderator is not one of those", () => {
    const config: BroadCasterConfig = {
      ...possibleConfigs[2],
      modList: { fake_user_id: { name: "fakeuser", allowed: false } },
    };
    expect(maySetBuild(user, config)).toBe(false);
    const configWithoutMod = { ...possibleConfigs[2], modList: {} };
    expect(maySetBuild(user, configWithoutMod)).toBe(false);
  });
});
