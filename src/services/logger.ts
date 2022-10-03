import type { Guild, GuildMember, TextBasedChannel, Role } from 'discord.js';

export class Logger {
  constructor(
    protected readonly guild: Guild,
    protected readonly channel: TextBasedChannel,
    protected readonly mentionable: Role | GuildMember
  ) {}

  async info(message: string, mention?: boolean): Promise<void> {
    await this.channel.send(
      mention ? `${this.mentionable.toString()} ${message}` : message
    );
  }

  async error(err: Error): Promise<void> {
    await this.channel.send(`${this.mentionable.toString()} ${err.message}`);
  }
}
