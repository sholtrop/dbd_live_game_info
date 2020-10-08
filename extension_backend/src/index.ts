import dotenv from "dotenv";
dotenv.config();
import { port, app } from "./routes";
import { log } from "./logging";
import { EnvironmentError } from "./errors";
import { credential, initializeApp } from "firebase-admin";
import { GameData, FilesystemSource, FirestoreSource } from "./data";

function initFirebase() {
  const serviceAccount = require("../serviceAccount.json");
  if (!process.env.FIREBASE_URL)
    throw new EnvironmentError(`No FIREBASE_URL env variable found`);

  initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_URL,
  });
}

async function main() {
  initFirebase();
  await GameData.initialize([
    new FilesystemSource("/tmp/"),
    new FirestoreSource({
      caching: {
        disk: {
          baseDir: "/tmp/",
        },
      },
    }),
  ]);
  return app.listen(port, () => {
    if (process.env.NODE_ENV !== "production")
      log.warn(`Running in development mode`);
    log.info(`Running on port ${port}`);
  });
}

main();
