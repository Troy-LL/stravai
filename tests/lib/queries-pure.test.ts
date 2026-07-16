import { describe, it, expect, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  activity: {},
  friendship: {},
  challenge: {},
  user: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/currentUser", () => ({
  getCurrentUser: vi.fn(),
}));

import { computeStreak, getRangeBounds } from "@/lib/queries";

describe("computeStreak", () => {
  it("returns 0 for an empty array", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 1 for a single date today", () => {
    const today = new Date();
    expect(computeStreak([today])).toBe(1);
  });

  it("returns 3 for three consecutive days (today, yesterday, 2-days-ago)", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    expect(computeStreak([today, yesterday, twoDaysAgo])).toBe(3);
  });

  it("returns 1 for a gap (today and 3-days-ago)", () => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    expect(computeStreak([today, threeDaysAgo])).toBe(1);
  });

  it("counts streak correctly when starting from yesterday (if today is missing)", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    expect(computeStreak([yesterday, twoDaysAgo, threeDaysAgo])).toBe(3);
  });

  it("handles unordered input correctly", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Pass in random order
    expect(computeStreak([twoDaysAgo, today, yesterday])).toBe(3);
  });

  it("ignores duplicate dates (same day multiple times)", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    expect(computeStreak([today, today, yesterday, yesterday])).toBe(2);
  });

  it("handles streak of 1 when only yesterday is present", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(computeStreak([yesterday])).toBe(1);
  });

  it("returns 0 when dates are far in the past with no consecutive link to today/yesterday", () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    expect(computeStreak([thirtyDaysAgo])).toBe(0);
  });
});

describe("getRangeBounds", () => {
  it('returns valid bounds for "all" with start <= 1970', () => {
    const bounds = getRangeBounds("all");
    expect(bounds.start.getFullYear()).toBeLessThanOrEqual(1970);
    expect(Number.isNaN(bounds.start.getTime())).toBe(false);
  });

  it('returns valid bounds for "all" with end year < 9999', () => {
    const bounds = getRangeBounds("all");
    expect(bounds.end.getFullYear()).toBeLessThan(9999);
    expect(Number.isNaN(bounds.end.getTime())).toBe(false);
  });

  it('ensures "all" range start < end', () => {
    const bounds = getRangeBounds("all");
    expect(bounds.start.getTime()).toBeLessThan(bounds.end.getTime());
  });

  it('returns valid bounds for "daily" with start < end', () => {
    const bounds = getRangeBounds("daily");
    expect(bounds.start.getTime()).toBeLessThan(bounds.end.getTime());
  });

  it('returns valid dates for "daily" with no NaN times', () => {
    const bounds = getRangeBounds("daily");
    expect(Number.isNaN(bounds.start.getTime())).toBe(false);
    expect(Number.isNaN(bounds.end.getTime())).toBe(false);
  });

  it('returns "daily" start at midnight (00:00:00)', () => {
    const bounds = getRangeBounds("daily");
    expect(bounds.start.getHours()).toBe(0);
    expect(bounds.start.getMinutes()).toBe(0);
    expect(bounds.start.getSeconds()).toBe(0);
    expect(bounds.start.getMilliseconds()).toBe(0);
  });

  it('returns "daily" end at midnight of next day', () => {
    const bounds = getRangeBounds("daily");
    const expectedEnd = new Date(bounds.start);
    expectedEnd.setDate(expectedEnd.getDate() + 1);
    expect(bounds.end.getTime()).toBe(expectedEnd.getTime());
  });

  it('returns valid bounds for "weekly" with start < end', () => {
    const bounds = getRangeBounds("weekly");
    expect(bounds.start.getTime()).toBeLessThan(bounds.end.getTime());
  });

  it('returns valid dates for "weekly" with no NaN times', () => {
    const bounds = getRangeBounds("weekly");
    expect(Number.isNaN(bounds.start.getTime())).toBe(false);
    expect(Number.isNaN(bounds.end.getTime())).toBe(false);
  });

  it('returns valid bounds for "monthly" with start < end', () => {
    const bounds = getRangeBounds("monthly");
    expect(bounds.start.getTime()).toBeLessThan(bounds.end.getTime());
  });

  it('returns valid dates for "monthly" with no NaN times', () => {
    const bounds = getRangeBounds("monthly");
    expect(Number.isNaN(bounds.start.getTime())).toBe(false);
    expect(Number.isNaN(bounds.end.getTime())).toBe(false);
  });

  it('returns "monthly" start at first day of month', () => {
    const bounds = getRangeBounds("monthly");
    expect(bounds.start.getDate()).toBe(1);
  });

  it('returns "monthly" end at first day of next month', () => {
    const now = new Date();
    const bounds = getRangeBounds("monthly");
    const expectedEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    expect(bounds.end.getTime()).toBe(expectedEnd.getTime());
  });
});
