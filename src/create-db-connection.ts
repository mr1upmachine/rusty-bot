import FirebaseAdmin from 'firebase-admin';
import type { AppOptions as FirebaseAdminAppOptions } from 'firebase-admin';

import { GLOBAL_STATE } from './services/global-state.js';

export interface GCPAppOptions {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export function createDBConnection(gcpAppOptions?: GCPAppOptions): void {
  let firebaseAdminAppOptions: FirebaseAdminAppOptions | undefined;

  if (gcpAppOptions) {
    const gcpCredential = FirebaseAdmin.credential.cert(gcpAppOptions);
    firebaseAdminAppOptions = {
      credential: gcpCredential
    };
  }

  FirebaseAdmin.initializeApp(firebaseAdminAppOptions);

  GLOBAL_STATE.firestore = FirebaseAdmin.firestore();
}
