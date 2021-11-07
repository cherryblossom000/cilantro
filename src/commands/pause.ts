import {SlashCommandBuilder} from '../discordjs-builders.js'
import {getQueue} from '../utils.js'
import type {Command} from '../command.js'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the music.'),
  execute: async (interaction, player) => {
    const queue = await getQueue(interaction, player)
    if (!queue) return
    if (!queue.isPlaying) {
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
