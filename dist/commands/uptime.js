import { SlashCommandBuilder } from '@discordjs/builders';
import ms from 'ms';
const command = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Gets my uptime.'),
    supportsDM: true,
    async execute(interaction) {
        await interaction.reply(ms(interaction.client.uptime));
    }
};
export default command;
//# sourceMappingURL=uptime.js.map