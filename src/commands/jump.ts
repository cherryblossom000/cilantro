import {SlashCommandBuilder, bold, inlineCode} from '../discordjs-builders.js'
import {getPlayingQueue, setChannel} from '../utils.js'
import type {Command} from '../command.js'

const INDEX = 'index'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('Jumps to a song in the queue.')
    .addIntegerOption(
      option =>
        option
          .setName(INDEX)
          .setDescription('The index of the song in the queue to jump to.')
          .setRequired(true)
      // https://github.com/discordjs/builders/pull/47
      // .setMinValue(2)
    ),
  async execute(interaction, player, guildsToTextChannels) {
    const queue = await getPlayingQueue(interaction, player)
    if (!queue) return

    const {connection, songs} = queue
    if (songs.length < 2) {
      await interaction.reply(
        `The queue only has ${songs.length} song${
          songs.length === 1 ? '' : 's'
        } in it!`
      )
      return
    }

    const index = interaction.options.getInteger(INDEX)!
    if (index < 2 || index > songs.length) {
      await interaction.reply(
        `${inlineCode(INDEX)} must be between 2 and ${songs.length}.`
      )
      return
    }

    songs.splice(0, index - 2)
    connection.stop()
    await setChannel(guildsToTextChannels, interaction)
    // eslint-disable-next-line unicorn/consistent-destructuring -- nowPlaying is getter
    await interaction.reply(`Jumped to ${bold(queue.nowPlaying.name)}.`)
  }
}
export default command
