import type { Firestore } from '@google-cloud/firestore';

import { DatabaseConnectionNotEstablishedError } from '../errors/rusty-bot-errors.js';
import { GLOBAL_STATE } from '../services/global-state.js';

export function useFirestore(): Firestore {
  const firestore = GLOBAL_STATE.firestore;
  if (!firestore) {
    throw new DatabaseConnectionNotEstablishedError();
  }

  return firestore;
}
