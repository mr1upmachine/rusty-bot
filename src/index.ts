import { CronJob } from 'cron';
import { Client, Intents } from 'discord.js';
import * as dotenv from 'dotenv';
import * as firestoreAdmin from 'firebase-admin';

import { deployCommands } from './deploy-commands';
import { CommandDerived } from './utilities/command';
import { setRandomActivity } from './utilities/set-random-activity';

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
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
  ],
  partials: ['MESSAGE']
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
  if (!interaction.isCommand()) return;

  try {
    const commandDerived: CommandDerived =
      require(`./commands/${interaction.commandName}`).default; // Loads up the command based on file name
    const command = new commandDerived(firestore);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `ERROR: ${error}`, ephemeral: true });
  }
});

// discord.js messageCreate event
client.on('messageCreate', async (msg) => {
  if (msg.partial) {
    await msg.fetch();
  }

  // Prevent Rusty from responding to and logging other bots
  if (msg.author!.bot) {
    return;
  }

  try {
    const statsFile = require(`./utilities/statistics`);
    await statsFile.messageSent(client, msg, firestore);
  } catch (e) {
    console.log(e);
  }
});

// discord.js message edit event
client.on('messageUpdate', async (oldMsg, newMsg) => {
  // fetch and cache partial messages
  if (oldMsg.partial) {
    await oldMsg.fetch();
  }
  if (newMsg.partial) {
    await newMsg.fetch();
  }

  // Prevent Rusty from responding to and logging other bots
  if (newMsg.author!.bot) {
    return;
  }

  try {
    const statsFile = require(`./utilities/statistics`); // Loads the stats file
    await statsFile.messageEdit(client, oldMsg, newMsg, firestore);
  } catch (e) {
    return;
  }
});

// discord.js add reaction event
client.on('messageReactionAdd', async (messageReaction, user) => {
  // fetch and cache partial messages
  if (messageReaction.message.partial) {
    await messageReaction.message.fetch();
  }

  // Prevent Rusty from responding to and logging other bots
  if (user.bot) {
    return;
  }

  try {
    const statsFile = require(`./utilities/statistics`); // Loads the stats file
    await statsFile.addReaction(client, messageReaction, user, firestore);
  } catch (e) {
    return;
  }
});

// discord.js remove reaction event
client.on('messageReactionRemove', async (messageReaction, user) => {
  // fetch and cache partial messages
  if (messageReaction.message.partial) {
    await messageReaction.message.fetch();
  }

  // Prevent Rusty from responding to and logging other bots
  if (user.bot) {
    return;
  }

  try {
    const statsFile = require(`./utilities/statistics`); // Loads the stats file
    await statsFile.removeReaction(client, messageReaction, user, firestore);
  } catch (e) {
    return;
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    const statsFile = require(`./utilities/statistics`); // Loads the stats file
    await statsFile.memberEdit(client, oldMember, newMember, firestore);
  } catch (e) {
    return;
  }
});

// Login to discord and notify when completed.
client.login().then(() => {
  console.log('All done!');
});
