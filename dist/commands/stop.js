import { SlashCommandBuilder } from '@discordjs/builders';
import { getQueue } from '../utils.js';
const command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue.'),
    async execute(interaction, player) {
        const queue = await getQueue(interaction, player);
        if (!queue)
            return;
        if (!queue.isPlaying) {
            await interaction.reply({
                content: 'The song is already paused!',
                ephemeral: true
            });
            return;
        }
        queue.stop();
        await interaction.reply('Stopped the music.');
    }
};
export default command;
//# sourceMappingURL=stop.js.map