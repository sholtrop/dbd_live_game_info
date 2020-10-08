import React from "react";

interface Props {
  assetName: string;
  [index: string]: any;
}

const IMAGE_BASE_URL =
  "https://res.cloudinary.com/sholtrop/image/upload/v1600026415/";

const Asset: React.FC<Props> = ({ assetName, ...rest }) => {
  const normalizedName = assetName.replace(/[^A-Za-z0-9]+/g, "_");
  return <img src={IMAGE_BASE_URL + normalizedName + ".png"} {...rest} />;
};

export default Asset;
