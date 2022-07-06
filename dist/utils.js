import { bold, codeBlock } from '@discordjs/builders';
import { Constants, DiscordAPIError } from 'discord.js';
export const dev = process.env.NODE_ENV !== 'production';
export const handleError = (client, info, interaction, response = 'Sorry, there was an error trying to do that!') => (error) => {
    if (!client.isReady()) {
        console.error('The error', error, 'occurred before the client was ready');
        return;
    }
    const errorHandler = (err) => {
        console.error('The error', err, 'occurred when trying to handle the error', error);
        if (dev)
            throw err;
    };
    (async () => {
        if (interaction) {
            const options = { content: response, ephemeral: true };
            (interaction.deferred
                ? interaction.editReply(options)
                : interaction.replied
                    ? interaction.followUp(options)
                    : interaction.reply(options)).catch(errorHandler);
        }
        await (await client.users.fetch(process.env.OWNER_ID))
            .send(`${info === undefined ? '' : `${info}:\n`}${bold(`Error at ${new Date().toLocaleString()}`)}: ${error instanceof Error
            ? error.stack
                ? `
      ${error.stack}`
                : ''
            : error}${error instanceof DiscordAPIError
            ? `
Code: ${error.code} (${Object.entries(Constants.APIErrors).find(([, code]) => code === error.code)?.[0] ?? '<unknown>'})
Path: ${error.path}
Method: ${error.method}
Status: ${error.httpStatus}
Request data:
${codeBlock('json', JSON.stringify(error.requestData, null, 2))}`
            : ''}`)
            .catch(errorHandler);
    })();
};
const TIME_RE = /^(?<relative>\+|-)?(?:(?:(?<hrs>\d+):)?(?<mins>\d+):)?(?<secs>\d+)$/u;
export const parseTime = (time, queue) => {
    const groups = TIME_RE.exec(time)?.groups;
    if (!groups)
        return;
    const { relative, hrs, mins, secs } = groups;
    const ms = ((hrs === undefined ? 0 : Number(hrs) * 3600) +
        (mins === undefined ? 0 : Number(mins) * 60) +
        Number(secs)) *
        1000;
    if (Number.isNaN(ms))
        return;
    return queue
        ? relative === '+'
            ? queue.connection.time + ms
            : relative === '-'
                ? queue.connection.time - ms
                : ms
        : ms;
};
export const nowPlayingText = (song) => `Now playing ${bold(song.name)}.`;
export const getQueue = async (interaction, player) => {
    const queue = player.getQueue(interaction.guildId);
    if (!queue) {
        await interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
        return;
    }
    return queue;
};
export const getPlayingQueue = async (interaction, player) => {
    const queue = player.getQueue(interaction.guildId);
    if (!(queue?.isPlaying ?? false)) {
        await interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
        return;
    }
    return queue;
};
export const setChannel = async (guildsToTextChannels, { channelId, client, guildId }) => {
    guildsToTextChannels.set(guildId, (await client.channels.fetch(channelId)));
};
//# sourceMappingURL=utils.js.map