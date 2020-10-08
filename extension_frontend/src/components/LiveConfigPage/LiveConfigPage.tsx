import React, { useState, useEffect } from "react";
import "./LiveConfigPage.css";
import Loading from "../Loading/Loading";
import PerkSearch from "../PerkSearch/PerkSearch";
import Modal from "../Modal/Modal";
import PerkList from "../PerkList/PerkList";
import AddonList from "../AddonList/AddonList";
import AddonSearch from "../AddonSearch/AddonSearch";
import KillerSearch from "../KillerSearch/KillerSearch";
import Authentication from "../../auth/authentication";
import {
  ModeSelect,
  ModeratorControls,
  ModeratorBuildMessage,
} from "../ModeratorView/ModeratorView";
import {
  getTwitch,
  getBuildEditor,
  filterNull,
  validateBuild,
  assertRarityScalings,
} from "../../util";
import {
  DbdApiData,
  Build,
  BroadCasterConfig,
  PerkRank,
  BuildMessage,
  ModeratorsCanSet,
  RarityScalings,
} from "../../types";

const defaultBuild: Build = {
  killerName: null,
  addons: null,
  mode: "notPlaying",
  perks: [null, null, null, null],
};

const LiveConfigPage: React.FC = () => {
  const [twitch] = useState(getTwitch());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dbdInfo, setDbdInfo] = useState<DbdApiData | null>(null);
  const [activeBuild, setActiveBuild] = useState<Build>(defaultBuild);
  const [rarityScalings, setRarityScalings] = useState<RarityScalings>([
    null,
    null,
    null,
    null,
  ]);
  const [buildForm, setBuildForm] = useState<Build>(defaultBuild);
  const [config, setConfig] = useState<BroadCasterConfig | null>(null);
  const [auth, setAuth] = useState<Authentication | null>(null);
  const [perkBeingSearched, setPerkBeingSearched] = useState<number | null>(
    null
  );
  const [addonBeingSearched, setAddonBeingSearched] = useState<number | null>(
    null
  );
  const [buildMessage, setBuildMessage] = useState<BuildMessage | null>(null);
  const { content, type } = buildMessage ?? {};
  const addonEmptyText = () => {
    if (buildForm.mode === "notPlaying") return "";
    if (buildForm.mode === "survivor")
      return "Addons are only available for killer";
    if (!buildForm.killerName)
      return "You must set the killer's name before you can set addons";
  };

  const editBuild = getBuildEditor(buildForm, activeBuild, setBuildForm);
  const clearBuild = () => {
    const { mode } = buildForm;
    editBuild({
      perks: Array(4).fill(null),
      addons: mode === "killer" ? [null, null] : null,
      killerName: null,
    });
  };
  const resetBuild = () => editBuild({ ...activeBuild });
  const publishBuild = async (build: Build) => {
    const { success = false } = (await auth?.emitBuild(buildForm)) ?? {};
    if (success)
      setBuildMessage({
        content: "Successfully published build!",
        type: "success",
      });
    else
      setBuildMessage({
        content:
          "Something went wrong while publishing the build. Please try again later.",
        type: "error",
      });
  };
  useEffect(() => {
    if (!dbdInfo) return;
    const { mode } = activeBuild;
    const rarities = activeBuild.perks.map((perk) => {
      if (perk === null) return null;
      const perkName = perk[0];
      return dbdInfo.perks[mode][perkName].rarityScaling;
    });
    if (assertRarityScalings(rarities)) setRarityScalings(rarities);
    else throw Error("Fewer than 4 rarities in rarity scaling");
  }, [dbdInfo, activeBuild.perks]);
  useEffect(() => {
    twitch.onAuthorized(async ({ token, userId }) => {
      const auth = new Authentication(token, userId);
      // socket.on("new_build", (build?: string) => {
      //   const newBuild = build ? JSON.parse(build) : defaultBuild;
      //   if (newBuild) setActiveBuild(newBuild);
      // });
      // socket.once("new_build", (build?: string) => {
      //   const newBuild = build ? JSON.parse(build) : defaultBuild;
      //   if (newBuild) setBuildForm(newBuild);
      // });
      // socket.on("set_build_error", console.error);
      // socket.emit("get_build");
      const killers = await auth.getKillerNames();
      const killerAddons = await auth.getKillerAddons();
      const addons = await auth.getAddons();
      const perks = await auth.getPerks();
      setAuth(auth);
      setDbdInfo({ addons, killerAddons, killers, perks });
      // setSocket(socket);
    });
    twitch.onContext((context, delta) => {
      if (delta.includes("mode")) setTheme(context.theme);
    });
    twitch.configuration.onChanged(() => {
      if (twitch.configuration.broadcaster)
        setConfig(JSON.parse(twitch.configuration.broadcaster.content));
    });
  }, []);

  if (!dbdInfo || !config || !auth) return <Loading />;

  const configText = (() => {
    switch (config.modsCanSet) {
      case ModeratorsCanSet.all:
        return "you and all of your moderators";
      case ModeratorsCanSet.some:
        return `you and these moderators: ${Object.values(config.modList)
          .filter((v) => v.allowed)
          .map((v) => v.name)
          .join(", ")}`;
      case ModeratorsCanSet.no:
        return "only you";
    }
  })();
  return (
    <div id="live-config-container" className={theme}>
      {buildMessage != null ? (
        <ModeratorBuildMessage
          className="broadcaster-build-message"
          content={content}
          type={type}
          onEnd={() => setBuildMessage(null)}
        />
      ) : null}
      <ModeratorControls
        clearBuild={clearBuild}
        resetBuild={resetBuild}
        publishBuild={async () => {
          const oldBuildMessage = buildMessage?.content;
          setBuildMessage(null);
          const newBuildMessage = validateBuild(buildForm, activeBuild);

          if (newBuildMessage && newBuildMessage.content !== oldBuildMessage)
            setBuildMessage(newBuildMessage);
          else publishBuild(buildForm);
          return { success: true }; // Won't be used since there's no MessageDisplay
        }}
      />
      <div className="intro-text">
        You can configure your current build here. Once you click{" "}
        <span className="bg-indigo-700 p-1 rounded-lg">Publish</span>, your
        viewers will be able to view your perks/addons and their descriptions.
      </div>
      <div className="w-full max-w-sm">
        At the moment <span className="font-bold">{configText}</span> are
        allowed to set builds.
        <br />
        You can change this in the extension configuration.
      </div>
      <div className="live-config-component items-center">
        <ModeSelect
          currentMode={buildForm.mode}
          onClick={(mode) => editBuild({ mode })}
        />
      </div>

      <div
        className={
          "live-config-component w-56" +
          (buildForm.mode !== "notPlaying" ? "" : " inactive")
        }
      >
        <label>Perks</label>
        {buildForm.mode !== "notPlaying" ? (
          <PerkList
            activePerkIndex={-1}
            rarityScalings={rarityScalings}
            activePerks={buildForm.perks}
            onClick={(idx) => {
              setPerkBeingSearched(idx);
            }}
            className="small"
            emptyStyle={{ cursor: "pointer", color: "rgb(113, 128, 150)" }}
            emptyClass="hover:bg-light-up"
          />
        ) : null}
      </div>
      <Modal
        open={perkBeingSearched != null}
        onClickOutside={() => setPerkBeingSearched(null)}
      >
        <PerkSearch
          initialValue={buildForm?.perks[perkBeingSearched!]?.[0]}
          allPerks={dbdInfo.perks}
          withRank={true}
          onChange={(perk, rank, valid) => {
            if (!valid) return;
            const perksCopy = [...buildForm.perks];
            perksCopy[perkBeingSearched!] = perk
              ? [perk, rank as PerkRank]
              : null;

            editBuild({ perks: perksCopy });
            setPerkBeingSearched(null);
          }}
          initialRank={buildForm?.perks[perkBeingSearched!]?.[1]}
          constraints={{
            mode: buildForm.mode !== "notPlaying" ? buildForm.mode : "any",
            exclude: filterNull(
              buildForm.perks.map<string | null | undefined>((perk, idx) =>
                idx !== perkBeingSearched ? perk?.[0] : null
              )
            ),
          }}
        />
      </Modal>

      <div
        className={
          "live-config-component " +
          (buildForm.mode !== "killer" ? "inactive" : "")
        }
      >
        <label>Killer Name</label>
        {buildForm.mode === "killer" ? (
          <KillerSearch
            value={buildForm.killerName ?? ""}
            killerInfo={dbdInfo.killers}
            onChange={(input) => editBuild({ killerName: input })}
            onBlur={() => {
              if (buildForm.killerName === "") editBuild({ killerName: null });
            }}
          />
        ) : null}
      </div>

      <div
        className={
          "live-config-component " +
          (buildForm.mode !== "killer" || !buildForm.killerName
            ? " inactive"
            : "")
        }
      >
        <label>Addons</label>
        {buildForm.killerName ? (
          <>
            <AddonList
              activeAddon={-1}
              activeAddons={buildForm.addons}
              onClick={(idx) => setAddonBeingSearched(idx)}
              emptyStyle={
                buildForm.killerName
                  ? { cursor: "pointer", color: "rgb(113, 128, 150)" }
                  : { cursor: "not-allowed" }
              }
              emptyClass={buildForm.killerName ? "hover:bg-light-up" : ""}
            />
            <Modal
              open={addonBeingSearched != null}
              onClickOutside={() => setAddonBeingSearched(null)}
            >
              <AddonSearch
                initialValue={
                  addonBeingSearched && buildForm?.addons
                    ? buildForm.addons[addonBeingSearched]
                    : null
                }
                killer={buildForm.killerName}
                killerAddons={dbdInfo.killerAddons}
                killerPowers={dbdInfo.killers}
                exclude={[
                  buildForm!.addons![(addonBeingSearched! + 1) % 2] ?? "",
                ]}
                onChange={(addon, valid) => {
                  if (!valid) return;
                  const addonsCopy: [string | null, string | null] = [
                    ...buildForm.addons!,
                  ];
                  addonsCopy[addonBeingSearched!] = addon;
                  editBuild({ addons: addonsCopy });
                  setAddonBeingSearched(null);
                }}
              />
            </Modal>
          </>
        ) : (
          addonEmptyText()
        )}
      </div>
    </div>
  );
};

export default LiveConfigPage;
