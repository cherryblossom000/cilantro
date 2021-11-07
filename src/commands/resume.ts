import {SlashCommandBuilder} from '../discordjs-builders.js'
import type {Command} from '../command.js'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the music.'),
  execute: async (interaction, player) => {
    const queue = player.getQueue(interaction.guildId)
    if (!queue || !queue.songs.length) {
      await interaction.reply({
        content: 'The queue is empty! Nothing to resume.',
        ephemeral: true
      })
      return
    }
    if (queue.isPlaying) {
      await interaction.reply({
        content: 'The song is already playing!',
        ephemeral: true
      })
      return
    }

    queue.setPaused(true)
    await interaction.reply('Resumed the music.')
  }
}
export default command
