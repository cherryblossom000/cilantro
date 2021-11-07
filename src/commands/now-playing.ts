import {ProgressBar} from 'discord-music-player'
import {SlashCommandBuilder, bold} from '../discordjs-builders.js'
import {getPlayingQueue} from '../utils.js'
import type {Command} from '../command.js'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('now-playing')
    .setDescription('Gets the currently playing song.'),
  async execute(interaction, player) {
    const queue = await getPlayingQueue(interaction, player)
    if (!queue) return

    await interaction.reply(
      `Now playing ${bold(queue.nowPlaying.name)}
${new ProgressBar(queue).prettier}`
    )
  }
}
export default command
