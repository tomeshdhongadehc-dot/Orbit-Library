/**
 * Feature flags. One place, one function. Values come from environment
 * variables (FLAG_NAME=true|false), with the defaults below.
 * A flag changes behaviour or look. It never hides files: hiding a file means
 * removing it from the catalog build (see tools/build-library.mjs).
 */
const DEFAULTS = {
  FLAG_SEARCH: true,
  FLAG_3D_ITEMS: true,
  FLAG_STATUS_BADGES: true,
  FLAG_AUTH_REQUIRED: false,
  FLAG_SHOW_DRAFTS: false,
} as const;

export type FlagName = keyof typeof DEFAULTS;

export function getFlag(name: string): boolean {
  const raw = process.env[name];
  if (raw === "true") return true;
  if (raw === "false") return false;
  return (DEFAULTS as Record<string, boolean>)[name] ?? true;
}

/** Each catalog item names its own flag, for example FLAG_ITEM_MONGODB. Default is on. */
export function itemEnabled(flag: string): boolean {
  return getFlag(flag);
}
