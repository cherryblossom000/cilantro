import {DMPError, DMPErrors, Utils} from 'discord-music-player'
import {getVolume} from '../database.js'
import {bold, SlashCommandBuilder} from '../discordjs-builders.js'
import {nowPlayingText, parseTime, setChannel} from '../utils.js'
import type {PlayOptions} from 'discord-music-player'
import type {Command} from '../command.js'
import type {KeysMatching} from '../utils.js'

const SONG = 'song'
const SEEK = 'seek'
const UPLOAD_DATE = 'upload-date'
const DURATION = 'duration'
const SORT = 'sort'

type YouTubeSearchFilterChoices<
  K extends KeysMatching<PlayOptions, string | undefined>
> = Record<NonNullable<PlayOptions[K]>, string>

const uploadDateChoices: YouTubeSearchFilterChoices<'uploadDate'> = {
  hour: 'Last hour',
  today: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year'
}

const durationDateChoices: YouTubeSearchFilterChoices<'duration'> = {
  short: '<4 minutes',
  long: '>20 minutes'
}

const sortChoices: YouTubeSearchFilterChoices<'sortBy'> = {
  relevance: 'Relevance',
  date: 'Upload date',
  'view count': 'View count',
  rating: 'Rating'
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song.')
    .addStringOption(option =>
      option.setName(SONG).setDescription('The song to play.').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName(SEEK)
        .setDescription('The time to seek to. See /seek for details.')
    )
    .addStringOption(option =>
      option
        .setName(UPLOAD_DATE)
        .setDescription('Filter YouTube results by upload date.')
        .addChoices(Object.entries(uploadDateChoices))
    )
    .addStringOption(option =>
      option
        .setName(DURATION)
        .setDescription('Filter YouTube results by video duration.')
        .addChoices(Object.entries(durationDateChoices))
    )
    .addStringOption(option =>
      option
        .setName(SORT)
        .setDescription('Sort YouTube results.')
        .addChoices(Object.entries(sortChoices))
    ),
  execute: async (interaction, player, guildsToTextChannels, db) => {
    const {guild, guildId, options, user} = interaction

    const voiceChannel = guild?.voiceStates.cache.get(user.id)?.channel
    if (!voiceChannel) {
      await interaction.reply({
        content: 'You must be in a voice channel!',
        ephemeral: true
      })
      return
    }

    await interaction.deferReply()
    const queue = player.createQueue(guildId)
    const connection = queue.connection as typeof queue.connection | undefined
    if (connection?.channel.id !== voiceChannel.id)
      await queue.join(voiceChannel)
    queue.setVolume(((await getVolume(db, guildId)) ?? 100) * 2)

    const wasPlaying = queue.isPlaying

    const query = options.getString(SONG)!
    const seek = options.getString(SEEK)
    // discord-music-player doesn't save seekTime when the song is not played immediately
    const song = await Utils.best(
      query,
      {
        timecode: true,
        requestedBy: user,
        uploadDate: (options.getString(UPLOAD_DATE) ??
          undefined) as PlayOptions['uploadDate'],
        duration: (options.getString(DURATION) ??
          undefined) as PlayOptions['duration'],
        sortBy: (options.getString(SORT) ?? undefined) as PlayOptions['sortBy']
      },
      queue
    )
    song.seekTime = (seek === null ? undefined : parseTime(seek)) ?? 0
    try {
      await queue.play(song)
    } catch (error) {
      if (error instanceof DMPError && error.name === DMPErrors.SEARCH_NULL) {
        await interaction.reply(
          `No YouTube search results found for ${bold(query)}.`
        )
        return
      }
      throw error
    }

    await setChannel(guildsToTextChannels, interaction)
    await interaction.editReply(
      wasPlaying
        ? `Added ${bold(song.name)} to the queue.`
        : nowPlayingText(song)
    )
  }
}
export default command
