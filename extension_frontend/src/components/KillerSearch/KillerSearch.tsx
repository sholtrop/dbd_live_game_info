import React, { useEffect, useState } from "react";
import "./KillerSearch.css";
import { KillerPowers } from "../../types";
import Asset from "../Asset/Asset";
import { capitalize } from "../../util";

interface KillerSearchResultsProps {
  killerNames: string[];
  input: string;
  onClick: (input: string) => void;
  visible: boolean;
}

const KillerSearchResults: React.FC<KillerSearchResultsProps> = ({
  killerNames,
  input,
  onClick,
  visible,
}) => {
  return (
    <ul className={"killer-search-results" + (!visible ? " invisible" : "")}>
      {killerNames
        .filter((name) => name.includes(input.toLowerCase()) && name !== input)
        .map((result) => (
          <li key={result} className="flex items-center">
            <Asset
              assetName={capitalize(result) + "_image"}
              className="w-10 h-10"
            />
            <button onMouseDown={() => onClick(result)}>{result}</button>
          </li>
        ))}
    </ul>
  );
};

interface Props {
  killerInfo: KillerPowers;
  value: string;
  onChange: (input: string, valid: boolean) => void;
  onBlur: () => void;
}

const KillerSearch: React.FC<Props> = ({
  killerInfo,
  value,
  onChange,
  onBlur,
}) => {
  const [hasValidInput, setHasValidInput] = useState(Boolean(value));

  const [focused, setFocused] = useState(false);
  const killerNames = Object.keys(killerInfo).map((name) =>
    name.split("The ")[1].toLowerCase()
  );
  const validateInput = (input: string) => killerNames.includes(input);
  useEffect(() => {
    const valid = validateInput(value);
    if (!valid) setHasValidInput(false);
  }, [value]);
  const handleUserInput = (input: string) => {
    const valid = validateInput(input);
    setHasValidInput(valid);
    onChange(input, valid);
  };
  const handleFocus = () => {
    if (hasValidInput) handleUserInput("");
    setFocused(true);
  };
  const handleBlur = () => {
    if (!hasValidInput) handleUserInput("");
    setFocused(false);
    onBlur();
  };

  return (
    <div className="killer-search-container">
      <div className="relative">
        {hasValidInput ? (
          <Asset
            assetName={capitalize(value) + "_image"}
            className={
              "w-8 ml-1 absolute left-0 bottom-0" +
              (hasValidInput ? "" : "invisible")
            }
            style={{
              marginBottom: "0.1rem",
              height: "2.2rem",
            }}
          />
        ) : null}
        <input
          className={
            "killer-search-bar " + (hasValidInput && value ? " valid" : "")
          }
          type="text"
          onChange={({ target }) => handleUserInput(target.value)}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      <KillerSearchResults
        killerNames={killerNames}
        input={value}
        onClick={handleUserInput}
        visible={focused}
      />
    </div>
  );
};

export default KillerSearch;
