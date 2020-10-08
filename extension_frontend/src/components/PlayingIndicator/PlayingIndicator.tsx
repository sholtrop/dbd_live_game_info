import React from "react";
import "./PlayingIndicator.css";
import { Build, UserRole } from "../../types";
import { SurvivorIcon } from "../Icons/Icons";
import Asset from "../Asset/Asset";
import { capitalize } from "../../util";

interface Props {
  playingAs: string | null;
  streamer: string;
  mode: Build["mode"];
  userRole: UserRole;
}

const PlayingIndicator: React.FC<Props> = ({
  playingAs,
  streamer,
  mode,
  userRole,
  ...rest
}) => {
  const admin = userRole === "broadcaster" || userRole === "moderator";

  if (mode !== "notPlaying")
    return (
      <div id="playing-indicator" {...rest}>
        <div className="flex items-center">
          <strong>{streamer}</strong> {streamer ? "playing" : "Playing"}
          <div className={"game-mode " + mode}>
            {mode === "survivor" ? (
              <SurvivorIcon />
            ) : (
              <Asset
                assetName={capitalize(playingAs!) + "_image"}
                className="w-8 h-10 m-0"
              />
            )}
            &nbsp;
            <span className="text-white">{playingAs}</span>
          </div>
          with this build:
        </div>
      </div>
    );
  else
    return (
      <div id="notplaying-indicator">
        <div>{streamer || "The broadcaster"} is not in game at the moment</div>
        <div className="no-build-info">
          {admin
            ? `Once they are in game, please set the build in the Settings panel.`
            : `If they *are* actually in game it means the build hasn't been set yet. 
          Ask the broadcaster or a moderator to set the build.`}
        </div>
      </div>
    );
};

export default PlayingIndicator;
