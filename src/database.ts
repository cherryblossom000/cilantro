import {MongoClient} from 'mongodb'
import type {Snowflake} from 'discord.js'
import type {Collection} from 'mongodb'

export interface Guild {
  readonly _id: Snowflake
  readonly volume?: number
}

export type Db = Collection<Guild>

export const connect = async (): Promise<Db> =>
  (
    await new MongoClient(process.env.DB_URL!, {
      retryWrites: true,
      w: 'majority'
    }).connect()
  )
    .db()
    .collection('guilds')

const cache = new Map<Snowflake, Guild>()

export const getGuild = async (
  db: Db,
  guildId: Snowflake
): Promise<Guild | undefined> => (await db.findOne({_id: guildId})) ?? undefined

export const getVolume = async (
  db: Db,
  guildId: Snowflake
): Promise<number | undefined> =>
  cache.get(guildId)?.volume ??
  (await db.findOne({_id: guildId}, {projection: {volume: 1}}))?.volume ??
  undefined

export const setVolume = async (
  db: Db,
  guildId: Snowflake,
  volume: number
): Promise<void> => {
  await db.updateOne({_id: guildId}, {$set: {volume}}, {upsert: true})
  cache.set(
    guildId,
    cache.has(guildId)
      ? {...cache.get(guildId)!, volume}
      : {_id: guildId, volume}
  )
}
