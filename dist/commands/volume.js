import { SlashCommandBuilder } from '@discordjs/builders';
import { getVolume, setVolume } from '../database.js';
const VOLUME = 'volume';
const command = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Queries or sets the volume.')
        .addNumberOption(option => option
        .setName(VOLUME)
        .setDescription('The new volume. 100 = normal volume, 50 = 50% volume, etc.')),
    execute: async (interaction, player, _, db) => {
        const { guildId, options } = interaction;
        const queue = player.getQueue(guildId);
        const volume = options.getNumber(VOLUME);
        if (volume === null) {
            await interaction.reply(`Volume: ${queue ? queue.volume / 2 : (await getVolume(db, guildId)) ?? 100}`);
            return;
        }
        queue?.setVolume(volume * 2);
        await setVolume(db, guildId, volume);
        await interaction.reply(`Set the volume to ${volume}.`);
    }
};
export default command;
//# sourceMappingURL=volume.js.map