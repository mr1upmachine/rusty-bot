import { Firestore } from '@google-cloud/firestore';
import { Client } from 'discord.js';
import { config } from 'dotenv';

// Setup for dotenv
config();
if (!process.env.TOKEN) {
  throw new Error('TOKEN must be provided');
}
if (!process.env.KEYFILE) {
  throw new Error('KEYFILE must be provided');
}
if (!process.env.PROJECTID) {
  throw new Error('PROJECTID must be provided');
}

// Setup for discord.js
const client = new Client({ partials: ['MESSAGE'] });
client.token = process.env.TOKEN;

// Setup for GCP
const firestore = new Firestore({
  keyFilename: process.env.KEYFILE,
  projectId: process.env.PROJECTID,
});

// discord.js message event
client.on('message', async msg => {
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

  // TODO add configurable prefix support
  const prefix = '!';
  if (msg.content[0] !== prefix) {
    return;
  }

  // TODO command splitting needs to account for commands that allow spaces in non-final args
  const args = msg.content.trim().split(' '); // Setting-up arguments of command
  const cmd = (args.shift() || '').toLowerCase().substring(prefix.length); // LowerCase command

  // attempts to fetch the comand file, returning if not found
  try {
    const commandFile = require(`./commands/${cmd}`); // Loads up the command based on file name
    await commandFile.run(client, msg, args, firestore); // Executes any function titled 'run' within the file
  } catch (e) {
    return;
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
