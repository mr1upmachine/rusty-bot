import { CronJob } from 'cron';
import type { Guild, VoiceBasedChannel } from 'discord.js';
import { useLogger } from '../services/use-logger.js';

import { useRandomVoiceChannelNameCronMap } from '../services/use-random-voice-channel-name-cron-map.js';
import { DEFAULT_RANDOM_VOICE_CHANNEL_NAMES_CRON } from './constants.js';
import { setRandomVoiceChannelNames } from './set-random-voice-channel-names.js';

export async function setupRandomVoiceChannelNamesCron(
  guild: Guild,
  channels: VoiceBasedChannel[],
  frequency?: string | null
): Promise<void> {
  // Get dependencies
  const cronJobMap = useRandomVoiceChannelNameCronMap();
  const logger = await useLogger(guild);

  // Stop previous cron job
  const currentCronMeta = cronJobMap.get(guild.id);
  if (currentCronMeta?.cronJob.running) {
    currentCronMeta.cronJob.stop();
  }

  // If there are no channels then don't build a new cron job
  if (channels.length === 0) {
    cronJobMap.delete(guild.id);
    return;
  }

  // Determine cron frequency
  const newFrequency =
    frequency ??
    currentCronMeta?.frequency ??
    DEFAULT_RANDOM_VOICE_CHANNEL_NAMES_CRON;

  // Build new cron job
  const newCronJob = new CronJob(newFrequency, () => {
    void setRandomVoiceChannelNames(channels).then((oldToNewNameMap) => {
      // Log to logging channel
      const logText = oldToNewNameMap.reduce(
        (acc, [oldName, newName]) => acc + `${oldName} -> ${newName}\n`,
        'Voice channel names have been automatically updated:\n'
      );
      void logger.info(logText);
    });
  });

  // Add / overwrite cron job
  cronJobMap.set(guild.id, {
    cronJob: newCronJob,
    frequency: newFrequency
  });

  // Start new cron
  newCronJob.start();
}
