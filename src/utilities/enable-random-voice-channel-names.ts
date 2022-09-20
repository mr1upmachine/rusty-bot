import { CronJob } from 'cron';
import type { Guild } from 'discord.js';

import { GLOBAL_STATE } from '../services/global-state.js';
import { RANDOM_VOICE_CHANNEL_NAME_CRON } from './constants.js';
import { setRandomVoiceChannelNames } from './set-random-voice-channel-names.js';

export function enableRandomVoiceChannelNames(guild: Guild): void {
  const currentCron = GLOBAL_STATE.randomVoiceChannelNameCronMap.get(guild.id);
  if (currentCron?.running) {
    return;
  }

  const voiceChannelNamesCronJob = new CronJob(
    RANDOM_VOICE_CHANNEL_NAME_CRON,
    () => {
      void setRandomVoiceChannelNames(guild);
    }
  );

  GLOBAL_STATE.randomVoiceChannelNameCronMap.set(
    guild.id,
    voiceChannelNamesCronJob
  );

  voiceChannelNamesCronJob.start();
}
