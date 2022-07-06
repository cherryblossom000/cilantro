import { MongoClient } from 'mongodb';
export const connect = async () => (await new MongoClient(process.env.DB_URL, {
    retryWrites: true,
    w: 'majority'
}).connect())
    .db()
    .collection('guilds');
const cache = new Map();
export const getGuild = async (db, guildId) => (await db.findOne({ _id: guildId })) ?? undefined;
export const getVolume = async (db, guildId) => cache.get(guildId)?.volume ??
    (await db.findOne({ _id: guildId }, { projection: { volume: 1 } }))?.volume ??
    undefined;
export const setVolume = async (db, guildId, volume) => {
    await db.updateOne({ _id: guildId }, { $set: { volume } }, { upsert: true });
    cache.set(guildId, cache.has(guildId)
        ? { ...cache.get(guildId), volume }
        : { _id: guildId, volume });
};
//# sourceMappingURL=database.js.map