import {SlashCommandBuilder} from '../discordjs-builders.js'
import {getPlayingQueue} from '../utils.js'
import type {Command} from '../command.js'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the music.'),
  execute: async (interaction, player) => {
    const queue = await getPlayingQueue(interaction, player)
    if (!queue) return
    if (queue.paused) {
      await interaction.reply({
        content: 'The song is already paused!',
        ephemeral: true
      })
      return
    }

    queue.setPaused(true)
    await interaction.reply('Paused the music.')
  }
}
export default command
