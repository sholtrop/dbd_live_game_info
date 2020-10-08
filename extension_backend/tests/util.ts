import { sign } from "jsonwebtoken";
import { AuthRole, JwtClaims } from "../src/types";
import { Server } from "http";
import testServer, { SuperTest, Test } from "supertest";
import { app, closeInstance } from "../src/routes";
import { GameData } from "../src/data";
import { FilesystemSource } from "../src/data";

export const tokens = {
  for: (role: AuthRole, linked = true) =>
    `Bearer ${sign(
      {
        exp: Date.now() + 6000,
        role,
        channel_id: "fake_channel_id",
        opaque_user_id: "fake_opaque_id",
        pubsub_perms: { listen: [], send: [] },
        user_id: linked ? "fake_user_id" : null,
        iat: Date.now() + 6000,
        is_unlinked: linked,
      } as JwtClaims,
      Buffer.from(`super-secret`, "base64"),
      { algorithm: "HS256" }
    )}`,
};

export async function setupServer(): Promise<[SuperTest<Test>, Server]> {
  await GameData.initialize([new FilesystemSource(`/tmp/`)]);
  const server = app.listen();
  return [testServer(server), server];
}

export function closeServer() {
  closeInstance();
}
