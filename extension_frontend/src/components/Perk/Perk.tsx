import React, { CSSProperties } from "react";
import { PerkRank } from "../../types";
import Asset from "../Asset/Asset";
import "./Perk.css";

const RankIndicator: React.FC<{ rank: PerkRank }> = ({ rank }) => {
  return (
    <ul className="rank-container">
      <div />
      <div className={rank > 0 ? " visible" : " invisible"} />
      <div className={rank > 1 ? " visible" : " invisible"} />
    </ul>
  );
};

interface Props {
  perkName: string;
  rank: PerkRank;
  active: boolean;
  icon: ReturnType<typeof Asset> | null;
  background: ReturnType<typeof Asset>;
  onClick: () => void;
  style?: CSSProperties;
  [index: string]: any;
}

const Perk: React.FC<Props> = ({
  active,
  perkName,
  rank,
  icon,
  background,
  style,
  className,
  onClick,
  ...rest
}) => {
  return (
    <button
      className={"perk-container " + (active ? "active " : "") + className}
      onClick={onClick}
      style={style}
      {...rest}
    >
      <picture>
        {icon != null ? <RankIndicator rank={rank} /> : null}
        {icon}
        {background}
      </picture>
      {perkName}
    </button>
  );
};

export default Perk;
