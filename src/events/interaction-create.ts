import type { Interaction } from 'discord.js';

import { RustyBotCommandError } from '../errors/rusty-bot-errors.js';
import { ClientEvent } from '../types/client-event.js';
import { useCommand } from '../utilities/use-command.js';

class InteractionCreateEvent extends ClientEvent<'interactionCreate'> {
  async execute(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand() || !interaction.isChatInputCommand()) return;

    try {
      const command = useCommand(interaction.commandName);
      await command.execute(interaction);
    } catch (e: unknown) {
      if (!(e instanceof RustyBotCommandError)) {
        throw e;
      }

      const message = e.message;

      if (interaction.replied) {
        await interaction.followUp({ content: message, ephemeral: true });
      } else {
        await interaction.reply({ content: message, ephemeral: true });
      }
    }
  }
}

export default InteractionCreateEvent;
