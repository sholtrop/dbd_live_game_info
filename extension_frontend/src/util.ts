import {
  Moderators,
  Build,
  BuildMessage,
  BroadCasterConfig,
  PerkData,
  RarityScaling,
  PerkRarity,
  RarityScalings,
  BuildRequestsEnabledFor,
} from "./types";

export const devMode = process.env.NODE_ENV !== "production";

export const testMode = process.env.NODE_ENV === "test";

export const isArray = <T = unknown>(value: unknown): value is T[] =>
  Array.isArray(value);

export const toArray = <T>(value: T | T[]): T[] => {
  if (isArray<T>(value)) {
    return value;
  }
  return [value];
};

export const filterNull = <T>(strings: (T | null | undefined)[]): T[] => {
  const typedFilter = <(s: T | null | undefined) => s is T>((s) => Boolean(s));
  return strings.filter<T>(typedFilter);
};

export function getTwitch() {
  const Twitch = window.Twitch;
  if (!Twitch) throw Error("No Twitch present on window");
  return Twitch.ext;
}

export function perksFor(
  mode: "killer" | "survivor" | "any",
  allPerks: PerkData
): string[] {
  return mode === "killer"
    ? Object.keys(allPerks.killer)
    : mode === "survivor"
    ? Object.keys(allPerks.survivor)
    : [...Object.keys(allPerks.killer), ...Object.keys(allPerks.survivor)];
}

export function capitalize(string: string) {
  if (!string) return "";
  return string[0].toUpperCase() + string.slice(1);
}

export function reconcileMods(
  configMods: Moderators | undefined | null,
  actualMods: { user_id: string; user_name: string }[]
): Moderators {
  const mods: Moderators = {};
  actualMods.forEach(({ user_id, user_name }) => {
    mods[user_id] = { name: user_name, allowed: false };
  });
  if (configMods)
    Object.entries(configMods).forEach(([id, info]) => {
      if (actualMods.find((mod) => mod.user_id === id)) mods[id] = info;
    });
  return mods;
}

export function getBuildEditor(
  buildForm: Build,
  initialForm: Build,
  setter: (value: React.SetStateAction<Build>) => void
) {
  return (build: Partial<Build>) => {
    // When changing mode from survivor to killer
    // or vice versa reset all perks and/or addons
    if (build.mode && build.mode !== buildForm.mode) {
      if (build.perks !== initialForm.perks) build.perks = Array(4).fill(null);
      if (build.mode === "killer") build.addons = [null, null];
    }
    if (build.mode === "notPlaying") {
      build.killerName = build.addons = null;
      build.perks = Array(4).fill(null);
    }
    // Survivors don't have a killername/addons
    else if (build.mode === "survivor") build.killerName = build.addons = null;
    else if (
      (build.mode === "killer" || buildForm.mode === "killer") &&
      build.killerName != null &&
      buildForm.killerName != null &&
      build.killerName !== buildForm.killerName
    ) {
      build.addons = [null, null];
    }

    setter((old) => ({ ...old, ...build }));
  };
}

export function validateBuild(
  build: Build | null,
  liveBuild?: Build
): BuildMessage | null {
  if (!build) throw Error("No build to validate");
  let emptyAddons = 0,
    emptyPerks = 0;
  if (JSON.stringify(build) === JSON.stringify(liveBuild))
    return {
      type: "error",
      content: "This build is the same as the current build",
    };

  if (build.mode === "killer") {
    if (!build.killerName)
      return {
        type: "error",
        content: "You must set the killer's name",
      };
    emptyAddons = build.addons!.filter((addon) => addon == null).length;
  }

  if (build.mode !== "notPlaying")
    emptyPerks = build.perks!.filter((perk) => perk == null).length;
  if (emptyPerks > 0 && emptyAddons > 0)
    return {
      type: "warning",
      content: `You have ${emptyPerks} empty perk${
        emptyPerks === 1 ? "" : "s"
      } and ${emptyAddons} empty addon${
        emptyAddons === 1 ? "" : "s"
      }. If this is correct, please click Publish again.`,
    };
  else if (emptyPerks > 0)
    return {
      type: "warning",
      content: `You have ${emptyPerks} empty perk${
        emptyPerks === 1 ? "" : "s"
      }. If this is correct, please click Publish again.`,
    };
  else if (emptyAddons > 0)
    return {
      type: "warning",
      content: `You have ${emptyAddons} empty addon${
        emptyAddons === 1 ? "" : "s"
      }. If this is correct, please click Publish again.`,
    };
  return null;
}

export function urlQueryToClaims() {
  const query = new URLSearchParams(window.location.search);

  const claims = {
    channel: query.get("channel") ?? "123",
    role: query.get("role") ?? "broadcaster",
    user_id: "fakeUserId",
  };

  return claims;
}

export function urlQueryToConfig() {
  const query = new URLSearchParams(window.location.search);
  const config: BroadCasterConfig = {
    displayName: query.get("name") || "testuser",
    buildRequests: {
      enabledFor: BuildRequestsEnabledFor.noone,
      queueSize: 0,
      price: 100,
    },
    modList: {
      fakeUserId: {
        allowed: true,
        name: "fakeUser",
      },
    },
    modsCanSet: Number(query.get("canset")),
  };

  return config;
}

export function resolvePerkRarity(
  rank: number,
  scaling: RarityScaling | null
): PerkRarity | null {
  if (scaling === null) return null;
  if (scaling === RarityScaling.brownYellowGreen)
    return rank === 0 ? "common" : rank === 1 ? "uncommon" : "rare";
  if (scaling === RarityScaling.yellowGreenPurple)
    return rank === 0 ? "uncommon" : rank === 1 ? "rare" : "veryrare";
  return rank === 0 ? "rare" : "veryrare";
}

export function assertRarityScalings(
  rarities: (RarityScaling | null)[]
): rarities is RarityScalings {
  return rarities.length === 4;
}
