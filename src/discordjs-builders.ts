import {createRequire} from 'node:module'
import type DiscordJSBuilders from '@discordjs/builders'

const require = createRequire(import.meta.url)

export const {SlashCommandBuilder, bold, codeBlock, hyperlink, inlineCode} =
  require('@discordjs/builders') as typeof DiscordJSBuilders
