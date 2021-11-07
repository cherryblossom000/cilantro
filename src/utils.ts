import {Constants, DiscordAPIError} from 'discord.js'
import {bold, codeBlock} from './discordjs-builders.js'
import type {Player, Queue, Song} from 'discord-music-player'
import type {CommandInteraction, Client, User} from 'discord.js'

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

export const dev = process.env.NODE_ENV !== 'production'

export const handleError =
  (
    client: Client,
    info?: string,
    {
      to: channelOrInteraction,
      response: content = 'Sorry, there was an error trying to do that!',
      followUp = false
    }: {
      to?: CommandInteraction
      response?: string
      followUp?: boolean
    } = {}
  ) =>
  (error: unknown): void => {
    if (!client.isReady()) {
      console.error('The error', error, 'occurred before the client was ready')
      if (dev) throw error
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
      if (channelOrInteraction) {
        await (followUp
          ? channelOrInteraction.followUp({content, ephemeral: true})
          : channelOrInteraction.reply({content, ephemeral: true})
        ).catch(errorHandler)
      }
      if (dev) throw error
      await (client.application.owner as User)
        .send(
          `${info === undefined ? '' : `${info}:\n`}${bold(
            `Error at ${new Date().toLocaleString()}`
          )}${
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

export const nowPlayingText = (song: Song): string =>
  `Now playing ${song.name} by ${song.author}`

export const getQueue = async (
  interaction: CommandInteraction<'present'>,
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
  interaction: CommandInteraction<'present'>,
  player: Player
): Promise<Queue | undefined> => {
  const queue = player.getQueue(interaction.guildId)
  if (!(queue?.isPlaying ?? false)) {
    await interaction.reply({content: 'Nothing is playing!', ephemeral: true})
    return
  }
  return queue
}
