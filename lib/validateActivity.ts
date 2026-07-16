export interface ActivityInput {
  durationSec: number;
  locAdded: number;
  locRemoved: number;
  tokens: number;
  filesTouched: number;
  commitCount: number;
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateActivity(input: ActivityInput): ValidationResult {
  const { durationSec, locAdded, locRemoved, tokens, filesTouched, commitCount } = input;

  // Guard against NaN/Infinity: all numeric fields must be finite
  if (!Number.isFinite(durationSec)) {
    return { ok: false, error: "durationSec must be a finite number" };
  }
  if (!Number.isFinite(locAdded)) {
    return { ok: false, error: "locAdded must be a finite number" };
  }
  if (!Number.isFinite(locRemoved)) {
    return { ok: false, error: "locRemoved must be a finite number" };
  }
  if (!Number.isFinite(tokens)) {
    return { ok: false, error: "tokens must be a finite number" };
  }
  if (!Number.isFinite(filesTouched)) {
    return { ok: false, error: "filesTouched must be a finite number" };
  }
  if (!Number.isFinite(commitCount)) {
    return { ok: false, error: "commitCount must be a finite number" };
  }

  if (durationSec <= 0 || durationSec > 86400) {
    return { ok: false, error: "durationSec must be > 0 and <= 86400" };
  }

  if (locAdded < 0) {
    return { ok: false, error: "locAdded must be >= 0" };
  }

  if (locRemoved < 0) {
    return { ok: false, error: "locRemoved must be >= 0" };
  }

  if (locAdded + locRemoved > 100000) {
    return { ok: false, error: "combined locAdded and locRemoved must be <= 100000" };
  }

  if (tokens < 0 || tokens > 100000000) {
    return { ok: false, error: "tokens must be >= 0 and <= 100000000" };
  }

  if (filesTouched < 0 || filesTouched > 10000) {
    return { ok: false, error: "filesTouched must be >= 0 and <= 10000" };
  }

  if (commitCount < 0 || commitCount > 1000) {
    return { ok: false, error: "commitCount must be >= 0 and <= 1000" };
  }

  return { ok: true };
}
