import { BaseRepository } from './base-repository.js';
import type { DBGuildChannel } from './types.js';
import { useFirestore } from './use-firestore.js';

export class GuildChannelsRepository extends BaseRepository<DBGuildChannel> {
  constructor(guildId: string) {
    const rootDocRef = useFirestore().collection('guilds').doc(guildId);
    super(rootDocRef, 'channels');
  }

  async findByRandomVoiceChannelNames(
    value: DBGuildChannel['randomVoiceChannelNames']
  ): Promise<DBGuildChannel[]> {
    return this.query((qb) => qb.where('randomVoiceChannelNames', '==', value));
  }
}
