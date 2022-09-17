import { CronJob } from 'cron';
import { Client, IntentsBitField, Partials } from 'discord.js';
import * as dotenv from 'dotenv';
import FirebaseAdmin from 'firebase-admin';
import type { AppOptions as FirebaseAdminAppOptions } from 'firebase-admin';

import { deployCommands } from './deploy-commands.js';
import { setRandomActivity } from './utilities/set-random-activity.js';
import {
  processMemberEditEvent,
  processMessageEvent,
  processReactionEvent
} from './utilities/statistics.js';
import { useCommand } from './utilities/use-command.js';
import { coerceBoolean } from './utilities/coerce-boolean.js';

// Environment variables
dotenv.config();
const { DISCORD_API_TOKEN, GPC_CLIENT_EMAIL, GPC_PRIVATE_KEY, GPC_PROJECT_ID } =
  process.env;
const LOCAL = coerceBoolean(process.env.LOCAL);

// Verify environment variables
if (!DISCORD_API_TOKEN) {
  throw new Error('DISCORD_API_TOKEN must be provided');
}
if (LOCAL) {
  if (!GPC_CLIENT_EMAIL) {
    throw new Error('GPC_CLIENT_EMAIL must be provided');
  }
  if (!GPC_PRIVATE_KEY) {
    throw new Error('GPC_PRIVATE_KEY must be provided');
  }
  if (!GPC_PROJECT_ID) {
    throw new Error('GPC_PROJECT_ID must be provided');
  }
}

// Constants
const RANDOM_ACTIVITY_CRON = '0 0 0 * * *';

// Setup for discord.js
const client = new Client({
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
client.token = DISCORD_API_TOKEN;

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
client.on('ready', async () => {
  // refresh discord.js commands
  for (const [guildId] of client.guilds.cache) {
    if (!client.user) {
      console.error(client.user);
      continue;
    }

    await deployCommands(client.user.id, guildId, DISCORD_API_TOKEN, firestore);
  }

  // setup activity status cycle
  setRandomActivity(client);
  const activityCronJob = new CronJob(RANDOM_ACTIVITY_CRON, () => {
    setRandomActivity(client);
  });
  activityCronJob.start();
});

// listen for discord.js command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || !interaction.isChatInputCommand()) return;

  try {
    const command = useCommand(interaction.commandName, [firestore]);
    await command.execute(interaction);
  } catch (e: unknown) {
    // TODO Completely redo how we handle errors
    console.error(e);

    let errorMessage = 'ERROR: ';

    if (e instanceof Error) {
      errorMessage += e.message;
    } else {
      errorMessage += e;
    }

    if (interaction.replied) {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    }
  }
});

// discord.js messageCreate event
client.on('messageCreate', async (message) => {
  // Prevent Rusty from responding to and logging other bots
  if (message.author.bot) {
    return;
  }

  try {
    await processMessageEvent(message, firestore, 1);
  } catch (e: unknown) {
    console.error(e);
  }
});

// discord.js add reaction event
client.on('messageReactionAdd', async (messageReaction, user) => {
  // fetch and cache partial users
  if (user.partial) {
    user = await user.fetch();
  }

  // Prevent Rusty from responding to and logging other bots
  if (user.bot) {
    return;
  }

  // fetch and cache partial messages
  if (messageReaction.partial) {
    messageReaction = await messageReaction.fetch();
  }
  let message = messageReaction.message;
  if (message.partial) {
    message = await message.fetch();
  }

  try {
    await processReactionEvent(message, user, firestore, 1);
  } catch (e: unknown) {
    console.error(e);
  }
});

// discord.js remove reaction event
client.on('messageReactionRemove', async (messageReaction, user) => {
  // fetch and cache partial users
  if (user.partial) {
    user = await user.fetch();
  }

  // Prevent Rusty from responding to and logging other bots
  if (user.bot) {
    return;
  }

  // fetch and cache partial messages
  if (messageReaction.partial) {
    messageReaction = await messageReaction.fetch();
  }
  let message = messageReaction.message;
  if (message.partial) {
    message = await message.fetch();
  }

  try {
    await processReactionEvent(message, user, firestore, -1);
  } catch (e: unknown) {
    console.error(e);
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    if (oldMember.partial) {
      oldMember = await oldMember.fetch();
    }
    await processMemberEditEvent(oldMember, newMember, firestore);
  } catch (e: unknown) {
    console.error(e);
  }
});

// Login to discord and notify when completed.
await client.login();
console.log('All done!');
