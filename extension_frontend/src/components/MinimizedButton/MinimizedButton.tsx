import React from "react";
import { BuildViewIcon } from "../Icons/Icons";
import "./MinimizedButton.css";

interface Props {
  onClick: () => void;
  visible: boolean;
}

const MinimizedButton: React.FC<Props> = ({ onClick, visible }) => {
  return (
    <button
      title="View current build info"
      id="minimized-button"
      className={visible ? "in-view" : ""}
      onClick={onClick}
    >
      <div className="group flex flex-col items-center">
        <BuildViewIcon
          className="w-full h-full mb-1 flex-shrink-0 group-hover:scale-125"
          colored={true}
        />
        <span>Build Info</span>
      </div>
    </button>
  );
};

export default MinimizedButton;
