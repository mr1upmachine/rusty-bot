/** Coerces a data-bound value (typically a string) to a boolean. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function coerceBoolean(value: any): boolean {
  return (
    value !== null && typeof value !== 'undefined' && `${value}` !== 'false'
  );
}
