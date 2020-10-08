import React from "react";
import { Addons } from "../../types";
import Addon from "../Addon/Addon";
import Asset from "../Asset/Asset";

interface Props {
  activeAddons: Addons;
  activeAddon: number;
  onClick: (idx: number) => void;
  emptyName?: string;
  emptyStyle?: React.CSSProperties;
  emptyClass?: string;
  [index: string]: any;
}

const AddonList: React.FC<Props> = ({
  activeAddons,
  activeAddon,
  onClick,
  emptyName = "Empty",
  emptyStyle = { cursor: "not-allowed", color: "rgb(113, 128, 150)" },
  emptyClass = "",
  ...rest
}) => {
  return (
    <ul {...rest}>
      {[0, 1].map((idx) => {
        const name = activeAddons?.[idx] ?? emptyName;
        const assetName = activeAddons?.[idx] ?? "emptyaddon";
        return (
          <Addon
            addonName={name ?? emptyName}
            icon={<Asset assetName={assetName} />}
            active={idx === activeAddon}
            onClick={() => onClick(idx)}
            key={name !== emptyName ? name : emptyName + idx}
            style={name !== emptyName ? undefined : emptyStyle}
            className={name === emptyName ? `empty ${emptyClass}` : undefined}
          />
        );
      })}
    </ul>
  );
};

export default AddonList;
