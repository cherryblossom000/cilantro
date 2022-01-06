import {SlashCommandBuilder, codeBlock} from '@discordjs/builders'
import {Utils} from 'discord-music-player'
import {getPlayingQueue, nowPlayingText} from '../utils.js'
import type {Command} from '../command.js'

const BAR_LENGTH = 20

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('now-playing')
    .setDescription('Gets the currently playing song.'),
  async execute(interaction, player) {
    const queue = await getPlayingQueue(interaction, player)
    if (!queue) return

    const {connection, nowPlaying} = queue
    const currentTime = nowPlaying.seekTime + connection.time
    const progress = Math.round(
      (currentTime / nowPlaying.milliseconds) * BAR_LENGTH
    )
    await interaction.reply({
      embeds: [
        {
          title: nowPlayingText(nowPlaying),
          thumbnail: {url: nowPlaying.thumbnail},
          fields: [{name: 'YouTube Author', value: nowPlaying.author}]
        }
      ],
      content: codeBlock(
        `${'█'.repeat(progress)}${'▒'.repeat(
          BAR_LENGTH - progress
        )} [${Utils.msToTime(currentTime)}/${nowPlaying.duration}]`
      )
    })
  }
}
export default command
