import {MongoClient} from 'mongodb'
import type {RawSong} from 'discord-music-player'
import type {Snowflake} from 'discord.js'
import type {Collection} from 'mongodb'

interface Song {
  readonly raw: RawSong
  readonly requester: Snowflake
}

export interface Guild {
  readonly _id: Snowflake
  readonly queue?: readonly Song[]
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

const get =
  <K extends keyof Guild>(key: K) =>
  async (db: Db, guildId: Snowflake): Promise<Guild[K] | undefined> =>
    cache.get(guildId)?.[key] ??
    (await db.findOne({_id: guildId}, {projection: {[key]: 1}}))?.[key] ??
    undefined

export const getQueue = get('queue')
export const getVolume = get('volume')

const set =
  <K extends keyof Guild>(key: K) =>
  async (db: Db, guildId: Snowflake, value: Guild[K]): Promise<void> => {
    await db.updateOne({_id: guildId}, {$set: {[key]: value}})
    cache.set(
      guildId,
      cache.has(guildId)
        ? {...cache.get(guildId)!, [key]: value}
        : {_id: guildId, [key]: value}
    )
  }

export const setQueue = set('queue')
export const setVolume = set('volume')

export const addToQueue = async (
  db: Db,
  guildId: Snowflake,
  song: Song
): Promise<void> => {
  await db.updateOne({_id: guildId}, {$push: {queue: song}})
}
