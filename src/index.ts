import { CronJob } from 'cron';
import { Client, IntentsBitField, Partials } from 'discord.js';
import * as dotenv from 'dotenv';
import FirebaseAdmin from 'firebase-admin';
import type { AppOptions as FirebaseAdminAppOptions } from 'firebase-admin';

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

// Constants
const RANDOM_ACTIVITY_CRON = '0 0 0 * * *';

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

// Setup for GCP
let gcpAppOptions: FirebaseAdminAppOptions | undefined;
if (LOCAL && GPC_PROJECT_ID && GPC_PRIVATE_KEY && GPC_CLIENT_EMAIL) {
  const gpcServiceAccount = {
    projectId: GPC_PROJECT_ID,
    privateKey: GPC_PRIVATE_KEY,
    clientEmail: GPC_CLIENT_EMAIL
  };
  const gcpCredential = FirebaseAdmin.credential.cert(gpcServiceAccount);
  gcpAppOptions = {
    credential: gcpCredential
  };
}
FirebaseAdmin.initializeApp(gcpAppOptions);
const firestore = FirebaseAdmin.firestore();

// discord.js on initialization
globalClient.on('ready', async (client) => {
  try {
    // refresh discord.js commands
    for (const [guildId] of client.guilds.cache) {
      await deployCommands(
        client.user.id,
        guildId,
        DISCORD_API_TOKEN,
        firestore
      );
    }

    // setup activity status cycle
    setRandomActivity(client);
    const activityCronJob = new CronJob(RANDOM_ACTIVITY_CRON, () => {
      setRandomActivity(client);
    });
    activityCronJob.start();
  } catch (e: unknown) {
    console.log('Uncaught exception:');
    console.error(e);
  }
});

// listen for discord.js command
globalClient.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || !interaction.isChatInputCommand()) return;

  try {
    const command = useCommand(interaction.commandName, [firestore]);
    await command.execute(interaction);
  } catch (e: unknown) {
    let message =
      'Something went wrong ┗( T﹏T )┛\nPlease contact one of the mods to look into it';

    if (e instanceof RustyBotCommandError) {
      message = e.message;
    }

    if (interaction.replied) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
    console.log('Uncaught exception:');
    console.error(e);
  }
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

  try {
    await processMessageEvent(message, firestore, 1);
  } catch (e: unknown) {
    console.log('Uncaught exception:');
    console.error(e);
  }
});

// discord.js add reaction events
globalClient.on(
  'messageReactionAdd',
  messageReactionEventFactory(firestore, 1)
);

// discord.js remove reaction event
globalClient.on(
  'messageReactionRemove',
  messageReactionEventFactory(firestore, -1)
);

globalClient.on('guildMemberUpdate', async (partialOldMember, newMember) => {
  try {
    const oldMember = partialOldMember.partial
      ? await partialOldMember.fetch()
      : partialOldMember;

    await processMemberEditEvent(oldMember, newMember, firestore);
  } catch (e: unknown) {
    console.log('Uncaught exception:');
    console.error(e);
  }
});

// Login to discord and notify when completed.
await globalClient.login();
console.log('All done!');
