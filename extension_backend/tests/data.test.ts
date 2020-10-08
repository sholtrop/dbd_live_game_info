import { Server } from "http";
import { SuperTest, Test } from "supertest";

import { closeServer, setupServer, tokens } from "./util";

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

describe("GameData related routes (perks, addons, killer_names, killer_addons)", () => {
  for (const route of [
    "/addons",
    "/perks",
    "/killer_names",
    "/killer_addons",
  ]) {
    test(`${route} returns data`, async () => {
      const token = tokens.for("viewer");
      const response = await request.get(route).set("Authorization", token);
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).not.toBeNull();
    });
  }
});
