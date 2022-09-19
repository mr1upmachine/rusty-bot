import type { Firestore } from '@google-cloud/firestore';
import { CronJob } from 'cron';
import type { Guild } from 'discord.js';

import { RANDOM_VOICE_CHANNEL_NAME_CRON } from './constants.js';
import { randomVoiceChannelNameCronMap } from './random-voice-channel-name-cron-map.js';
import { setRandomVoiceChannelNames } from './set-random-voice-channel-names.js';

export function enableRandomVoiceChannelNames(
  firestore: Firestore,
  guild: Guild
): void {
  const currentCron = randomVoiceChannelNameCronMap.get(guild.id);
  if (currentCron?.running) {
    return;
  }

  const voiceChannelNamesCronJob = new CronJob(
    RANDOM_VOICE_CHANNEL_NAME_CRON,
    () => {
      void setRandomVoiceChannelNames(firestore, guild);
    }
  );

  randomVoiceChannelNameCronMap.set(guild.id, voiceChannelNamesCronJob);

  voiceChannelNamesCronJob.start();
}
