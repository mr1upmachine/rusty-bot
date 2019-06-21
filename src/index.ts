import { Client } from 'discord.js';
import { config } from 'dotenv';

const client = new Client();
config();

client.on('message', (msg) => {
  // TODO add custom prefix & configurable prefix support
  const prefix = '!';
  if (msg.content[0] !== prefix) { return; }

  const args = msg.content.trim().split(' '); // Setting-up arguments of command
  const cmd = (args.shift() || '').toLowerCase(); // LowerCase command

  try {
    const commandFile = require(`./commands/${cmd}.js`); // Require command from folder
    commandFile.run(client, msg, args); // Pass four args into 'command'.js and run it
  } catch (e) {
    return;
  }
});

client.login(process.env.TOKEN).then(() => {
  // tslint:disable-next-line: no-console
  console.log('All done!');
});
