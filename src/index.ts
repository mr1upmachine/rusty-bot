import { Firestore } from '@google-cloud/firestore';
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
    commandFile.run(client, msg, args); // Executes any function titled 'run' within the file
  } catch (e) {
    return;
  }
});

client.on('raw', (packet) => {
  // We don't want this to run on unrelated packets
  if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) { return; }
  // Grab the channel to check the message from
  const channel = client.channels.get(packet.d.channel_id);
  // There's no need to emit if the message is cached, because the event will fire anyway for that
  if (channel.messages.has(packet.d.message_id)) { return; }
  // Since we have confirmed the message is not cached, let's fetch it
  channel.fetchMessage(packet.d.message_id).then((message) => {
      // Emojis can have identifiers of name:id format, so we have to account for that case as well
      const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
      // This gives us the reaction we need to emit the event properly, in top of the message object
      const reaction = message.reactions.get(emoji);
      // Adds the currently reacting user to the reaction's users collection.
      if (reaction) { reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id)); }
      // Check which type of event it is before emitting
      if (packet.t === 'MESSAGE_REACTION_ADD') {
          client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
          client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
      }
  });
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
