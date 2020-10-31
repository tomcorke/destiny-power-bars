import React from "react";

import { PowerBar } from "./PowerBar";

const story = {
  title: "Power Bar",
};
export default story;

const Container = ({ children }: { children: JSX.Element }) => (
  <div
    style={{
      width: "100%",
      maxWidth: "500px",
      background: "#333",
      padding: "1em",
    }}
  >
    {children}
  </div>
);

export const display = () => (
  <Container>
    <PowerBar
      min={700}
      max={750}
      value={745}
      avgValue={740}
      label="Energy Weapon"
      icon="/common/destiny2_content/icons/8f5bedcac2559d153f6df266d9f4d04b.jpg"
      isMasterworked={false}
    />
  </Container>
);

export const atMaxPower = () => (
  <Container>
    <PowerBar
      min={700}
      max={750}
      value={750}
      avgValue={740}
      label="Energy Weapon"
      icon="/common/destiny2_content/icons/8f5bedcac2559d153f6df266d9f4d04b.jpg"
      isMasterworked={false}
    />
  </Container>
);

export const belowAveragePower = () => (
  <Container>
    <PowerBar
      min={700}
      max={750}
      value={735}
      avgValue={740}
      label="Energy Weapon"
      icon="/common/destiny2_content/icons/8f5bedcac2559d153f6df266d9f4d04b.jpg"
      isMasterworked={false}
    />
  </Container>
);

export const masterworked = () => (
  <Container>
    <PowerBar
      min={700}
      max={750}
      value={745}
      avgValue={740}
      label="Energy Weapon"
      icon="/common/destiny2_content/icons/8f5bedcac2559d153f6df266d9f4d04b.jpg"
      isMasterworked={true}
    />
  </Container>
);
