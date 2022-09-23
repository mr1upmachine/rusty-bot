/** This only exists because Array.isArray doesn't resolve the type correctly */
export function isArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
