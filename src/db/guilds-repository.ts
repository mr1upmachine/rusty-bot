import { BaseRepository } from './base-repository.js';
import type { DBGuild, DBGuildChannel } from './types.js';
import { useFirestore } from './use-firestore.js';
import { useGuildChannelsRepository } from './use-guild-channels-repository.js';

export class GuildsRepository extends BaseRepository<DBGuild> {
  constructor() {
    const rootDocRef = useFirestore();
    super(rootDocRef, 'guilds');
  }

  async findChannelsByRandomVoiceChannelNames(
    value: DBGuildChannel['randomVoiceChannelNames']
  ): Promise<DBGuildChannel[]> {
    const allGuilds = await this.query((qb) => qb);
    const allEnabledChannels: DBGuildChannel[] = [];
    for (const guild of allGuilds) {
      const guildChannelsRepository = useGuildChannelsRepository(guild.id);
      const channels =
        await guildChannelsRepository.findByRandomVoiceChannelNames(value);
      allEnabledChannels.push(...channels);
    }
    return allEnabledChannels;
  }
}
