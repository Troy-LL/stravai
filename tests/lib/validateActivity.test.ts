import { describe, it, expect } from "vitest";
import { validateActivity, ActivityInput } from "@/lib/validateActivity";

describe("validateActivity", () => {
  const validInput: ActivityInput = {
    durationSec: 3600,
    locAdded: 100,
    locRemoved: 50,
    tokens: 1000,
    filesTouched: 10,
    commitCount: 5,
  };

  it("accepts valid input", () => {
    const result = validateActivity(validInput);
    expect(result.ok).toBe(true);
  });

  describe("durationSec validation", () => {
    it("rejects durationSec <= 0", () => {
      const result = validateActivity({ ...validInput, durationSec: 0 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("durationSec");
    });

    it("rejects durationSec > 86400", () => {
      const result = validateActivity({ ...validInput, durationSec: 86401 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("durationSec");
    });

    it("rejects durationSec = NaN", () => {
      const result = validateActivity({ ...validInput, durationSec: NaN });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("durationSec");
    });

    it("rejects durationSec = Infinity", () => {
      const result = validateActivity({ ...validInput, durationSec: Infinity });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("durationSec");
    });

    it("rejects durationSec = -Infinity", () => {
      const result = validateActivity({ ...validInput, durationSec: -Infinity });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("durationSec");
    });

    it("accepts durationSec = 1 (boundary)", () => {
      const result = validateActivity({ ...validInput, durationSec: 1 });
      expect(result.ok).toBe(true);
    });

    it("accepts durationSec = 86400 (boundary)", () => {
      const result = validateActivity({ ...validInput, durationSec: 86400 });
      expect(result.ok).toBe(true);
    });
  });

  describe("locAdded validation", () => {
    it("rejects locAdded < 0", () => {
      const result = validateActivity({ ...validInput, locAdded: -1 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("locAdded");
    });

    it("accepts locAdded = 0 (boundary)", () => {
      const result = validateActivity({ ...validInput, locAdded: 0 });
      expect(result.ok).toBe(true);
    });
  });

  describe("locRemoved validation", () => {
    it("rejects locRemoved < 0", () => {
      const result = validateActivity({ ...validInput, locRemoved: -1 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("locRemoved");
    });

    it("accepts locRemoved = 0 (boundary)", () => {
      const result = validateActivity({ ...validInput, locRemoved: 0 });
      expect(result.ok).toBe(true);
    });
  });

  describe("combined loc validation", () => {
    it("rejects combined locAdded + locRemoved > 100000", () => {
      const result = validateActivity({
        ...validInput,
        locAdded: 60000,
        locRemoved: 40001,
      });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("combined");
    });

    it("accepts combined locAdded + locRemoved = 100000 (boundary)", () => {
      const result = validateActivity({
        ...validInput,
        locAdded: 60000,
        locRemoved: 40000,
      });
      expect(result.ok).toBe(true);
    });

    it("accepts combined locAdded + locRemoved = 99999 (boundary)", () => {
      const result = validateActivity({
        ...validInput,
        locAdded: 50000,
        locRemoved: 49999,
      });
      expect(result.ok).toBe(true);
    });
  });

  describe("tokens validation", () => {
    it("rejects tokens < 0", () => {
      const result = validateActivity({ ...validInput, tokens: -1 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("tokens");
    });

    it("rejects tokens > 100000000", () => {
      const result = validateActivity({ ...validInput, tokens: 100000001 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("tokens");
    });

    it("rejects tokens = NaN", () => {
      const result = validateActivity({ ...validInput, tokens: NaN });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("tokens");
    });

    it("rejects tokens = Infinity", () => {
      const result = validateActivity({ ...validInput, tokens: Infinity });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("tokens");
    });

    it("accepts tokens = 0 (boundary)", () => {
      const result = validateActivity({ ...validInput, tokens: 0 });
      expect(result.ok).toBe(true);
    });

    it("accepts tokens = 100000000 (boundary)", () => {
      const result = validateActivity({ ...validInput, tokens: 100000000 });
      expect(result.ok).toBe(true);
    });
  });

  describe("filesTouched validation", () => {
    it("rejects filesTouched < 0", () => {
      const result = validateActivity({ ...validInput, filesTouched: -1 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("filesTouched");
    });

    it("rejects filesTouched > 10000", () => {
      const result = validateActivity({ ...validInput, filesTouched: 10001 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("filesTouched");
    });

    it("accepts filesTouched = 0 (boundary)", () => {
      const result = validateActivity({ ...validInput, filesTouched: 0 });
      expect(result.ok).toBe(true);
    });

    it("accepts filesTouched = 10000 (boundary)", () => {
      const result = validateActivity({ ...validInput, filesTouched: 10000 });
      expect(result.ok).toBe(true);
    });
  });

  describe("commitCount validation", () => {
    it("rejects commitCount < 0", () => {
      const result = validateActivity({ ...validInput, commitCount: -1 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("commitCount");
    });

    it("rejects commitCount > 1000", () => {
      const result = validateActivity({ ...validInput, commitCount: 1001 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error).toContain("commitCount");
    });

    it("accepts commitCount = 0 (boundary)", () => {
      const result = validateActivity({ ...validInput, commitCount: 0 });
      expect(result.ok).toBe(true);
    });

    it("accepts commitCount = 1000 (boundary)", () => {
      const result = validateActivity({ ...validInput, commitCount: 1000 });
      expect(result.ok).toBe(true);
    });
  });
});
