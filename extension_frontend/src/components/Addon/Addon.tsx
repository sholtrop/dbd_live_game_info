import React from "react";
import "./Addon.css";
import Asset from "../Asset/Asset";

interface Props {
  addonName?: string;
  active: boolean;
  icon: ReturnType<typeof Asset>;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Addon: React.FC<Props> = ({
  addonName,
  icon,
  onClick,
  active,
  className = "",
  style = {},
}) => (
  <button
    className={"addon-container" + (active ? " active " : " ") + className}
    onClick={onClick}
    style={style}
  >
    {icon}
    {addonName}
  </button>
);

export default Addon;
