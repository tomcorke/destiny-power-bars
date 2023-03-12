import React from "react";

import { CharacterDisplayBodyWrapper } from "../CharacterDisplay/CharacterDisplay";

import { CharacterHeader } from "./CharacterHeader";

const story = {
  title: "Character Header",
  decorators: [
    (storyFn: () => JSX.Element) =>
      CharacterDisplayBodyWrapper("rgb(7, 5, 43)", <>{storyFn()}</>),
  ],
};

export default story;

export const display = () => (
  <CharacterHeader
    emblemBackgroundPath={undefined}
    className={"Warlock"}
    roundedPower={1578}
    summableArtifactBonusPower={5}
  />
);

export const withEmblemBackground = () => (
  <CharacterHeader
    emblemBackgroundPath={
      "/common/destiny2_content/icons/3d0142ffcf985e9fab3d3e7d89ec192c.jpg"
    }
    className={"Warlock"}
    roundedPower={1578}
    summableArtifactBonusPower={5}
  />
);

export const withRedactedWarning = () => (
  <CharacterHeader
    emblemBackgroundPath={
      "/common/destiny2_content/icons/3d0142ffcf985e9fab3d3e7d89ec192c.jpg"
    }
    className={"Warlock"}
    roundedPower={1578}
    summableArtifactBonusPower={5}
    hasRedactedEquippableItems={true}
  />
);

export const withTitle = () => (
  <CharacterHeader
    emblemBackgroundPath={
      "/common/destiny2_content/icons/3d0142ffcf985e9fab3d3e7d89ec192c.jpg"
    }
    className={"Warlock"}
    roundedPower={1578}
    summableArtifactBonusPower={5}
    title="Developer"
  />
);

export const withGildedTitle = () => (
  <CharacterHeader
    emblemBackgroundPath={
      "/common/destiny2_content/icons/3d0142ffcf985e9fab3d3e7d89ec192c.jpg"
    }
    className={"Warlock"}
    roundedPower={1578}
    summableArtifactBonusPower={5}
    title="Developer"
    titleGildedCount={1}
  />
);

export const withMultiGildedTitle = () => (
  <CharacterHeader
    emblemBackgroundPath={
      "/common/destiny2_content/icons/3d0142ffcf985e9fab3d3e7d89ec192c.jpg"
    }
    className={"Warlock"}
    roundedPower={1578}
    summableArtifactBonusPower={5}
    title="Developer"
    titleGildedCount={5}
  />
);

export const withRedactedWarningAndTitle = () => (
  <CharacterHeader
    emblemBackgroundPath={
      "/common/destiny2_content/icons/3d0142ffcf985e9fab3d3e7d89ec192c.jpg"
    }
    className={"Warlock"}
    roundedPower={1578}
    summableArtifactBonusPower={5}
    hasRedactedEquippableItems={true}
    title={"Developer"}
  />
);
