import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../utilities/command';
import { getVideoMeta } from 'tiktok-scraper';
import * as fs from 'fs';
import * as https from 'https';

export default class TiktokCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('tiktok')
      .setDescription('BETA: Reuploads tiktok videos')
      .addStringOption((urlOption) =>
        urlOption
          .setName('url')
          .setDescription('A valid TikTok URL')
          .setRequired(true)
      );
  }

  async execute(interaction: CommandInteraction) {
    const videoUrl = interaction.options.getString('url', true);

    try {
      const videoMeta = await getVideoMeta(videoUrl, {});
      console.log(videoMeta);
      const headers = videoMeta.headers;
      const internalUrl = new URL(videoMeta.collector[0].videoUrl);

      const options: https.RequestOptions = {
        hostname: internalUrl.hostname,
        path: internalUrl.pathname,
        headers: { ...headers }
      };

      console.log(options);

      const file = fs.createWriteStream('tiktokTest.mp4');
      await https.get(options, (video) => {
        video.pipe(file);
      });
    } catch (e) {
      throw new Error(e as string);
    }

    interaction.reply(`Test`);
  }
}
