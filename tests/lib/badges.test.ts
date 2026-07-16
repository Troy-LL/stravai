import { describe, it, expect } from "vitest";
import { computeBadges } from "@/lib/badges";

describe("computeBadges", () => {
  it("returns [] for zero stats", () => {
    expect(
      computeBadges({
        streak: 0,
        bestLocSession: 0,
        totalActivities: 0,
        mostTokens: 0,
      }),
    ).toEqual([]);
  });

  it("awards highest tier per family", () => {
    const badges = computeBadges({
      streak: 10,
      bestLocSession: 800,
      totalActivities: 12,
      mostTokens: 50000,
    });
    const labels = badges.map((b) => b.label);
    expect(labels).toContain("Week streak");
    expect(labels).not.toContain("On a streak");
    expect(labels).toContain("500 LOC session");
    expect(labels).toContain("10 sessions");
    expect(labels).not.toContain("5 sessions");
    expect(labels).toContain("Token burner");
  });

  it("awards lower tiers at their thresholds", () => {
    const labels = computeBadges({
      streak: 3,
      bestLocSession: 200,
      totalActivities: 5,
      mostTokens: 1000,
    }).map((b) => b.label);
    expect(labels).toContain("On a streak");
    expect(labels).toContain("5 sessions");
    expect(labels).not.toContain("500 LOC session");
    expect(labels).not.toContain("Token burner");
  });
});
