import { Firestore } from '@google-cloud/firestore';
import { Client, ReactionCollector } from 'discord.js';
import { config } from 'dotenv';

// Setup for dotenv
config();
if (!process.env.TOKEN) { throw new Error('TOKEN must be provided'); }

// Setup for discord.js
const client = new Client({ partials: ['MESSAGE'] });
client.token = process.env.TOKEN;

// Setup for GCP
const firestore = new Firestore({
  keyFilename: 'rustykey.json',
  projectId: 'rusty-244803',
});

// discord.js message event
client.on('message', (msg) => {

  // TODO add configurable prefix support
  const prefix = '!';
  if (msg.content[0] !== prefix) { return; }

  // TODO command splitting needs to account for commands that allow spaces in non-final args
  const args = msg.content.trim().split(' '); // Setting-up arguments of command
  const cmd = (args.shift() || '').toLowerCase().substring(prefix.length); // LowerCase command

  // attempts to fetch the comand file, returning if not found
  try {
    const commandFile = require(`./commands/${cmd}`); // Loads up the command based on file name
    commandFile.run(client, msg, args, firestore); // Executes any function titled 'run' within the file
  } catch (e) {
    return;
  }
});

// discord.js add reaction event
client.on('messageReactionAdd', async (messageReaction, user) => {

  // fetch and cache partial messages
  if (messageReaction.message.partial) { await messageReaction.message.fetch(); }

  try {
    const statsFile = require(`./utilities/statistics`); // Loads the stats file
    statsFile.addReaction(client, messageReaction, user, firestore); // Executes any function titled 'addReaction' within the file
  } catch (e) {
    return;
  }
});

// discord.js remove reaction event
client.on('messageReactionRemove', async (messageReaction, user) => {

  // fetch and cache partial messages
  if (messageReaction.message.partial) { await messageReaction.message.fetch(); }

  try {
    const statsFile = require(`./utilities/statistics`); // Loads the stats file
    statsFile.removeReaction(client, messageReaction, user, firestore); // Executes any function titled 'removeReaction' within the file
  } catch (e) {
    return;
  }
});

// Login to discord and notify when completed.
client.login().then(() => {
  console.log('All done!');
});
