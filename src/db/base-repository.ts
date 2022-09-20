import type {
  CollectionReference,
  DocumentReference,
  Firestore,
  PartialWithFieldValue
} from '@google-cloud/firestore';

import { QueryBuilder } from './query-builder.js';
import type { BaseModel } from './types.js';

export abstract class BaseRepository<T extends BaseModel> {
  constructor(
    private readonly documentBase: Firestore | DocumentReference,
    private readonly collectionPath: string
  ) {}

  private get collection(): CollectionReference<T> {
    return this.documentBase.collection(
      this.collectionPath
    ) as CollectionReference<T>;
  }

  protected async query(
    qbFactory: (qb: QueryBuilder<T>) => QueryBuilder<T>
  ): Promise<T[]> {
    const qb = new QueryBuilder<T>(this.collection);
    const builtQuery = qbFactory(qb).build();

    const snapshot = await builtQuery.get();

    const arr: T[] = [];
    snapshot.forEach((ref) => arr.push({ ...ref.data(), id: ref.id }));

    return arr;
  }

  async findById(id: string): Promise<T | null> {
    const snapshot = await this.collection.doc(id).get();
    const snapshotData = snapshot.data();
    return snapshotData ? { ...snapshotData, id } : null;
  }

  async save(id: string, data: Partial<T>): Promise<void> {
    await this.collection.doc(id).set({ ...data, id: null }, { merge: true });
  }

  // TODO find better typing for `data` to merge with the main `save` method
  protected async _save(
    id: string,
    data: PartialWithFieldValue<T>
  ): Promise<void> {
    await this.collection.doc(id).set({ ...data, id: null }, { merge: true });
  }
}
