import { CronJob } from 'cron';
import { Client, IntentsBitField, Partials } from 'discord.js';
import * as dotenv from 'dotenv';

import { deployCommands } from './deploy-commands.js';
import {
  MissingEnvironmentVariableError,
  RustyBotCommandError
} from './errors/rusty-bot-errors.js';
import { setRandomActivity } from './utilities/set-random-activity.js';
import {
  processMemberEditEvent,
  processMessageEvent
} from './utilities/statistics.js';
import { useCommand } from './utilities/use-command.js';
import { coerceBoolean } from './utilities/coerce-boolean.js';
import { messageReactionEventFactory } from './message-reaction-event-factory.js';
import { RANDOM_ACTIVITY_CRON } from './utilities/constants.js';
import { enableRandomVoiceChannelNames } from './utilities/enable-random-voice-channel-names.js';
import type { GCPAppOptions } from './create-db-connection.js';
import { createDBConnection } from './create-db-connection.js';
import { GLOBAL_STATE } from './services/global-state.js';
import { useGuildsRepository } from './db/use-guilds-repository.js';

// Environment variables
dotenv.config();
const { DISCORD_API_TOKEN, GPC_CLIENT_EMAIL, GPC_PRIVATE_KEY, GPC_PROJECT_ID } =
  process.env;
const LOCAL = coerceBoolean(process.env.LOCAL);

// Verify environment variables
if (!DISCORD_API_TOKEN) {
  throw new MissingEnvironmentVariableError('DISCORD_API_TOKEN');
}
if (LOCAL) {
  if (!GPC_CLIENT_EMAIL) {
    throw new MissingEnvironmentVariableError('GPC_CLIENT_EMAIL');
  }
  if (!GPC_PRIVATE_KEY) {
    throw new MissingEnvironmentVariableError('GPC_PRIVATE_KEY');
  }
  if (!GPC_PROJECT_ID) {
    throw new MissingEnvironmentVariableError('GPC_PROJECT_ID');
  }
}

// Define global state
// TODO define a global state manager that all resources can pull from
//      short term storage, long term lives in database still. possibly
//      move all database interaction to that level too

// Setup for discord.js
const globalClient = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction]
});
globalClient.token = DISCORD_API_TOKEN;

// Setup for DB
let gcpAppOptions: GCPAppOptions | undefined;
if (LOCAL && GPC_PROJECT_ID && GPC_PRIVATE_KEY && GPC_CLIENT_EMAIL) {
  gcpAppOptions = {
    projectId: GPC_PROJECT_ID,
    privateKey: GPC_PRIVATE_KEY,
    clientEmail: GPC_CLIENT_EMAIL
  };
}
createDBConnection(gcpAppOptions);

// TODO move all events into their own files

// discord.js on initialization
globalClient.on('ready', async (client) => {
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
  const enabledDBGuilds = await guildsRepository.findByRandomVoiceChannelNames(
    true
  );
  const enabledDBGuildIds = enabledDBGuilds.map((guild) => guild.id);
  const guildsToSetup = client.guilds.cache.filter((guild) =>
    enabledDBGuildIds.includes(guild.id)
  );
  for (const [, guild] of guildsToSetup) {
    enableRandomVoiceChannelNames(guild);
  }
});

// listen for discord.js command
globalClient.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || !interaction.isChatInputCommand()) return;

  try {
    const command = useCommand(interaction.commandName);
    await command.execute(interaction);
  } catch (e: unknown) {
    if (!(e instanceof RustyBotCommandError)) {
      throw e;
    }

    const message = e.message;

    if (interaction.replied) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
});

globalClient.on('error', (e) => {
  console.log('Uncaught exception:');
  console.error(e);
});

// discord.js messageCreate event
globalClient.on('messageCreate', async (message) => {
  // Prevent Rusty from responding to and logging other bots
  if (message.author.bot) {
    return;
  }

  // Throw away event if not in a guild
  if (!message.inGuild()) {
    return;
  }

  await processMessageEvent(message, 1);
});

// discord.js add reaction events
globalClient.on('messageReactionAdd', messageReactionEventFactory(1));

// discord.js remove reaction event
globalClient.on('messageReactionRemove', messageReactionEventFactory(-1));

globalClient.on('guildMemberUpdate', async (partialOldMember, newMember) => {
  const oldMember = partialOldMember.partial
    ? await partialOldMember.fetch()
    : partialOldMember;

  await processMemberEditEvent(oldMember, newMember);
});

// Login to discord and notify when completed.
await globalClient.login();
console.log('All done!');
