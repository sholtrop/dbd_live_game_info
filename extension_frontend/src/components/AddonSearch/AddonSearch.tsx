import React, { useState, useRef, useEffect } from "react";
import "./AddonSearch.css";
import { KillerAddons, KillerPowers } from "../../types";
import { capitalize } from "../../util";
import { SearchIcon } from "../Icons/Icons";
import Asset from "../Asset/Asset";

interface AddonSearchResultsProps {
  results: string[];
  onClick: (result: string) => void;
}

const AddonSearchResults: React.FC<AddonSearchResultsProps> = ({
  results,
  onClick,
}) => {
  if (results.length === 0)
    return (
      <div className="perk-search-no-results">
        Your search didn't return anything
      </div>
    );

  // Uses the same css as the PerkSearch results
  return (
    <ul className="perk-search-results">
      {results.map((addon) => (
        <li key={addon}>
          <button onClick={() => onClick(addon)}>
            <Asset assetName={addon} />
            {addon}
          </button>
        </li>
      ))}
    </ul>
  );
};

interface Props {
  killerAddons: KillerAddons;
  killerPowers: KillerPowers;
  killer: string;
  exclude?: string[];
  initialValue?: string | null;
  onChange: (addon: string | null, valid: boolean) => void;
}

const AddonSearch: React.FC<Props> = ({
  killerAddons,
  killerPowers,
  killer,
  initialValue = "",
  exclude = [],
  onChange,
}) => {
  const [input, setInput] = useState<string | null>(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const changeInput = (input: string) => {
    setInput(input);
    onChange(input, false);
  };
  const handleAddonClick = (addonName: string | null) => {
    setInput(addonName);
    onChange(addonName, true);
  };
  const theKillerName = `The ${capitalize(killer)}`;
  const currentKillerPower = killerPowers[theKillerName];
  const results = Object.keys(killerAddons[currentKillerPower]).filter(
    (addonName) => {
      const normalizedInput = input?.toLowerCase().trim();
      const normalizedAddon = addonName.toLowerCase();
      return (
        !exclude.includes(addonName) &&
        normalizedAddon.includes(normalizedInput ?? "")
      );
    }
  );
  return (
    <div id="addon-search-container">
      <div id="addon-search">
        <div className="addon-search-input-container">
          <div className="flex">
            <input
              type="text"
              onChange={({ target }) => changeInput(target.value)}
              value={input ?? ""}
              ref={inputRef}
            />
            <SearchIcon />
          </div>
        </div>

        <AddonSearchResults results={results} onClick={handleAddonClick} />
      </div>
      <div className="flex flex-col w-1/2">
        {/* <div id="cannot-find-addon-info">
          Some addons are missing for certain killers. If you can't find the
          addon, please leave it Empty for now. This issue is being worked on.
        </div> */}
        {initialValue != null ? (
          <button
            className="unset-button"
            onClick={() => handleAddonClick(null)}
          >
            Unset addon
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AddonSearch;
