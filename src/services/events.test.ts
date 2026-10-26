import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import eventEmitter, { EVENTS, useEvent } from "./events";

const Listener = ({
  eventName,
  handler,
}: {
  eventName: EVENTS;
  handler: (value: string) => void;
}) => {
  useEvent(eventName, handler);
  return null;
};

let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  root = createRoot(document.createElement("div"));
});

afterEach(async () => {
  await act(() => root.unmount());
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: false });
});

describe("useEvent", () => {
  it("keeps one listener through strict mounting and uses the latest handler", async () => {
    const received: string[] = [];
    const render = (prefix: string) =>
      act(() => {
        root.render(
          React.createElement(
            React.StrictMode,
            null,
            React.createElement(Listener, {
              eventName: EVENTS.LOG_OUT,
              handler: (value) => received.push(prefix + value),
            })
          )
        );
      });

    const initialListeners = eventEmitter.listenerCount(EVENTS.LOG_OUT);
    await render("first:");
    expect(eventEmitter.listenerCount(EVENTS.LOG_OUT)).toBe(
      initialListeners + 1
    );
    eventEmitter.emit(EVENTS.LOG_OUT, "a");
    await render("latest:");
    eventEmitter.emit(EVENTS.LOG_OUT, "b");
    expect(received).toEqual(["first:a", "latest:b"]);
    await act(() => root.unmount());
    expect(eventEmitter.listenerCount(EVENTS.LOG_OUT)).toBe(initialListeners);
  });

  it("moves the subscription when the event changes", async () => {
    const received: string[] = [];
    const render = (eventName: EVENTS) =>
      act(() => {
        root.render(
          React.createElement(Listener, {
            eventName,
            handler: (value) => received.push(value),
          })
        );
      });

    await render(EVENTS.LOG_OUT);
    await render(EVENTS.ITEM_LOCKED);
    eventEmitter.emit(EVENTS.LOG_OUT, "old");
    eventEmitter.emit(EVENTS.ITEM_LOCKED, "new");
    expect(received).toEqual(["new"]);
  });
});
