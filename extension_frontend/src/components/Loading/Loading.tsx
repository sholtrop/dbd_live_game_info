import React, { useState, useEffect } from "react";
import "./Loading.css";

interface Props {
  timeoutMs?: number;
  message?: string | React.ReactElement;
  timeoutMessage?: string | React.ReactElement;
}

const Loading: React.FC<Props> = ({
  message = "Loading...",
  timeoutMessage = "Something went wrong, please try again later",
  timeoutMs = 10000,
}) => {
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="loading">
      {!loadingTimedOut ? (
        <>
          <div className="loading-circle" />
          <div>{message}</div>
        </>
      ) : (
        <div className="flex flex-col">{timeoutMessage}</div>
      )}
    </div>
  );
};

export default Loading;
