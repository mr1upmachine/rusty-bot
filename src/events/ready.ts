import { CronJob } from 'cron';
import type { Client } from 'discord.js';

import { useGuildsRepository } from '../db/use-guilds-repository.js';
import { deployCommands } from '../deploy-commands.js';
import { GLOBAL_STATE } from '../services/global-state.js';
import { useEnv } from '../services/use-env.js';
import { ClientEvent } from '../types/client-event.js';
import { RANDOM_ACTIVITY_CRON } from '../utilities/constants.js';
import { enableRandomVoiceChannelNames } from '../utilities/enable-random-voice-channel-names.js';
import { setRandomActivity } from '../utilities/set-random-activity.js';

export class ReadyEvent extends ClientEvent<'ready'> {
  override readonly once = true;

  async execute(client: Client<true>): Promise<void> {
    // get dependencies
    const { DISCORD_API_TOKEN } = useEnv();

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
    const guildsRepository = useGuildsRepository();
    const enabledDBGuilds =
      await guildsRepository.findByRandomVoiceChannelNames(true);
    const enabledDBGuildIds = enabledDBGuilds.map((guild) => guild.id);
    const guildsToSetup = client.guilds.cache.filter((guild) =>
      enabledDBGuildIds.includes(guild.id)
    );
    for (const [, guild] of guildsToSetup) {
      enableRandomVoiceChannelNames(guild);
    }
  }
}

export default ReadyEvent;
