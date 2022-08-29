import { REST } from '@discordjs/rest';
import { Firestore } from '@google-cloud/firestore';
import { Routes } from 'discord-api-types/v10';
import { readdirSync } from 'fs';
import * as path from 'path';
import { CommandDerived } from './utilities/command';

export async function deployGlobalCommands(
  clientId: string,
  token: string
): Promise<void> {
  const commands = [];
  const commandFiles = readdirSync(path.join(__dirname, 'commands'));
  const rest = new REST({ version: '10' }).setToken(token);

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file, 'index'));
    commands.push(command.data.toJSON());
  }

  try {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
}

export async function deployCommands(
  clientId: string,
  guildId: string,
  token: string,
  firestore: Firestore
): Promise<void> {
  const commands = [];
  const commandFiles = readdirSync(path.join(__dirname, 'commands'));
  const rest = new REST({ version: '9' }).setToken(token);

  for (const file of commandFiles) {
    const commandDerived: CommandDerived = require(path.join(
      __dirname,
      'commands',
      file,
      'index'
    )).default; // Loads up the command based on file name
    const command = new commandDerived(firestore);
    const slashCommandBuilder = await command.build();
    commands.push(slashCommandBuilder.toJSON());
  }

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands
    });

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
}
