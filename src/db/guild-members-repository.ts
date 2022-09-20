import { FieldValue } from '@google-cloud/firestore';

import { BaseRepository } from './base-repository.js';
import type { DBGuildMember } from './types.js';
import { useFirestore } from './use-firestore.js';

export class GuildMembersRepository extends BaseRepository<DBGuildMember> {
  constructor(guildId: string) {
    const rootDocRef = useFirestore().collection('guilds').doc(guildId);
    super(rootDocRef, 'members');
  }

  async incrementKarma(memberId: string, n: number): Promise<void> {
    await this._save(memberId, { karma: FieldValue.increment(n) });
  }

  async incrementPosts(memberId: string, n: number): Promise<void> {
    await this._save(memberId, { posts: FieldValue.increment(n) });
  }
}
