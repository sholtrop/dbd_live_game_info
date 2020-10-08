import React, { useState, useEffect } from "react";
import "./ModeratorView.css";
import {
  Build,
  PerkData,
  KillerPowers,
  PerkRank,
  BuildMessage,
  KillerAddons,
  RarityScalings,
} from "../../types";
import {
  InfoIcon,
  KillerIcon,
  SurvivorIcon,
  NotPlayingIcon,
} from "../Icons/Icons";
import {
  assertRarityScalings,
  filterNull,
  getBuildEditor,
  validateBuild,
} from "../../util";
import PerkList from "../PerkList/PerkList";
import AddonList from "../AddonList/AddonList";
import KillerSearch from "../KillerSearch/KillerSearch";
import Modal from "../Modal/Modal";
import PerkSearch from "../PerkSearch/PerkSearch";
import AddonSearch from "../AddonSearch/AddonSearch";
import Loading from "../Loading/Loading";

const ModeratorInfo: React.FC = () => (
  <div id="mod-info">
    <InfoIcon />
    This screen can only be accessed by moderators or the broadcaster.
    <ul>
      <li>Set the current perks/addons the broadcaster is using here.</li>
      <li>
        These will then be visible for <b>any viewer</b> of the stream
      </li>
    </ul>
    <div className="sub-info">
      Changes will only be made live after you click Publish
    </div>
  </div>
);

interface ModeratorBuildMessageProps {
  type?: BuildMessage["type"];
  content?: BuildMessage["content"];
  durationMs?: number;
  onEnd?: () => void;
  className?: string;
}

export const ModeratorBuildMessage: React.FC<ModeratorBuildMessageProps> = ({
  type,
  content,
  durationMs = 10000,
  onEnd = () => {},
  className = "",
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnd();
    }, durationMs);
    return () => {
      clearTimeout(timer);
      onEnd();
    };
  }, []);
  return (
    <div className={`moderator-controls-message ${className} ${type}`}>
      {content ? <div className={"message " + type}>{content}</div> : null}
    </div>
  );
};

interface ModeratorControlsProps {
  verifyBuild?: () => BuildMessage | null;
  publishBuild: () => Promise<{ success: boolean; message?: string }>;
  resetBuild: () => void;
  clearBuild: () => void;
  className?: string;
  MessageDisplay?: React.ReactElement;
}

export const ModeratorControls: React.FC<ModeratorControlsProps> = ({
  verifyBuild,
  publishBuild,
  resetBuild,
  clearBuild,
  className,
  MessageDisplay,
}) => {
  const [buildMessage, setBuildMessage] = useState<BuildMessage | null>(null);
  const { type, content } = buildMessage ?? {};
  const showBuildMessage = (message: BuildMessage) => {
    if (!message) return;
    setBuildMessage(message);
  };
  const handlePublish = async () => {
    setBuildMessage({
      content: (
        <Loading
          message={
            <span className="text-base text-purple-200">Sending build...</span>
          }
          timeoutMessage={
            <span className="text-base text-purple-200">
              Something went wrong sending the build. Please try refreshing.
            </span>
          }
        />
      ),
      type: "pending",
    });
    const { content, type } = verifyBuild?.() ?? {};
    if (content && type && content !== buildMessage?.content) {
      showBuildMessage({ type, content });
      return;
    }
    const { success, message } = await publishBuild();
    if (success)
      showBuildMessage({
        type: "success",
        content: message ?? "Successfully published build!",
      });
    else
      showBuildMessage({
        type: "error",
        content:
          message ??
          "Something went wrong trying to publish the build. Please try again later.",
      });
  };
  const Display = MessageDisplay
    ? React.cloneElement(MessageDisplay, {
        content,
        type,
        onEnd: () => setBuildMessage(null),
      })
    : null;
  return (
    <div id="moderator-controls" className={className}>
      <div className="mod-message-display">{Display}</div>
      <ul className="main-buttons">
        <button
          className="bg-indigo-700 hover:bg-indigo-600"
          onClick={MessageDisplay ? handlePublish : publishBuild}
          title="Set this build as the new live build"
        >
          Publish
        </button>
        <button
          className="bg-indigo-900 hover:bg-indigo-800"
          onClick={resetBuild}
          title="Reset to the currently live build"
        >
          Restore
        </button>
        <button
          className="border border-gray-700 hover:bg-gray-800"
          onClick={clearBuild}
          title="Empty all perks and addons"
        >
          Clear
        </button>
      </ul>
    </div>
  );
};

interface ModeSelectProps {
  onClick: (mode: Build["mode"]) => void;
  currentMode: Build["mode"];
}

export const ModeSelect: React.FC<ModeSelectProps> = ({
  onClick,
  currentMode,
}) => {
  return (
    <div className="mode">
      <label>Mode</label>
      <button
        onClick={() => onClick("killer")}
        className={
          "game-mode killer" + (currentMode === "killer" ? " active" : "")
        }
      >
        <KillerIcon /> <div>Killer</div>
      </button>
      <button
        className={
          "game-mode survivor" + (currentMode === "survivor" ? " active" : "")
        }
        onClick={() => onClick("survivor")}
      >
        <SurvivorIcon />
        <div>Survivor</div>
      </button>
      <button
        className={
          "not-playing" + (currentMode === "notPlaying" ? " active" : "")
        }
        onClick={() => onClick("notPlaying")}
      >
        <NotPlayingIcon /> <div>Not Playing</div>
      </button>
    </div>
  );
};

interface Props {
  allPerks: PerkData;
  killerAddons: KillerAddons;
  allKillers: KillerPowers;
  initialForm: Build;
  onPublish: (build: Build) => Promise<{ success: boolean }>;
}

