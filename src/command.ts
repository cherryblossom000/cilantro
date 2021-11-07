import type {SlashCommandBuilder} from '@discordjs/builders'
import type {Player} from 'discord-music-player'
import type {
  CacheType,
  Client,
  CommandInteraction,
  GuildTextBasedChannel,
  Snowflake
} from 'discord.js'
import type {Db} from './database.js'

type PropIfTrue<T extends boolean, K extends PropertyKey> = T extends true
  ? Record<K, true>
  : Partial<Record<K, false>>

type CommandBase<SupportsDM extends boolean> = PropIfTrue<
  SupportsDM,
  'supportsDM'
> & {
  data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  execute: (
    interaction: CommandInteraction<
      SupportsDM extends true ? CacheType : 'present'
    > & {readonly client: Client<true>},
    player: Player,
    database: Db,
    guildsToTextChannels: Map<Snowflake, GuildTextBasedChannel>
  ) => Promise<void>
}

export type Command = CommandBase<false> | CommandBase<true>
