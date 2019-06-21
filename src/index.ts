import { config } from 'dotenv';
config();

import { Client } from 'discord.js';

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  if (msg.content === 'ping') {
    msg.react('👍');
    msg.channel.send('message');
  }
});

// client.on('messageReactionAdd', (msgReaction, user) => {
//   console.log('user add', user);
// });

// client.on('messageReactionRemove', (msgReaction, user) => {
//   console.log('user remove', user);
// });

client.login(process.env.BOT_TOKEN);
