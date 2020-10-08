import React, { useState, useRef, useEffect } from "react";
import "./PerkSearch.css";
import { PerkData, PerkSearchConstraints } from "../../types";
import { SearchIcon } from "../Icons/Icons";
import Asset from "../Asset/Asset";
import { perksFor } from "../../util";

interface RankSelectorProps {
  onChange: (rank: number) => void;
  initialRank: number;
}

const RankSelector: React.FC<RankSelectorProps> = ({
  onChange,
  initialRank,
}) => {
  const [rank, setRank] = useState(initialRank);
  const changeRank = (rank: number) => {
    setRank(rank);
    onChange(rank);
  };
  return (
    <ul className="rank-selector space-x-1">
      <button
        className={"text-yellow-400 " + (rank === 0 ? "active" : "")}
        onClick={() => changeRank(0)}
      >
        1
      </button>

      <button
        className={"text-green-400 " + (rank === 1 ? "active" : "")}
        onClick={() => changeRank(1)}
      >
        2
      </button>

      <button
        className={"text-purple-300 " + (rank === 2 ? "active" : "")}
        onClick={() => changeRank(2)}
      >
        3
      </button>
    </ul>
  );
};

interface PerkSearchResultsProps {
  results: string[];
  onClick: (result: string) => void;
}

const PerkSearchResults: React.FC<PerkSearchResultsProps> = ({
  results,
  onClick,
}) => {
  if (results.length === 0)
    return (
      <div className="perk-search-no-results">
        Your search didn't return anything
      </div>
    );

  return (
    <ul className="perk-search-results">
      {results.map((perk) => (
        <li key={perk}>
          <button onClick={() => onClick(perk)}>
            <Asset assetName={perk} />
            {perk}
          </button>
        </li>
      ))}
    </ul>
  );
};

interface Props {
  allPerks: PerkData;
  constraints?: PerkSearchConstraints;
  initialValue?: string;
  initialRank?: number | null;
  withRank?: boolean;
  onChange: (perk: string | null, rank: number, valid: boolean) => void;
}

const PerkSearch: React.FC<Props> = ({
  allPerks,
  constraints,
  initialValue = "",
  initialRank,
  withRank = false,
  onChange,
}) => {
  const [input, setInput] = useState<string | null>(initialValue);
  const [rank, setRank] = useState<number>(initialRank ? initialRank : 2);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const mode = constraints?.mode ?? "any";
  const perks = perksFor(mode, allPerks);
  const results: string[] =
    input == null
      ? []
      : perks.filter((perk) => {
          if (constraints?.exclude && constraints.exclude.includes(perk))
            return false;
          return perk.toLowerCase().includes(input.toLowerCase().trim());
        });
  const handlePerkClick = (perkName: string | null) => {
    setInput(perkName);
    onChange(perkName, rank, true);
  };
  const changeInput = (input: string) => {
    setInput(input);
    onChange(input, rank, false);
  };
  const changeRank = (rank: number) => {
    setRank(rank);
    const quitImmediately = !!initialValue && input === initialValue;
    onChange(input, rank, quitImmediately);
  };
  return (
    <div id="perk-search">
      <div className="perk-search-input-container">
        <div className="flex">
          <input
            type="text"
            onChange={({ target }) => changeInput(target.value)}
            onFocus={({ target }) => target.select()}
            value={input ?? ""}
            ref={inputRef}
          />
          <SearchIcon />
          {withRank ? (
            <RankSelector
              onChange={(rank) => changeRank(rank)}
              initialRank={rank}
            />
          ) : null}

          {initialValue !== "" ? (
            <button
              onClick={() => handlePerkClick(null)}
              className="unset-button"
            >
              Unset perk
            </button>
          ) : null}
        </div>
      </div>

      <PerkSearchResults results={results} onClick={handlePerkClick} />
    </div>
  );
};

export default PerkSearch;
