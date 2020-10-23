import React, { useEffect, useState } from "react";
import {
  BroadCasterConfig,
  Build,
  BuildRequestsEnabledFor,
  KillerPowers,
} from "../../types";
import KillerSearch from "../KillerSearch/KillerSearch";
import { defaultBuild } from "../App/App";
import "./RequestBuildView.css";
import { getBuildEditor } from "../../util";

interface ModeSelectProps {
  onChange: (value: "survivor" | "killer") => void;
  currentMode: string;
}

const ModeSelect: React.FC<ModeSelectProps> = ({ onChange, currentMode }) => {
  return (
    <div id="mode-select">
      Side to play:
      <button>Survivor</button>
      <button>Killer</button>
    </div>
  );
};

interface RequestBuildViewProps {
  broadcasterConfig: BroadCasterConfig;
  killerPowers: KillerPowers;
}

const RequestBuildView: React.FC<RequestBuildViewProps> = ({
  broadcasterConfig,
  killerPowers,
}) => {
  const [infoText, setInfoText] = useState<React.ReactElement | null>(null);
  const [buildForm, setBuildForm] = useState<Build>(defaultBuild);
  const editBuild = getBuildEditor(buildForm, defaultBuild, setBuildForm);
  useEffect(() => {
    console.log("run effect");
    const { enabledFor } = broadcasterConfig.buildRequests;
    if (enabledFor === BuildRequestsEnabledFor.anyone)
      setInfoText(
        <div>
          <strong>Any viewer</strong> can request a build
        </div>
      );
    else if (enabledFor === BuildRequestsEnabledFor.subscribers)
      setInfoText(
        <div>
          <strong>Subscribers</strong> can request a build
        </div>
      );
    else if (enabledFor === BuildRequestsEnabledFor.bitgivers)
      setInfoText(<div>You can use bits to request a build</div>);
  }, [broadcasterConfig.buildRequests.enabledFor]);
  // console.log({ infoText });
  return (
    <div id="request-container">
      <div className="info-text">{infoText}</div>
      <ModeSelect
        currentMode={buildForm.mode}
        onChange={(mode) => editBuild({ mode })}
      />
      <KillerSearch
        killerInfo={killerPowers}
        value={buildForm.killerName ?? ""}
        onChange={(input) => editBuild({ killerName: input })}
        onBlur={() => buildForm.killerName && editBuild({ killerName: null })}
      />
    </div>
  );
};

export default RequestBuildView;
