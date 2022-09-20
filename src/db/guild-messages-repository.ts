import { FieldValue } from '@google-cloud/firestore';

import { BaseRepository } from './base-repository.js';
import type { DBGuildMessage } from './types.js';
import { useFirestore } from './use-firestore.js';

export class GuildMessagesRepository extends BaseRepository<DBGuildMessage> {
  constructor(guildId: string, channelId: string) {
    const rootDocRef = useFirestore()
      .collection('guilds')
      .doc(guildId)
      .collection('channels')
      .doc(channelId);
    super(rootDocRef, 'messages');
  }

  async incrementReactionCount(messageId: string, n: number): Promise<void> {
    await this._save(messageId, { reactionCount: FieldValue.increment(n) });
  }
}
