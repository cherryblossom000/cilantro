import {SlashCommandBuilder, bold, inlineCode} from '../discordjs-builders.js'
import {getPlayingQueue} from '../utils.js'
import type {Command} from '../command.js'

const INDEX = 'index'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a song from the queue.')
    .addIntegerOption(
      option =>
        option
          .setName(INDEX)
          .setDescription('The index of the song in the queue to remove.')
          .setRequired(true)
      // https://github.com/discordjs/builders/pull/47
      // .setMinValue(1)
    ),
  async execute(interaction, player) {
    const queue = await getPlayingQueue(interaction, player)
    if (!queue) return

    const {songs} = queue
    const index = interaction.options.getInteger(INDEX)!
    if (index < 1 || index > songs.length) {
      await interaction.reply(
        `${inlineCode(INDEX)} must be between 1 and ${songs.length}.`
      )
      return
    }

    // https://github.com/SushiBtw/discord-music-player/pull/245
    const song = songs.splice(index - 1, 1)[0]!
    await interaction.reply(`Removed ${bold(song.name)} from the queue.`)
  }
}
export default command
