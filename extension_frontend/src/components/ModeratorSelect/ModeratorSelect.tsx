import React, { CSSProperties } from "react";
import "./ModeratorSelect.css";
import { Moderators, Single } from "../../types";

interface Props {
  moderators: Moderators | null;
  onChange: (id: string) => void;
  style?: CSSProperties;
}

const ModeratorSelect: React.FC<Props> = ({ moderators, onChange, style }) => {
  if (moderators == null || Object.keys(moderators).length === 0)
    return (
      <div className="no-mods">
        It seems like you don't have any moderators yet
      </div>
    );
  return (
    <ul id="moderator-select" style={style}>
      {Object.entries(moderators).map(([id, { name, allowed }]) => (
        <label key={id}>
          <input
            type="checkbox"
            onChange={() => onChange(id)}
            checked={allowed}
          />
          <span className="checkbox"></span>
          {name}
        </label>
      ))}
    </ul>
  );
};

export default ModeratorSelect;
