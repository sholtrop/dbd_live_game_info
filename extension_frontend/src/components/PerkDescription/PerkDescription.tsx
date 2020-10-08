import React from "react";
import { InfoTextTree } from "../../types";
import "./PerkDescription.css";

export const ParsedInfoText: React.FC<{ infoText: InfoTextTree }> = ({
  infoText,
}) => {
  return (
    <>
      {infoText.map((node) => {
        if (typeof node === "string")
          return /^[\.,:'"`\?.*]/.test(node) ? node : " " + node;
        else if (node.type === "ul")
          return (
            <ul>
              <ParsedInfoText infoText={node.content} />
            </ul>
          );
        else if (node.type === "b")
          return (
            <>
              {" "}
              <b>
                <ParsedInfoText infoText={node.content} />
              </b>
            </>
          );
        else if (node.type === "i")
          return (
            <>
              {" "}
              <i>
                <ParsedInfoText infoText={node.content} />
              </i>
            </>
          );
        else if (node.type === "p")
          return (
            <p>
              <ParsedInfoText infoText={node.content} />
            </p>
          );
        else if (node.type === "li")
          return (
            <li>
              <ParsedInfoText infoText={node.content} />
            </li>
          );
        else
          return (
            <>
              {" "}
              <span className={node.type}>
                <ParsedInfoText infoText={node.content} />
              </span>
            </>
          );
      })}
    </>
  );
};

interface Props {
  infoText: InfoTextTree | null;
  [index: string]: any;
}

const PerkDescription: React.FC<Props> = ({ infoText, ...rest }) => {
  return (
    <div {...rest} className="perk-description">
      {infoText ? <ParsedInfoText infoText={infoText} /> : null}
    </div>
  );
};

export default PerkDescription;
