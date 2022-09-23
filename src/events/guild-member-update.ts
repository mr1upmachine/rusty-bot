import type { GuildMember, PartialGuildMember } from 'discord.js';

import { ClientEvent } from '../types/client-event.js';
import { processMemberEditEvent } from '../utilities/statistics.js';

class GuildMemberUpdateEvent extends ClientEvent<'guildMemberUpdate'> {
  async execute(
    partialOldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember
  ): Promise<void> {
    const oldMember = partialOldMember.partial
      ? await partialOldMember.fetch()
      : partialOldMember;

    await processMemberEditEvent(oldMember, newMember);
  }
}

export default GuildMemberUpdateEvent;
