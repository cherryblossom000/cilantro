import {Player, Song} from 'discord-music-player'
import {Client, Intents} from 'discord.js'
import dotenv from 'dotenv'
import Koa from 'koa'
import commands from './commands.js'
import * as db from './database.js'
import {inlineCode} from './discordjs-builders.js'
import {dev, handleError, nowPlayingText} from './utils.js'
import type {AddressInfo} from 'node:net'
import type {
  CommandInteraction,
  GuildTextBasedChannel,
  Snowflake
} from 'discord.js'

dotenv.config()

const database = await db.connect()

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
})

const toError = (reason: unknown): Error =>
  reason instanceof Error ? reason : new Error(`${reason}`)

if (dev) {
  process.on('unhandledRejection', reason => {
    throw toError(reason)
  })
} else {
  process.on('unhandledRejection', reason =>
    handleError(client, 'Uncaught promise rejection')(toError(reason))
  )
  process.on('uncaughtException', handleError(client, 'Uncaught exception'))
}

const guildsToTextChannels = new Map<Snowflake, GuildTextBasedChannel>()

const player = new Player(client, {deafenOnJoin: true})
  .on('error', (error, queue) =>
    handleError(
      client,
      `The ${inlineCode('error')} player event fired for queue for guild ${
        queue.guild.id
      }`
    )(error)
  )
  .on('songChanged', ({guild}, song) => {
    const channel = guildsToTextChannels.get(guild.id)
    channel
      ? channel
          .send(nowPlayingText(song))
          .catch(
            handleError(
              client,
              `Sending now playing message to channel ${channel.id} failed`
            )
          )
      : console.error(`Guild ${guild.id} does not have a text channel`)
  })

client
  .once('ready', () => console.log('ready'))
  .once('guildCreate', async ({id}) => {
    try {
      const {queue: songs = [], volume} =
        (await db.getGuild(database, id)) ?? {}
      if (volume !== undefined || songs.length) {
        const queue = player.createQueue(id)
        if (volume !== undefined) queue.setVolume(volume)
        if (songs.length) {
          await Promise.all(
            songs.map(async song =>
              queue.play(
                new Song(
                  song.raw,
                  queue,
                  await client.users.fetch(song.requester)
                )
              )
            )
          )
        }
      }
    } catch (error) {
      handleError(
        client,
        `Failed to initialise queue and volume of guild ${id}`
      )(error)
    }
  })
  .on(
    'error',
    handleError(client, `The ${inlineCode('error')} client event fired`)
  )
  .on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
      const {commandName} = interaction

      const {supportsDM = false, execute} = commands.get(commandName)!
      if (!supportsDM && !interaction.inGuild()) {
        await interaction
          .reply('I only work in servers!')
          .catch(handleError(client, 'Failed to reply DM error message'))
        return
      }

      await execute(
        interaction as CommandInteraction<'present'>,
        player,
        database,
        guildsToTextChannels
      ).catch(handleError(client, `Failed to execute command ${commandName}`))
    }
  })

await client.login()

const listener = new Koa()
  .use(ctx => {
    ctx.body = `Cilantro is up and running!
What, did you expect a proper website? Lol no`
  })
  .listen(Number(process.env.PORT), () => {
    if (dev) {
      console.log(
        `http://localhost:${(listener.address() as AddressInfo).port}`
      )
    }
  })
