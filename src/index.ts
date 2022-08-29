import { CronJob } from 'cron';
import { Client, IntentsBitField, Partials } from 'discord.js';
import * as dotenv from 'dotenv';
import * as firestoreAdmin from 'firebase-admin';

import { deployCommands } from './deploy-commands';
import { CommandDerived } from './utilities/command';
import { setRandomActivity } from './utilities/set-random-activity';
import {
  processReactionEvent,
  processMessageEvent,
  processMemberEditEvent
} from './utilities/statistics';

// Setup for dotenv
dotenv.config();
if (!process.env.TOKEN) {
  throw new Error('TOKEN must be provided');
}
if (!process.env.KEYFILE) {
  throw new Error('KEYFILE must be provided');
}
if (!process.env.PROJECTID) {
  throw new Error('PROJECTID must be provided');
}

let runningLocally = false;
if (process.env.LOCAL) {
  runningLocally = true;
}

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
client.token = process.env.TOKEN;

// Setup for GCP
if (runningLocally) {
  const serviceAccount = require('../rustykey.json');

  firestoreAdmin.initializeApp({
    credential: firestoreAdmin.credential.cert(serviceAccount)
  });
} else {
  firestoreAdmin.initializeApp();
}
const firestore = firestoreAdmin.firestore();

client.on('ready', () => {
  // setup discord.js commands
  for (const [guildId] of client.guilds.cache) {
    if (!client.user) {
      console.error(client.user);
      continue;
    }

    deployCommands(client.user.id, guildId, process.env.TOKEN!, firestore);
  }

  // setup activity status cycle
  setRandomActivity(client);
  const activityCronJob = new CronJob('0 0 0 * * *', () => {
    setRandomActivity(client);
  });
  activityCronJob.start();
});

// listen for discord.js command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || !interaction.isChatInputCommand()) return;

  try {
    const commandDerived: CommandDerived =
      require(`./commands/${interaction.commandName}/index`).default; // Loads the command based on file name
    const command = new commandDerived(firestore);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    let errorMessage = 'ERROR: ';

    if (error instanceof Error) {
      errorMessage += error.message;
    } else {
      errorMessage += error;
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
  } catch (error) {
    console.error(error);
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
  } catch (error) {
    console.error(error);
    return;
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
  } catch (error) {
    console.error(error);
    return;
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    if (oldMember.partial) {
      oldMember = await oldMember.fetch();
    }
    processMemberEditEvent(oldMember, newMember, firestore);
  } catch (error) {
    console.error(error);
    return;
  }
});

// Login to discord and notify when completed.
client.login().then(() => {
  console.log('All done!');
});
