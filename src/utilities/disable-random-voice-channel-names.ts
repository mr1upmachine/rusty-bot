import type { Guild } from 'discord.js';

import { GLOBAL_STATE } from '../services/global-state.js';

export function disableRandomVoiceChannelNames(guild: Guild): void {
  const currentCron = GLOBAL_STATE.randomVoiceChannelNameCronMap.get(guild.id);
  if (!currentCron) {
    return;
  }

  currentCron.stop();

  GLOBAL_STATE.randomVoiceChannelNameCronMap.delete(guild.id);
}
