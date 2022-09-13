export abstract class Statement {
  constructor(public negative?: boolean) {}

  /** Calculate the value based on object properties */
  abstract calc(): number;
}
