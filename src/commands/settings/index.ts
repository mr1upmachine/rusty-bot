import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../../utilities/command';
import { karma } from './karma';
import { scanMembers } from './scan-members';
import { setup } from './setup';

// TODO: Not implemented/not validated subcommands:
// setup: Once we have more than one setting for a guild, we can use setup as a wizard to guide admins through them
// scan-members: If/when Rusty gets a website, this command will iterate through all existing users to make sure they have a document in firestore

export default class SettingsCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('settings')
      .setDescription('Configuration options')
      .addSubcommand((setup) =>
        setup.setName('setup').setDescription('First time setup wizard')
      )
      .addSubcommand((karma) =>
        karma
          .setName('karma')
          .setDescription(
            'Set which channels have message reactions tracked for karma'
          )
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('The channel to modify')
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName('value')
              .setDescription('Enable or disable tracking')
              .setRequired(false)
          )
      );
  }

  async execute(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    const subcommand = interaction.options.getSubcommand();

    // Ensures only admins may use this command
    if (!member.permissions.has('ADMINISTRATOR')) {
      throw new Error(
        'Insufficient permissions. Only Administrators may use this command.'
      );
    }

    switch (subcommand) {
      case 'setup':
        await setup(interaction);
        break;

      case 'karma':
        await karma(this.firestore, interaction);
        break;

      case 'scan-members':
        await scanMembers(this.firestore, interaction);
        break;

      default:
        throw new Error('Unable to determine subcommand');
    }
  }
}
