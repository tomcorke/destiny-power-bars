import React from "react";

import { LoadingChecklist } from "./LoadingChecklist";

const story = {
  title: "Loading Checklist",
};
export default story;

export const display = () => (
  <LoadingChecklist
    items={[
      { label: "Complete item", status: "complete" },
      { label: "A pending item", status: "pending" },
      { label: "A failed item", status: "failed" },
    ]}
  />
);
