import type { Firestore } from '@google-cloud/firestore';

import type { Command } from '../types/command.js';

export type CommandDerived = new (firestore: Firestore) => Command;
