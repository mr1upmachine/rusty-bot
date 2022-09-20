import { BaseRepository } from './base-repository.js';
import type { DBGuild } from './types.js';
import { useFirestore } from './use-firestore.js';

export class GuildsRepository extends BaseRepository<DBGuild> {
  constructor() {
    const rootDocRef = useFirestore();
    super(rootDocRef, 'guilds');
  }

  async findByRandomVoiceChannelNames(
    value: DBGuild['randomVoiceChannelNames']
  ): Promise<DBGuild[]> {
    return this.query((qb) => qb.where('randomVoiceChannelNames', '==', value));
  }
}
