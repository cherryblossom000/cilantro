import * as http from 'node:http'
import {inlineCode} from '@discordjs/builders'
import {Player, type Queue} from 'discord-music-player'
import {
  Client,
  Intents,
  type CommandInteraction,
  type GuildTextBasedChannel,
  type Snowflake
} from 'discord.js'
import commands from './commands.js'
import * as db from './database.js'
import {dev, handleError, nowPlayingText} from './utils.js'
import type {AddressInfo} from 'node:net'
import 'dotenv/config'

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
        // not sure why this type assertion is necessary
        // both the TS language server and typescript-eslint agree that queue is
        // Queue, but tsc thinks it's Queue | Song | Playlist | undefined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- ^
        (queue as Queue).guild.id
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
          .reply({
            content: 'This command is only available in servers!',
            ephemeral: true
          })
          .catch(handleError(client, 'Failed to reply DM error message'))
        return
      }

      await execute(
        interaction as CommandInteraction<'cached'>,
        player,
        guildsToTextChannels,
        database
      ).catch(
        handleError(
          client,
          `Failed to execute command ${commandName}`,
          interaction,
          `Sorry, there was an error trying to execute /${commandName}.`
        )
      )
    }
  })

await client.login()

const TEXT = `Cilantro is up and running!
What, did you expect a proper website? Lol no`
const LENGTH = Buffer.byteLength(TEXT)
const server = http
  .createServer((_, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': LENGTH
    })
    res.end(TEXT)
  })
  .listen(Number(process.env.PORT), () => {
    if (dev)
      console.log(`http://localhost:${(server.address() as AddressInfo).port}`)
  })
