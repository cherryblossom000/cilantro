import {REST} from '@discordjs/rest'
import {Routes} from 'discord-api-types/v9'
import dotenv from 'dotenv'
import commands from '../../dist/commands.js'
import {dev} from '../../dist/utils.js'
import type {RESTPutAPIApplicationCommandsJSONBody} from 'discord-api-types/v9'

dotenv.config()

const applicationId = process.env.DISCORD_APP_ID!
const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN!)

const body: RESTPutAPIApplicationCommandsJSONBody = commands.map(({data}) =>
  data.toJSON()
)

await rest.put(
  dev
    ? Routes.applicationGuildCommands(applicationId, process.env.TEST_GUILD_ID!)
    : Routes.applicationCommands(applicationId),
  {body}
)
