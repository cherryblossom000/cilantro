import {DMPError, DMPErrors} from 'discord-music-player'
import {addToQueue} from '../database.js'
import {bold, SlashCommandBuilder} from '../discordjs-builders.js'
import {nowPlayingText} from '../utils.js'
import type {GuildTextBasedChannel} from 'discord.js'
import type {PlayOptions, Song} from 'discord-music-player'
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
    .addNumberOption(option =>
      option.setName(SEEK).setDescription('The time to seek to.')
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
  execute: async (interaction, player, db, guildsToTextChannels) => {
    const {channelId, client, guild, guildId, options, user} = interaction

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
    if (
      (queue.connection as typeof queue.connection | undefined)?.channel.id !==
      voiceChannel.id
    )
      await queue.join(voiceChannel)

    const wasPlaying = queue.isPlaying

    const query = options.getString(SONG)!
    let song: Song
    try {
      song = await queue.play(query, {
        timecode: true,
        requestedBy: user,
        seek: options.getNumber(SEEK) ?? undefined,
        uploadDate: (options.getString(UPLOAD_DATE) ??
          undefined) as PlayOptions['uploadDate'],
        duration: (options.getString(DURATION) ??
          undefined) as PlayOptions['duration'],
        sortBy: (options.getString(SORT) ?? undefined) as PlayOptions['sortBy']
      })
    } catch (error) {
      if (error instanceof DMPError && error.name === DMPErrors.SEARCH_NULL) {
        await interaction.reply(
          `No YouTube search results found for ${bold(query)}.`
        )
        return
      }
      throw error
    }

    guildsToTextChannels.set(
      guildId,
      (await client.channels.fetch(channelId)) as GuildTextBasedChannel
    )
    await addToQueue(db, guildId, {
      raw: {
        author: song.author,
        duration: song.duration,
        isLive: song.isLive,
        name: song.name,
        thumbnail: song.thumbnail,
        url: song.url,
        seekTime: song.seekTime
      },
      requester: user.id
    })
    await interaction.editReply(
      wasPlaying
        ? `Added ${song.name} by ${song.author} to the queue.`
        : nowPlayingText(song)
    )
  }
}
export default command
