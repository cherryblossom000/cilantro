import {Utils} from 'discord-music-player'
import {SlashCommandBuilder, inlineCode} from '../discordjs-builders.js'
import {getPlayingQueue, parseTime, setChannel} from '../utils.js'
import type {Command} from '../command.js'

const TIME = 'time'

const HELP_MSG = `${inlineCode(
  TIME
)} must be a timestamp, with optionally a ${inlineCode('+')} or ${inlineCode(
  '-'
)} to indicate times relative to the current position in the song.
Examples:
- ${inlineCode('3:00')} jump to 3 minutes
- ${inlineCode('+10')} forward 10 seconds
- ${inlineCode('-2:01:15')} back 2 hours, 1 minute, and 15 seconds`

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seeks to a time in a song.')
    .addStringOption(option =>
      option
        .setName(TIME)
        .setDescription(
          'A timestamp with optional + or - for relative times (e.g. +10, -1:00).'
        )
        .setRequired(true)
    ),
  async execute(interaction, player, guildsToTextChannels) {
    const queue = await getPlayingQueue(interaction, player)
    if (!queue) return

    const rawTime = interaction.options.getString(TIME)!
    const ms = parseTime(rawTime, queue)
    if (ms === undefined) {
      await interaction.reply({
        content: `Invalid time ${rawTime}!\n${HELP_MSG}`,
        ephemeral: true
      })
      return
    }

    await interaction.deferReply()
    await queue.seek(ms)
    await setChannel(guildsToTextChannels, interaction)
    await interaction.editReply(
      `Playing from ${Utils.msToTime(ms)}. This might take some time…`
    )
  }
}
export default command
