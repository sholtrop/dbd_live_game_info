import React, { useEffect, useState } from "react";
import "./BuildView.css";
import {
  Build,
  PerkData,
  AddonData,
  UserRole,
  InfoTextTree,
  KillerPowers,
  RarityScalings,
} from "../../types";
import PlayingIndicator from "../PlayingIndicator/PlayingIndicator";
import PerkList from "../PerkList/PerkList";
import AddonList from "../AddonList/AddonList";
import PerkDescription from "../PerkDescription/PerkDescription";
import { assertRarityScalings, capitalize } from "../../util";

interface Props {
  allPerks: PerkData;
  allAddons: AddonData;
  allPowers: KillerPowers;
  activeBuild: Build;
  streamer: string;
  userRole: UserRole;
}

const BuildView: React.FC<Props> = ({
  activeBuild,
  allAddons,
  allPerks,
  allPowers,
  streamer,
  userRole,
}) => {
  const [activeElement, setActiveElement] = useState(0);
  const [
    activeDescription,
    setActiveDescription,
  ] = useState<InfoTextTree | null>(null);
  const [rarityScalings, setRarityScalings] = useState<RarityScalings>([
    null,
    null,
    null,
    null,
  ]);
  const {
    mode,
    killerName,
    perks: activePerks,
    addons: activeAddons,
  } = activeBuild;
  const currentPerkNames = activePerks.reduce(
    (total: (string | null)[], perk) => [...total, perk?.[0] ?? null],
    []
  );

  const theKillerName = killerName ? `The ${capitalize(killerName)}` : null;
  const killerPower = theKillerName ? allPowers[theKillerName] : null;

  useEffect(() => {
    if (
      mode !== "notPlaying" &&
      !activePerks[activeElement] &&
      !activeAddons?.[activeElement]
    )
      setActiveElement(0);
  }, [activeBuild]);

  useEffect(() => {
    if (mode === "notPlaying") {
      setActiveDescription(null);
      return;
    }
    const rarities = activePerks.map((perk) => {
      if (perk === null) return null;
      const perkName = perk[0];
      return allPerks[mode][perkName].rarityScaling;
    });
    if (assertRarityScalings(rarities)) setRarityScalings(rarities);
    else throw Error("Fewer than 4 rarities in rarity scaling");
    // activeElement is a Perk
    if (activeElement <= 3) {
      const activePerkName = currentPerkNames[activeElement];
      const activePerk = activePerkName ? allPerks[mode][activePerkName] : null;
      setActiveDescription(activePerk?.text ?? null);
    }
    // activeElement is an Addon
    else {
      killerName || console.error("KillerName was nullish:", { killerName });
      const activeAddonName = activeAddons?.[activeElement - 4] ?? "";
      const activeAddonDesc = allAddons[killerPower!][activeAddonName];
      setActiveDescription(activeAddonDesc);
    }
  }, [activeElement, activeBuild]);

  const changeActiveElement = (idx: number) => {
    if (activePerks[idx] || activeAddons?.[idx - 4]) setActiveElement(idx);
  };
  return (
    <div id="build-view">
      <PlayingIndicator
        mode={mode}
        playingAs={mode === "killer" ? killerName : "Survivor"}
        streamer={streamer}
        userRole={userRole}
      />
      {mode !== "notPlaying" ? (
        <PerkList
          className="perk-list"
          rarityScalings={rarityScalings}
          activePerks={activePerks}
          onClick={(idx) => changeActiveElement(idx)}
          activePerkIndex={activeElement}
        />
      ) : null}
      {activeAddons != null ? (
        <AddonList
          className="addon-list"
          activeAddon={activeElement - 4}
          activeAddons={activeAddons}
          onClick={(idx: number) => changeActiveElement(idx + 4)}
        />
      ) : null}
      <PerkDescription
        className="perk-description"
        infoText={activeDescription}
      />
    </div>
  );
};

export default BuildView;
