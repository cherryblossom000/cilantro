import {bold, codeBlock} from '@discordjs/builders'
import {
  Constants,
  DiscordAPIError,
  type CommandInteraction,
  type Client,
  type GuildTextBasedChannel,
  type Snowflake
} from 'discord.js'
import type {Player, Queue, Song} from 'discord-music-player'

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

type Override<T, U> = Omit<T, keyof U> & U

export const dev = process.env.NODE_ENV !== 'production'

export const handleError =
  (
    client: Client,
    info?: string,
    interaction?: CommandInteraction,
    response = 'Sorry, there was an error trying to do that!'
  ) =>
  (error: unknown): void => {
    if (!client.isReady()) {
      console.error('The error', error, 'occurred before the client was ready')
      // if (dev) throw error
      return
    }

    const errorHandler = (err: unknown): void => {
      console.error(
        'The error',
        err,
        'occurred when trying to handle the error',
        error
      )
      if (dev) throw err
    }

    // only error that will be thrown is if it's in development mode, which is intended
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- ^
    ;(async (): Promise<void> => {
      if (interaction) {
        const options = {content: response, ephemeral: true}
        ;(interaction.deferred
          ? interaction.editReply(options)
          : interaction.replied
          ? interaction.followUp(options)
          : interaction.reply(options)
        ).catch(errorHandler)
      }
      // if (dev) throw error
      await (
        await client.users.fetch(process.env.OWNER_ID!)
      )
        .send(
          `${info === undefined ? '' : `${info}:\n`}${bold(
            `Error at ${new Date().toLocaleString()}`
          )}: ${
            error instanceof Error
              ? error.stack!
                ? `
      ${error.stack}`
                : ''
              : error
          }${
            error instanceof DiscordAPIError
              ? `
Code: ${error.code} (${
                  Object.entries(Constants.APIErrors).find(
                    ([, code]) => code === error.code
                  )?.[0] ?? '<unknown>'
                })
Path: ${error.path}
Method: ${error.method}
Status: ${error.httpStatus}
Request data:
${codeBlock('json', JSON.stringify(error.requestData, null, 2))}`
              : ''
          }`
        )
        .catch(errorHandler)
    })()
  }

const TIME_RE =
  // eslint-disable-next-line unicorn/no-unsafe-regex -- don't know how else to do it
  /^(?<relative>\+|-)?(?:(?:(?<hrs>\d+):)?(?<mins>\d+):)?(?<secs>\d+)$/u as Override<
    RegExp,
    {
      exec(string: string): Override<
        RegExpExecArray,
        {
          groups: {
            relative?: '-' | '+'
            hrs?: string
            mins?: string
            secs: string
          }
        }
      > | null
    }
  >

type Require<T, K extends keyof T> = T & {[P in K]: NonNullable<T[P]>}

type PlayingQueue = Require<Queue, 'connection' | 'nowPlaying'>

export const parseTime = (
  time: string,
  queue?: PlayingQueue
): number | undefined => {
  const groups = TIME_RE.exec(time)?.groups
  if (!groups) return

  const {relative, hrs, mins, secs} = groups
  const ms =
    ((hrs === undefined ? 0 : Number(hrs) * 3600) +
      (mins === undefined ? 0 : Number(mins) * 60) +
      Number(secs)) *
    1000
  if (Number.isNaN(ms)) return
  return queue
    ? relative === '+'
      ? queue.connection.time + ms
      : relative === '-'
      ? queue.connection.time - ms
      : ms
    : ms
}

export const nowPlayingText = (song: Song) =>
  `Now playing ${bold(song.name)}.` as const

export const getQueue = async (
  interaction: CommandInteraction<'cached'>,
  player: Player
): Promise<Queue | undefined> => {
  const queue = player.getQueue(interaction.guildId)
  if (!queue) {
    await interaction.reply({content: 'Nothing is playing!', ephemeral: true})
    return
  }
  return queue
}

export const getPlayingQueue = async (
  interaction: CommandInteraction<'cached'>,
  player: Player
): Promise<PlayingQueue | undefined> => {
  const queue = player.getQueue(interaction.guildId)
  if (!(queue?.isPlaying ?? false)) {
    await interaction.reply({content: 'Nothing is playing!', ephemeral: true})
    return
  }
  return queue as PlayingQueue
}

export const setChannel = async (
  guildsToTextChannels: Map<Snowflake, GuildTextBasedChannel>,
  {channelId, client, guildId}: CommandInteraction<'cached'>
): Promise<void> => {
  guildsToTextChannels.set(
    guildId,
    (await client.channels.fetch(channelId)) as GuildTextBasedChannel
  )
}
