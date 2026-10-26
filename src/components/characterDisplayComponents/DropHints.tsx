import classnames from "classnames";
import React, { PropsWithChildren, ReactNode } from "react";

import {
  ITEM_POWER_PINNACLE_CAP,
  ITEM_POWER_PINNACLE_DROP_OFFSET,
  ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK,
  ITEM_POWER_POWERFUL_CAP,
  ITEM_POWER_SOFT_CAP,
} from "../../constants";

import { Power } from "./Power";
import STYLES from "./PowerHints.module.scss";

interface DropHintsProps {
  powerToUse: number;
  potentialOverallPower: number;
  powerRequiredToReachNext: number;
  powerRequiredToReachPotential: number;
}

const DropHint = ({
  className,
  title,
  children,
}: PropsWithChildren<{ className?: string; title: ReactNode }>) => (
  <div className={classnames(STYLES.hint, STYLES.dropHint, className)}>
    <span>{title}</span>
    <div className={STYLES.hintExtra}>
      <div className={STYLES.hintExtraInner}>{children}</div>
    </div>
  </div>
);

const PowerRequiredHint = ({
  powerRequired,
  targetPower,
}: {
  powerRequired: number;
  targetPower: number;
}) => (
  <div>
    You need an extra <Power>{powerRequired}</Power> total power on your items
    to reach an overall power of <Power>{targetPower}</Power>.
  </div>
);

const PowerRequiredHints = ({
  powerToUse,
  potentialOverallPower,
  powerRequiredToReachNext,
  powerRequiredToReachPotential,
}: DropHintsProps) => (
  <>
    {powerRequiredToReachNext &&
      powerRequiredToReachNext !== powerRequiredToReachPotential && (
        <PowerRequiredHint
          powerRequired={powerRequiredToReachNext}
          targetPower={Math.floor(powerToUse + 1)}
        />
      )}
    {powerRequiredToReachPotential && (
      <PowerRequiredHint
        powerRequired={powerRequiredToReachPotential}
        targetPower={potentialOverallPower}
      />
    )}
  </>
);

const ReplaceLowItemsHint = () => (
  <div>
    Replacing items which are below your current overall power can increase your
    power to a higher average.
  </div>
);

const LegendaryWorldDropHint = (props: DropHintsProps) => (
  <DropHint
    className={STYLES.legendaryWorldDropHint}
    title={
      <>
        Powerful rewards can increase your equippable gear power to{" "}
        <Power>{props.potentialOverallPower}</Power>
      </>
    }
  >
    <div>
      Powerful rewards from milestones or prime engrams can drop with a power
      level up to <Power>{props.powerToUse}</Power> for this character.
    </div>
    <ReplaceLowItemsHint />
    {props.powerToUse < ITEM_POWER_PINNACLE_CAP && (
      <div>
        Raising your overall power before collecting your next pinnacle reward
        will give you the most efficient progress.
      </div>
    )}
    <PowerRequiredHints {...props} />
  </DropHint>
);

const WorldDropHint = (props: DropHintsProps) => {
  const { powerToUse, potentialOverallPower } = props;
  return (
    <DropHint
      className={STYLES.worldDropHint}
      title={
        <>
          World drops and other on-power item sources can increase your
          equippable gear power to <Power>{potentialOverallPower}</Power>
        </>
      }
    >
      <div>
        World drops (from strikes, public events,{" "}
        {powerToUse <= ITEM_POWER_POWERFUL_CAP && "vendor rank rewards, "}
        non-powerful rewards) can drop with a power level{" "}
        {powerToUse >= ITEM_POWER_SOFT_CAP ? (
          <>
            from <Power>{powerToUse - 3}</Power> to <Power>{powerToUse}</Power>
          </>
        ) : (
          <>
            above your current power, increasing your power incrementally up to{" "}
            <Power>{potentialOverallPower}</Power>
          </>
        )}{" "}
        for this character.
      </div>
      <ReplaceLowItemsHint />
      <PowerRequiredHints {...props} />
    </DropHint>
  );
};

const PowerfulHint = ({
  powerToUse,
  powerRequiredToReachNext,
}: DropHintsProps) => (
  <DropHint
    className={STYLES.powerfulHint}
    title={
      <>
        Powerful rewards can increase your equippable gear power up to the
        powerful cap of <Power>{ITEM_POWER_POWERFUL_CAP}</Power>
      </>
    }
  >
    <div>
      Powerful and pinnacle reward sources (Weekly challenges, latest and
      featured dungeons and raids) will give you items above your overall gear
      power, with powerful rewards capped at{" "}
      <Power>{ITEM_POWER_POWERFUL_CAP}</Power>.
    </div>
    {powerRequiredToReachNext && (
      <PowerRequiredHint
        powerRequired={powerRequiredToReachNext}
        targetPower={Math.floor(powerToUse + 1)}
      />
    )}
    <div>
      After getting a powerful reward, check back here to see if it's beneficial
      to catch up the rest of your slots with world drops before getting
      another!
    </div>
  </DropHint>
);

const pinnacleDropPower = (powerToUse: number, offset: number) =>
  Math.min(powerToUse + offset, ITEM_POWER_PINNACLE_CAP);

const PinnacleDropPower = ({ powerToUse }: { powerToUse: number }) =>
  ITEM_POWER_PINNACLE_CAP - powerToUse >
  ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK ? (
    <>
      <Power>
        {pinnacleDropPower(powerToUse, ITEM_POWER_PINNACLE_DROP_OFFSET_WEAK)}
      </Power>{" "}
      or{" "}
      <Power>
        {pinnacleDropPower(powerToUse, ITEM_POWER_PINNACLE_DROP_OFFSET)}
      </Power>
    </>
  ) : (
    <Power>
      {pinnacleDropPower(powerToUse, ITEM_POWER_PINNACLE_DROP_OFFSET)}
    </Power>
  );

const PinnacleHint = ({
  powerToUse,
  powerRequiredToReachNext,
}: DropHintsProps) => (
  <DropHint
    className={STYLES.pinnacleHint}
    title={
      <>
        Pinnacle rewards can increase your equippable gear power up to the
        pinnacle cap of <Power>{ITEM_POWER_PINNACLE_CAP}</Power>
      </>
    }
  >
    <div>
      Pinnacle reward sources (Some weekly challenges) will give you items at{" "}
      <PinnacleDropPower powerToUse={powerToUse} /> power.
    </div>
    {powerRequiredToReachNext && (
      <PowerRequiredHint
        powerRequired={powerRequiredToReachNext}
        targetPower={Math.floor(powerToUse + 1)}
      />
    )}
  </DropHint>
);

export const DropHints = (props: DropHintsProps) => {
  const { powerToUse, potentialOverallPower } = props;
  return (
    <>
      {potentialOverallPower &&
        potentialOverallPower > powerToUse &&
        powerToUse > ITEM_POWER_POWERFUL_CAP && (
          <LegendaryWorldDropHint {...props} />
        )}
      {potentialOverallPower > powerToUse &&
        powerToUse <= ITEM_POWER_POWERFUL_CAP && <WorldDropHint {...props} />}
      {potentialOverallPower === powerToUse &&
        powerToUse >= ITEM_POWER_SOFT_CAP &&
        powerToUse < ITEM_POWER_POWERFUL_CAP && <PowerfulHint {...props} />}
      {potentialOverallPower === powerToUse &&
        powerToUse >= ITEM_POWER_POWERFUL_CAP &&
        powerToUse < ITEM_POWER_PINNACLE_CAP && <PinnacleHint {...props} />}
    </>
  );
};
