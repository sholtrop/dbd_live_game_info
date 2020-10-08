import React from "react";
import { BroadCasterConfig, BuildRequestsEnabledFor } from "../../types";
import "./RequestBuildView.css";

interface RequestBuildViewProps {
  broadcasterConfig: BroadCasterConfig;
}

const RequestBuildView: React.FC<RequestBuildViewProps> = ({
  broadcasterConfig,
}) => {
  const { enabledFor: enabled } = broadcasterConfig.buildRequests;
  if (enabled === BuildRequestsEnabledFor.anyone) {
  }
  return <div></div>;
};

export default RequestBuildView;
