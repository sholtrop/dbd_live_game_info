import React from "react";
import "./ShareIdentityView.css";

interface Props {
  onShare: () => void;
}

const ShareIdentityView: React.FC<Props> = ({ onShare }) => {
  return (
    <div id="share-identity">
      <p>
        If you are a moderator of this channel and want to be able to set the
        build, you will have to share your identity with this extension:
      </p>
      <button onClick={onShare}>Share identity</button>
      <p className="no-effect">
        If you are not a moderator this has no effect at all.
      </p>
      <p>
        After doing this, the extension will be able to see whether you are a
        moderator or not, and grant you the appropriate rights.
      </p>
    </div>
  );
};

export default ShareIdentityView;
