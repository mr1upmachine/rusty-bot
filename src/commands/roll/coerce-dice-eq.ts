export function coerceDiceEq(expr: string): string {
  let newExpr = expr.replace(/[ ()]/g, '').toLowerCase();

  if (!newExpr.startsWith('+') && !newExpr.startsWith('-')) {
    newExpr = `+${expr}`;
  }

  return newExpr;
}
