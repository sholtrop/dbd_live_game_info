import {
  AddonData,
  DataSource,
  GameDataSegments,
  KillerPowers,
  RedisClientPromisified,
} from "./types";
import { log } from "./logging";
import { noNullVals } from "./util";
import { writeFile } from "fs/promises";
import { createClient, RedisClient } from "redis";
import { firestore } from "firebase-admin";
import { promisify } from "util";
import { EnvironmentError } from "./errors";
import { useAdapter } from "@type-cacheable/redis-adapter";

export const clientId = `4xyn35uwlhr23ek0xzmpf1w7tmen2q`;

export class GameData {
  private static readonly externalKeysMapping: {
    [cloudKey: string]: keyof GameDataSegments;
  } = {
    addons: "allAddons",
    killer_perks: "killerPerks",
    powers: "powersPerKiller",
    survivor_perks: "survivorPerks",
  };
  private static gameData: GameDataSegments;
  private static isInitialized = false;
  private constructor() {}
  static get addons() {
    if (this.isInitialized) return this.gameData.allAddons;
    else throw Error(`GameData is not initialized yet`);
  }
  static get killerPerks() {
    if (this.isInitialized) return this.gameData.killerPerks;
    else throw Error(`GameData is not initialized yet`);
  }
  static get powersPerKiller() {
    if (this.isInitialized) return this.gameData.powersPerKiller;
    else throw Error(`GameData is not initialized yet`);
  }
  static get survivorPerks() {
    if (this.isInitialized) return this.gameData.survivorPerks;
    else throw Error(`GameData is not initialized yet`);
  }
  static get addonsPerKiller() {
    if (this.isInitialized) return this.gameData.addonsPerKiller;
    else throw Error(`GameData is not initialized yet`);
  }

  static async initialize(sources: DataSource[]): Promise<void> {
    const gameData: {
      [K in keyof GameDataSegments]: GameDataSegments[K] | null;
    } = {
      addonsPerKiller: null,
      allAddons: null,
      killerPerks: null,
      survivorPerks: null,
      powersPerKiller: null,
    };
    log.info(`Initializing GameData`);

    for (const [dataKey, localKey] of Object.entries(
      this.externalKeysMapping
    )) {
      gameData[localKey] = await this.trySources(dataKey, sources);
    }
    gameData.addonsPerKiller = this.computeKillerAddons(
      gameData.allAddons!,
      gameData.powersPerKiller!
    );
    if (!noNullVals(gameData))
      throw Error(
        `Some values of gameData were nullish ${JSON.stringify(
          gameData,
          null,
          2
        )}`
      );
    log.info(`Successfully initialized GameData`);
    this.gameData = gameData;
    this.isInitialized = true;
  }

  private static async trySources(segment: string, sources: DataSource[]) {
    for (const src of sources) {
      log.info(`Trying ${src.sourceName} for ${segment}...`);
      try {
        return await src.get(segment);
      } catch (e) {
        log.warning(
          `Could not get ${segment} from ${src.sourceName}. Attempting next source.`
        );
      }
    }
    throw Error(
      `${segment} could not be retrieved from any of these sources: ${sources.map(
        (src) => src.sourceName + "\n"
      )}`
    );
  }
  private static computeKillerAddons(
    allAddons: AddonData,
    powersPerKiller: KillerPowers
  ) {
    const killerAddons: { [killerName: string]: string[] } = {};
    for (const [name, power] of Object.entries(powersPerKiller)) {
      const addons = Object.keys(allAddons[power]);
      killerAddons[name.trim()] = addons;
    }
    return killerAddons;
  }
}

export class FirestoreSource implements DataSource {
  sourceName = "firestore";

  constructor(
    private options?: {
      caching?: {
        disk?: {
          baseDir: string;
        };
      };
    }
  ) {
    if (!options) this.options = {};
  }

  async get(key: string) {
    const store = firestore();
    const docRef = store.doc(key);
    const doc = await docRef.get();
    if (!doc.exists) throw Error(`Could not find key ${key} in Firestore`);
    log.info(`Got ${key} from Firestore`);
    const { caching } = this.options ?? {};
    if (caching?.disk) {
      log.info(`Caching ${key} to ${caching.disk.baseDir}/${key}`);
      writeFile(
        `${caching.disk.baseDir}/${key}.json`,
        JSON.stringify(doc.data() ?? {})
      );
    }
    return doc.data();
  }

  async set(key: string, value: any) {
    const store = firestore();
    const docRef = store.doc(key);
    docRef.set(value);
    log.info(`Set ${key} in Firestore`);
    log.debug(value);
  }
}

export class FilesystemSource implements DataSource {
  sourceName = "filesystem";

  constructor(private baseDir: string) {}

  async get(key: string) {
    try {
      return require(`${this.baseDir}/${key}.json`);
    } catch (e) {
      return null;
    }
  }

  async set(key: string, value: any) {
    await writeFile(`${this.baseDir}/${key}.json`, JSON.stringify(value));
  }
}

export class RedisSource implements DataSource {
  sourceName = "redis";

  private _promiseClient: RedisClientPromisified;
  private _client: RedisClient;
  get client(): RedisClient {
    return this._client;
  }

  static fromEnv(): RedisSource {
    if (process.env.REDIS_URL) return new RedisSource(process.env.REDIS_URL);
    else if (process.env.NODE_ENV !== "production") {
      log.warn(`Using redis url redis://localhost:6379 as fallback`);
      return new RedisSource(`redis://localhost:6379`);
    }
    throw new EnvironmentError(`No REDIS_URL env variable found`);
  }

  constructor(redisUrl: string) {
    const client = createClient({ url: redisUrl }) as RedisClientPromisified;
    this._client = client;
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client) as (
      key: string,
      value: string
    ) => Promise<void>;
    client.getAsync = getAsync;
    client.setAsync = setAsync;
    this._promiseClient = client;
  }

  async get(key: string) {
    return await this._promiseClient.getAsync(key);
  }
  async set(key: string, value: string) {
    await this._promiseClient.setAsync(key, value);
  }
  close(): void {
    this._promiseClient.quit();
  }
}

let redisCacheInitialized = false;
export function setupRedisCache(client: RedisClient) {
  if (!redisCacheInitialized) {
    client.get("test", (err, reply) => {
      if (err) throw new EnvironmentError(`Redis not connected properly`);
      log.info(`Initializing Redis cache`);
      useAdapter(client);
    });
  }
  redisCacheInitialized = true;
}
