import { CronJob } from 'cron';
import type { Client, Guild, VoiceBasedChannel } from 'discord.js';

import { useGuildsRepository } from '../db/use-guilds-repository.js';
import { deployCommands } from '../deploy-commands.js';
import { GLOBAL_STATE } from '../services/global-state.js';
import { useEnv } from '../services/use-env.js';
import { ClientEvent } from '../types/client-event.js';
import { RANDOM_ACTIVITY_CRON } from '../utilities/constants.js';
import { setupRandomVoiceChannelNamesCron } from '../utilities/setup-random-voice-channel-names-cron.js';
import { setRandomActivity } from '../utilities/set-random-activity.js';

export class ReadyEvent extends ClientEvent<'ready'> {
  override readonly once = true;

  async execute(client: Client<true>): Promise<void> {
    // get dependencies
    const { DISCORD_API_TOKEN } = useEnv();
    const guildsRepository = useGuildsRepository();

    // refresh discord.js commands
    for (const [guildId] of client.guilds.cache) {
      await deployCommands(client.user.id, guildId, DISCORD_API_TOKEN);
    }

    // setup activity status cycle
    await setRandomActivity(client.user);
    const activityCronJob = new CronJob(RANDOM_ACTIVITY_CRON, () => {
      void setRandomActivity(client.user);
    });
    activityCronJob.start();
    GLOBAL_STATE.activityCronJob = activityCronJob;

    // setup random voice channel names
    const enabledDBGuildChannels =
      await guildsRepository.findChannelsByRandomVoiceChannelNames(true);
    const enabledDBGuildChannelIds = enabledDBGuildChannels.map(
      (guildChannel) => guildChannel.id
    );
    const guildChannelsToSetup = client.guilds.cache.reduce<
      [Guild, VoiceBasedChannel[]][]
    >((acc, guild) => {
      const channels = guild.channels.cache
        .filter((channel): channel is VoiceBasedChannel =>
          channel.isVoiceBased()
        )
        .filter((channel) => enabledDBGuildChannelIds.includes(channel.id));
      acc.push([guild, [...channels.values()]]);
      return acc;
    }, []);
    for (const [guild, guildChannels] of guildChannelsToSetup) {
      await setupRandomVoiceChannelNamesCron(guild, guildChannels);
    }
  }
}

export default ReadyEvent;
