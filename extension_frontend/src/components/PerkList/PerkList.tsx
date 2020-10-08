import React, { CSSProperties } from "react";
import Perk from "../Perk/Perk";
import Asset from "../Asset/Asset";
import { PerkRarity, Perks, RarityScaling, RarityScalings } from "../../types";
import { resolvePerkRarity } from "../../util";

const defaultBackground = "empty";

interface Props {
  activePerks: Perks;
  activePerkIndex?: number | null;
  rarityScalings: RarityScalings;
  emptyName?: string;
  emptyStyle?: CSSProperties;
  emptyClass?: string;
  onClick: (perkIndex: number) => void;
  [index: string]: any;
}

const PerkList: React.FC<Props> = ({
  activePerks,
  activePerkIndex: activePerk,
  rarityScalings: rarityScaling,
  emptyName = "Empty",
  emptyStyle = { cursor: "not-allowed", color: "rgb(113, 128, 150)" },
  emptyClass = "",
  onClick,
  ...rest
}) => {
  return (
    <ul {...rest}>
      {[...Array(4).keys()].map((idx) => {
        const rank = activePerks[idx]?.[1] ?? 2;
        const name = activePerks[idx]?.[0];
        const rarity = resolvePerkRarity(rank, rarityScaling[idx]);
        return (
          <Perk
            perkName={name ?? emptyName}
            rank={rank}
            icon={name != null ? <Asset assetName={name} /> : null}
            background={<Asset assetName={rarity ?? defaultBackground} />}
            active={activePerk === idx}
            onClick={() => onClick(idx)}
            key={name ? name : emptyName + idx}
            style={name ? undefined : emptyStyle}
            className={name ? undefined : `empty ${emptyClass}`}
          />
        );
      })}
    </ul>
  );
};

export default PerkList;

//     @apply cursor-not-allowed text-gray-600;
