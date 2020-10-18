import React, { useEffect, useState } from "react";
import { BroadCasterConfig, BuildRequestsEnabledFor } from "../../types";
import "./RequestBuildView.css";

interface RequestBuildViewProps {
  broadcasterConfig: BroadCasterConfig;
}

const RequestBuildView: React.FC<RequestBuildViewProps> = ({
  broadcasterConfig,
}) => {
  const [infoText, setInfoText] = useState("");
  useEffect(() => {
    console.log("run effect");
    const { enabledFor } = broadcasterConfig.buildRequests;
    if (enabledFor === BuildRequestsEnabledFor.anyone)
      setInfoText(`Currently, any viewer can request a build`);
    else if (enabledFor === BuildRequestsEnabledFor.subscribers)
      setInfoText(`Currently, subscribers can request a build`);
    else if (enabledFor === BuildRequestsEnabledFor.bitgivers)
      setInfoText(`Currently, you can use bits to request a build`);
  }, [broadcasterConfig.buildRequests.enabledFor]);
  console.log({ infoText });
  return (
    <div id="request-container">
      <div className="info-text">
        {infoText +
          (broadcasterConfig.displayName
            ? ` from ${broadcasterConfig.displayName}`
            : ``)}
      </div>
    </div>
  );
};

export default RequestBuildView;
