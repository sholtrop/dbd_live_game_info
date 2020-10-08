import React from "react";
import "./ViewContainer.css";

interface ViewContainerProps {}

const ViewContainer: React.FC<ViewContainerProps> = ({ children }) => {
  return <div id="view-container">{children}</div>;
};

export default ViewContainer;
