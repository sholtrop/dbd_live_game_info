export type TwitchContext = {
  arePlayerControlsVisible: boolean;
  bitrate: number;
  bufferSize: number;
  displayResolution: string;
  game: string;
  hlsLatencyBroadcaster: number;
  hostingInfo: {
    hostedChannelId: string;
    hostingChannelId: string;
  };
  isFullScreen: boolean;
  isTheatreMode: boolean;
  language: string;
  mode: "viewer" | "dashboard" | "config";
  playbackMode: "video" | "audio" | "remote" | "chat-only";
  theme: "light" | "dark";
  videoResolution: string;
  volume: number;
};

export type AppContextProps = {
  cursorInside: boolean;
};

export type TwitchContextDelta = (keyof TwitchContext)[];

export type TwitchConfig = { version: string; content: string } | undefined;

declare global {
  interface Window {
    Twitch: {
      ext: {
        version: string;
        environment: "production";
        listen: (
          target: string,
          callback: (
            target: string,
            contentType: string,
            message: string
          ) => void
        ) => void;
        unlisten: (
          target: string,
          callback: (
            target: string,
            contentType: string,
            message: string
          ) => void
        ) => void;
        onAuthorized: (
          callback: (args: {
            channelId: string;
            clientId: string;
            token: string;
            userId: string;
          }) => void
        ) => void;
        onContext: (
          callback: (
            context: TwitchContext,
            contextDelta: TwitchContextDelta
          ) => void
        ) => void;
        onError: (errorCallback: (errorValue: any) => void) => void;
        onVisibilityChanged: (
          callback: (isVisible: boolean, context: TwitchContext) => void
        ) => void;
        configuration: {
          broadcaster: TwitchConfig;
          developer: TwitchConfig;
          global: TwitchConfig;
          onChanged: (callback: () => void) => void;
          set: (segment: string, version: string, content: string) => void;
        };
        actions: {
          requestIdShare: () => void;
          minimize: () => void;
        };
      };
    };
  }
}
export type OneOrMore<T> = T | T[];

export type Single<T> = T extends (infer U)[] ? U : never;

export type KillerAddons = {
  [killerName: string]: string[];
};

export type PerkRank = 0 | 1 | 2;

export type Addons = [string | null, string | null] | null;

export type Perks = ([string, PerkRank] | null)[];

export type Build = {
  mode: "killer" | "survivor" | "notPlaying";
  perks: Perks;
  killerName: string | null;
  addons: Addons;
};

export type DbdApiData = {
  perks: PerkData;
  addons: AddonData;
  killers: KillerPowers;
  killerAddons: KillerAddons;
};

export type UserAuth = {
  token: string;
  userId: string;
};

export type UserRole = "viewer" | "moderator" | "broadcaster";

export type Icon = (props: {
  className?: string;
  colored?: boolean;
}) => React.ReactElement;

export type PerkRarity = "common" | "uncommon" | "rare" | "veryrare";

export type PerkSearchConstraints = {
  mode: "killer" | "survivor" | "any";
  exclude?: string[] | null;
};

export type BuildMessage = {
  type: "success" | "warning" | "error" | "pending";
  content: string | React.ReactElement;
};

export enum ModeratorsCanSet {
  no,
  all,
  some,
}

export type Moderators = { [id: string]: { name: string; allowed: boolean } };

export const enum BuildRequestsEnabledFor {
  noone,
  anyone,
  subscribers,
  bitgivers,
}

export type BroadCasterConfig = {
  modsCanSet: ModeratorsCanSet;
  modList: Moderators;
  displayName: string;
  buildRequests: {
    enabledFor: BuildRequestsEnabledFor;
    queueSize: number;
    price: BuildRequestPrice;
  };
};

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

export type PubsubEvent = { event: string; data: object };

export const BuildRequestPrices = [
  100,
  300,
  500,
  1000,
  1500,
  2000,
  3000,
] as const;

export type ElementType<
  T extends ReadonlyArray<unknown>
> = T extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type BuildRequestPrice = ElementType<typeof BuildRequestPrices>;
