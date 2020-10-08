import React from "react";
import { shallow, render } from "enzyme";
import PlayingIndicator from "./PlayingIndicator";

// let container = null;
const { stringContaining } = expect;

// beforeEach(() => {
//   container = document.createcomponent("div");
//   document.body.appendChild(container);
// });

// afterEach(() => {
//   unmountComponentAtNode(container);
//   container.remove();
//   container = null;
// });

describe("Mode independent", () => {
  ["notPlaying", "killer", "survivor"].forEach((mode) => {
    it(`Displays the streamer name in ${mode} mode`, () => {
      const component = shallow(
        <PlayingIndicator
          mode={mode}
          playingAs={null}
          streamer={"streamer-name123" + mode}
        />
      );
      expect(component.text()).toEqual(
        stringContaining("streamer-name123" + mode)
      );
    });
  });
});

describe("Survivor mode", () => {
  it("Displays the Survivor icon", () => {
    const component = shallow(
      <PlayingIndicator
        mode="survivor"
        playingAs="survivor"
        streamer="streamer-name123"
      />
    );
    expect(component.find(".game-mode").text()).toEqual(
      stringContaining("survivor")
    );
  });
});

describe("Killer mode", () => {
  it("Displays the killer's name somewhere", () => {
    const component = shallow(
      <PlayingIndicator
        mode="killer"
        playingAs="hillbilly"
        streamer="streamer-name123"
      />
    );
    expect(component.find(".game-mode").text()).toEqual(
      stringContaining("hillbilly")
    );
  });
});
