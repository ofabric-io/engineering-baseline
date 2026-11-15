// The tracker states, from scripts/tracker/states.json (the project's `tracker_states` parameter in
// docs/17-specs/work-tracking.md). Keys are fixed (todo, in-progress, complete); the names are the
// project's. Every adapter speaks the names; the CLI accepts either a key or a name.
import { readFileSync } from 'node:fs';

export const STATES = JSON.parse(readFileSync(new URL('./states.json', import.meta.url), 'utf8'));
export const NAMES = Object.values(STATES);

/** Accepts a key ("in-progress") or a name ("in progress"); returns the name, or null. */
export function stateName(input) {
  const s = String(input ?? '').trim().toLowerCase();
  return STATES[s] ?? NAMES.find((n) => n.toLowerCase() === s) ?? null;
}
