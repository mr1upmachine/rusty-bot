// import { Firestore } from '@google-cloud/firestore';
import { Client } from 'discord.js';
import { config } from 'dotenv';

// Setup for dotenv
config();
if (!process.env.TOKEN) { throw new Error('TOKEN must be provided'); }
// if (!process.env.GCP_EMAIL) { throw new Error('GCP_EMAIL must be provided'); }
// if (!process.env.GCP_KEY) { throw new Error('GCP_KEY must be provided'); }

// Setup for discord.js
const client = new Client();
client.token = process.env.TOKEN;

// Setup for GCP
// const firestore = new Firestore({
//   credentials: {
//     client_email: process.env.GCP_EMAIL,
//     private_key: process.env.GCP_KEY,
//   },
// });

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
    commandFile.run(client, msg, args); // Executes any function titled 'run' within the file
  } catch (e) {
    return;
  }
});

// discord.js add reaction event
client.on('messageReactionAdd', (messageReaction, user) => {
  // TODO
});

// discord.js remove reaction event
client.on('messageReactionRemove', (messageReaction, user) => {
  // TODO
});

// Login to discord and notify when completed.
client.login().then(() => {
  console.log('All done!');
});
