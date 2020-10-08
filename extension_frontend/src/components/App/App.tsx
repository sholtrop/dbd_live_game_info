import React, { useState, useEffect } from "react";
import "./App.css";
import { getTwitch, filterNull } from "../../util";
import Auth from "../../auth/authentication";
import MainPanel from "../MainPanel/MainPanel";
import Loading from "../Loading/Loading";
import BuildView from "../BuildView/BuildView";
import { BuildViewIcon, LockIcon, IdentityIcon } from "../Icons/Icons";
import {
  UserAuth,
  Build,
  DbdApiData,
  BroadCasterConfig,
  ModeratorsCanSet,
  PubsubEvent,
  BuildRequestsEnabledFor,
} from "../../types";
import ModeratorView from "../ModeratorView/ModeratorView";
import ShareIdentityView from "../ShareIdentityView/ShareIdentityView";
import MinimizedButton from "../MinimizedButton/MinimizedButton";

const defaultBuild: Build = {
  mode: "notPlaying",
  addons: null,
  killerName: null,
  perks: Array(4).fill(null),
};

function canSetBuild(config: BroadCasterConfig, auth: Auth) {
  const userId = auth.getUserId() ?? "";
  const isMod = auth.getRole() === "moderator";
  if (auth.getRole() === "broadcaster") return true;
  else if (config.modsCanSet === ModeratorsCanSet.no) return false;
  else if (config.modsCanSet === ModeratorsCanSet.all && isMod) return true;
  else if (
    config.modsCanSet === ModeratorsCanSet.some &&
    isMod &&
    config.modList[userId]?.allowed
  )
    return true;
  return false;
}

const App: React.FC = () => {
  const [initialBuildReceived, setInitialBuildReceived] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [hoveringOver, setHoveringOver] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [dbdInfo, setDbdInfo] = useState<DbdApiData | null>(null);
  const [activeBuild, setActiveBuild] = useState<Build>(defaultBuild);
  const [currentView, setCurrentView] = useState(0);
  const [twitch] = useState(getTwitch());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [configuration, setConfiguration] = useState<BroadCasterConfig>({
    modList: {},
    modsCanSet: ModeratorsCanSet.no,
    displayName: "",
    buildRequests: {
      enabledFor: BuildRequestsEnabledFor.noone,
      queueSize: 0,
      price: 100,
    },
  });
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);

  const emitBuild = async (build: Build) => auth!.emitBuild(build);

  useEffect(() => {
    const handleAuthorized = async ({ token, userId: opaqueId }: UserAuth) => {
      const auth = new Auth(token, opaqueId);
      const addons = await auth.getAddons();
      const perks = await auth.getPerks();
      const killers = await auth.getKillerNames();
      const killerAddons = await auth.getKillerAddons();
      setAuth(auth);
      setDbdInfo({ addons, perks, killers, killerAddons });
      if (!initialBuildReceived) {
        const build = await auth.getCurrentBuild();
        build && setActiveBuild(build);
      }
    };
    twitch.listen("broadcast", (target, _, message) => {
      const { event, data } = JSON.parse(message) as PubsubEvent;
      if (event === "newBuild") {
        !initialBuildReceived && setInitialBuildReceived(true);
        setActiveBuild(data as Build);
        setRecentlyUpdated(true);
      }

      console.log("PUBSUB MESSAGE", { event, data });
    });
    twitch.onAuthorized(handleAuthorized);
    twitch.onContext(({ isFullScreen }, delta) => {
      if (delta.includes("isFullScreen")) setIsFullScreen(isFullScreen);
    });
    twitch.configuration.onChanged(() => {
      twitch.configuration.broadcaster &&
        setConfiguration(JSON.parse(twitch.configuration.broadcaster.content));
    });
  }, []);

  if (
    !dbdInfo ||
    !Object.values(dbdInfo).every((v) => Boolean(v)) ||
    !auth ||
    !configuration
  ) {
    return (
      <div
        className="h-full w-full"
        onMouseEnter={() => setHoveringOver(true)}
        onMouseLeave={() => setHoveringOver(false)}
      >
        <main id="app-container" className={hoveringOver ? "in-view" : ""}>
          <MainPanel
            visible={hoveringOver && !minimized}
            onClose={() => setMinimized(true)}
            isFullScreen={isFullScreen}
            views={[
              {
                view: (
                  <Loading
                    timeoutMessage={
                      <>
                        <div>Something went wrong loading the extension :(</div>
                        <div>Please try again later!</div>
                      </>
                    }
                  />
                ),
                panelIcon: ["Build", <BuildViewIcon />],
              },
            ]}
          />
        </main>

        <MinimizedButton
          onClick={() => setMinimized((old) => !old)}
          visible={hoveringOver && minimized}
        />
      </div>
    );
  }

  return (
    <div
      className="h-full w-full"
      onMouseEnter={() => setHoveringOver(true)}
      onMouseLeave={() => setHoveringOver(false)}
    >
      <main id="app-container" className={hoveringOver ? "in-view" : ""}>
        <MainPanel
          visible={hoveringOver && !minimized}
          onClose={() => setMinimized(true)}
          onViewSwitch={(old, current) => {
            setCurrentView(current);
            old === 0 && setRecentlyUpdated(false);
          }}
          viewWithStar={recentlyUpdated && currentView !== 0 ? 0 : undefined}
          views={filterNull([
            {
              view: (
                <BuildView
                  allAddons={dbdInfo!.addons}
                  allPerks={dbdInfo!.perks}
                  allPowers={dbdInfo!.killers}
                  activeBuild={activeBuild}
                  streamer={configuration.displayName}
                  userRole={auth!.getRole() ?? "viewer"}
                />
              ),
              panelIcon: ["Build", <BuildViewIcon />],
              onNavigateTo: () => setRecentlyUpdated(false),
            },
            canSetBuild(configuration, auth)
              ? {
                  view: (
                    <ModeratorView
                      initialForm={activeBuild}
                      allPerks={dbdInfo!.perks}
                      killerAddons={dbdInfo!.killerAddons}
                      allKillers={dbdInfo!.killers}
                      onPublish={emitBuild}
                    />
                  ),
                  panelIcon: ["Settings", <LockIcon />],
                  accessibleBy: ["moderator", "broadcaster"],
                }
              : null,
            // If moderators can set the build according to broadcaster config,
            // this view allows users to share their identity and confirm their mod status
            configuration.modsCanSet !== ModeratorsCanSet.no &&
            !auth.getUserId()
              ? {
                  view: (
                    <ShareIdentityView
                      onShare={twitch.actions.requestIdShare}
                    />
                  ),
                  panelIcon: ["Identity", <IdentityIcon />],
                  accessibleBy: ["viewer"],
                }
              : null,
          ])}
          isFullScreen={isFullScreen}
        />
      </main>

      <MinimizedButton
        onClick={() => setMinimized((old) => !old)}
        visible={hoveringOver && minimized}
      />
    </div>
  );
};

export default App;
