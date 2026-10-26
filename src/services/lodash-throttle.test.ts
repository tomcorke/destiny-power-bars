import throttle from "lodash/throttle";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.useRealTimers());

describe("context update throttling", () => {
  it.each([100, 500])(
    "runs immediately, reuses the promise, then runs the latest call after %i ms",
    async (wait) => {
      vi.useFakeTimers();
      const update = vi.fn(async (value: string) => value);
      const throttled = throttle(update, wait);
      const first = throttled("first");
      expect(throttled("second")).toBe(first);
      expect(throttled("latest")).toBe(first);
      expect(update).toHaveBeenCalledTimes(1);
      await expect(first).resolves.toBe("first");

      await vi.advanceTimersByTimeAsync(wait - 1);
      expect(update).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(update.mock.calls).toEqual([["first"], ["latest"]]);
      await expect(throttled.flush()).resolves.toBe("latest");
      throttled.cancel();
    }
  );
});
