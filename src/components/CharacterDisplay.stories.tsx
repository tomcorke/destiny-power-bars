import React from "react";

import { PowerBarsCharacterData } from "../types";
import CharacterDisplay from "./CharacterDisplay";
import { characterDataSnapshot } from "./CharacterDisplayMockData";
// import { DestinyItemComponent } from "bungie-api-ts/destiny2";

const story = { title: "Character Display" };
export default story;

export const realisticTitan = () => (
  <CharacterDisplay data={characterDataSnapshot} />
);

const mockData: PowerBarsCharacterData = {
  character: {
    membershipType: 3,
    membershipId: "123",
    characterId: "456",
    emblemColor: {
      red: 7,
      green: 5,
      blue: 43,
      alpha: 255,
    },
    emblemBackgroundPath:
      "/common/destiny2_content/icons/3d0142ffcf985e9fab3d3e7d89ec192c.jpg",
  },

  className: "warlock",
  title: "Flawless",
  titleGildedCount: 2,

  overallPower: 929,
  overallPowerExact: 929 + 2 / 8,
  potentialOverallPower: 930,

  topItemBySlot: {
    kinetic: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 942,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Kinetic Weapon",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
    energy: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 940,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Energy Weapon",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
    power: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 938,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Power Weapon",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
    head: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 936,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Head Armor",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
    gloves: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 934,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Arms Armor",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
    chest: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 924,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Chest Armor",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
    legs: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 922,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Leg Armor",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
    classItem: {
      itemHash: 1,
      instanceData: {
        primaryStat: {
          value: 920,
        },
      },
      itemDefinition: {
        itemTypeDisplayName: "Class Armor",
        displayProperties: {
          icon: "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
        },
      },
    },
  },
  artifactData: {
    bonusPower: 12,
    iconPath:
      "/common/destiny2_content/icons/a622e55eb4a599a6b16d9b8b2f74ca73.jpg",
    name: "Test Artifact",
    nextLevelAt: 100,
    progressToNextLevel: 97,
  },
};

export const mockWarlock = () => <CharacterDisplay data={mockData} />;
