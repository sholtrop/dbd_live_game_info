/// <reference types="jest" />
import React from "react";
import Asset from "./Asset";
import { shallow } from "enzyme";

it("Renders a background asset", () => {
  const image = "rare.png";
  const component = shallow(<Asset assetName="rare" />);
  expect(component.find("img").prop("src")).toContain(image);
});

it("Renders perks correctly", () => {
  const images = [
    ["Dead Man\u2019s Switch\t", "Dead_Man_s_Switch_.png"],
    ["Monitor & Abuse", "Monitor_Abuse.png"],
    ["We're Gonna Live Forever", "We_re_Gonna_Live_Forever.png"],
  ];
  for (const [raw, processed] of images) {
    const component = shallow(<Asset assetName={raw} />);
    expect(component.find("img").prop("src")).toContain(processed);
  }
});

it("Renders an addon asset", () => {
  const image = "Akito_s_Crutch.png";
  const component = shallow(<Asset assetName="Akito_s_Crutch" />);
  expect(component.find("img").prop("src")).toContain(image);
});
