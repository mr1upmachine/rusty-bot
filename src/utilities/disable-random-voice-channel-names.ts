import type { Guild } from 'discord.js';

import { randomVoiceChannelNameCronMap } from './random-voice-channel-name-cron-map.js';

export function disableRandomVoiceChannelNames(guild: Guild): void {
  const currentCron = randomVoiceChannelNameCronMap.get(guild.id);
  if (!currentCron) {
    return;
  }

  currentCron.stop();

  randomVoiceChannelNameCronMap.delete(guild.id);
}
