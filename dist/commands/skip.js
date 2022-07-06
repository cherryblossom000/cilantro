import { SlashCommandBuilder, bold } from '@discordjs/builders';
import { getPlayingQueue, setChannel } from '../utils.js';
const command = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song.'),
    async execute(interaction, player, guildsToTextChannels) {
        const queue = await getPlayingQueue(interaction, player);
        if (!queue)
            return;
        const { name } = queue.skip();
        await setChannel(guildsToTextChannels, interaction);
        await interaction.reply(`Skipped ${bold(name)}.`);
    }
};
export default command;
//# sourceMappingURL=skip.js.map