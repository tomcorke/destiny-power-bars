import React from "react";

import { LoadingChecklist } from "./LoadingChecklist";

export default {
  title: "Loading Checklist",
};

export const display = () => (
  <LoadingChecklist
    items={[
      { label: "Complete item", status: "complete" },
      { label: "A pending item", status: "pending" },
      { label: "A failed item", status: "failed" },
    ]}
  />
);
