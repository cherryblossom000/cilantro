import { SlashCommandBuilder } from '@discordjs/builders';
const command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Gets my latency.'),
    supportsDM: true,
    async execute(interaction) {
        await interaction.reply('Pinging…');
        await interaction.editReply(`Latency: ${Date.now() - interaction.createdTimestamp} ms
Websocket: ${interaction.client.ws.ping} ms`);
    }
};
export default command;
//# sourceMappingURL=ping.js.map