const ModeratorView: React.FC<Props> = ({
  allPerks,
  killerAddons,
  allKillers,
  initialForm,
  onPublish,
}) => {
  const [buildForm, setBuildForm] = useState<Build>({ ...initialForm });
  const [perkBeingSearched, setPerkBeingSearched] = useState<null | number>(
    null
  );
  const [addonBeingSearched, setAddonBeingSearched] = useState<null | number>(
    null
  );
  const [rarityScalings, setRarityScalings] = useState<RarityScalings>([
    null,
    null,
    null,
    null,
  ]);
  useEffect(() => {
    if (buildForm.mode === "notPlaying") return;
    const { mode } = buildForm;
    const rarities = buildForm.perks.map((perk) => {
      if (perk === null) return null;
      const perkName = perk[0];
      return allPerks[mode][perkName].rarityScaling;
    });
    if (assertRarityScalings(rarities)) setRarityScalings(rarities);
    else throw Error("Fewer than 4 rarities in rarity scaling");
  }, [buildForm.perks]);
  const buildFormEqualsLive =
    JSON.stringify(buildForm) === JSON.stringify(initialForm);
  const publishBuild = async (
    build: Build
  ): Promise<{ success: boolean; message?: string }> => {
    if (!buildFormEqualsLive) return await onPublish(build);
    return {
      success: false,
      message: "This build is the same as the live build",
    };
  };
  const resetBuild = () => editBuild({ ...initialForm });
  const editBuild = getBuildEditor(buildForm, initialForm, setBuildForm);
  const clearBuild = () => {
    const { mode } = buildForm;
    editBuild({
      perks: Array(4).fill(null),
      addons: mode === "killer" ? [null, null] : null,
      killerName: null,
    });
  };

  const handleKillerNameChange = (input: string, valid: boolean) => {
    editBuild({ killerName: input });
  };
  const killerActive = buildForm.mode === "killer";
  const addonsActive = killerActive && buildForm.killerName != null;
  const perksActive = buildForm.mode !== "notPlaying";
  return (
    <div id="moderator-view">
      <div id="viewport-too-small">
        This view is not optimized for smaller viewports
      </div>
      <ModeratorInfo />
      <ModeratorControls
        clearBuild={clearBuild}
        publishBuild={() => publishBuild(buildForm)}
        resetBuild={resetBuild}
        verifyBuild={() => validateBuild(buildForm)}
        MessageDisplay={<ModeratorBuildMessage />}
      />

      <ModeSelect
        onClick={(mode) => editBuild({ mode })}
        currentMode={buildForm.mode}
      />

      <div className="killer-select">
        <label className={killerActive ? "" : "inactive"}>Killer</label>
        {killerActive ? (
          <KillerSearch
            value={buildForm.killerName ?? ""}
            killerInfo={allKillers}
            onChange={handleKillerNameChange}
            onBlur={() =>
              buildForm.killerName === "" && editBuild({ killerName: null })
            }
          />
        ) : null}
      </div>

      <div className="perk-select">
        <label className={perksActive ? "" : "inactive"}>Perks</label>
        {perksActive ? (
          <PerkList
            activePerks={buildForm.perks}
            rarityScalings={rarityScalings}
            activePerkIndex={-1}
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
        onClickOutside={() => setPerkBeingSearched(null)}
        open={perkBeingSearched != null}
        className="perk-select-modal"
      >
        <p>Search for a {buildForm.mode} perk and set its rank:</p>
        <PerkSearch
          allPerks={allPerks}
          initialRank={buildForm?.perks[perkBeingSearched!]?.[1]}
          constraints={{
            mode: buildForm.mode !== "notPlaying" ? buildForm.mode : "any",
            exclude: filterNull(
              buildForm.perks.map<string | null | undefined>((perk, idx) =>
                idx !== perkBeingSearched ? perk?.[0] : null
              )
            ),
          }}
          initialValue={buildForm?.perks[perkBeingSearched!]?.[0]}
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
        />
      </Modal>

      <div className="addon-select">
        <label className={addonsActive ? "" : "inactive"}>Addons</label>
        {addonsActive ? (
          <AddonList
            activeAddons={buildForm.addons}
            activeAddon={-1}
            onClick={(idx) => {
              if (!buildForm.killerName) return;
              setAddonBeingSearched(idx);
            }}
            emptyStyle={
              buildForm.killerName
                ? { cursor: "pointer", color: "rgb(113, 128, 150)" }
                : { cursor: "not-allowed" }
            }
            emptyClass={buildForm.killerName ? "hover:bg-light-up" : ""}
          />
        ) : null}
      </div>

      <Modal
        onClickOutside={() => setAddonBeingSearched(null)}
        open={addonBeingSearched != null}
        className="addon-select-modal"
      >
        <p>
          Search for an addon for The{" "}
          <span className="capitalize">{buildForm.killerName}</span>:
        </p>
        {buildForm.addons != null && buildForm.killerName != null ? (
          <AddonSearch
            killerAddons={killerAddons}
            killerPowers={allKillers}
            onChange={(addon, valid) => {
              if (!valid) return;
              const addonsCopy: [string | null, string | null] = [
                ...buildForm.addons!,
              ];
              addonsCopy[addonBeingSearched!] = addon;
              editBuild({ addons: addonsCopy });
              setAddonBeingSearched(null);
            }}
            initialValue={
              addonBeingSearched != null && buildForm?.addons
                ? buildForm.addons[addonBeingSearched]
                : null
            }
            killer={buildForm?.killerName ?? ""}
            exclude={[buildForm!.addons![(addonBeingSearched! + 1) % 2] ?? ""]}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default ModeratorView;
