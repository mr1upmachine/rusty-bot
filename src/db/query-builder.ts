import type { CollectionReference, Query } from '@google-cloud/firestore';

import type { DBQueryOp } from './types.js';

export class QueryBuilder<T extends object> {
  protected query: Query<T>;

  constructor(collection: CollectionReference<T>) {
    this.query = collection;
  }

  where<K extends keyof T>(prop: K, op: DBQueryOp, value: T[K]): this {
    this.query = this.query.where(prop as string, op, value);
    return this;
  }

  build(): Query<T> {
    return this.query;
  }
}
