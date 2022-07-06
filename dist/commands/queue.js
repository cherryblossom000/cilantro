import { SlashCommandBuilder, hyperlink } from '@discordjs/builders';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
const BACK_ID = 'back';
const FORWARD_ID = 'forward';
const backButton = new MessageButton({
    style: 'SECONDARY',
    label: 'Back',
    emoji: '⬅️',
    customId: BACK_ID
});
const forwardButton = new MessageButton({
    style: 'SECONDARY',
    label: 'Forward',
    emoji: '➡️',
    customId: FORWARD_ID
});
const command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Gets the queue.'),
    execute: async (interaction, player) => {
        const { guildId, user } = interaction;
        const songs = player.getQueue(guildId)?.songs;
        if (!songs || !songs.length) {
            await interaction.reply('The queue is empty!');
            return;
        }
        const generateEmbed = (start) => {
            const current = songs.slice(start, start + 10);
            return new MessageEmbed({
                title: `Showing songs ${start + 1}-${start + current.length} out of ${songs.length}`,
                fields: current.map((song, i) => ({
                    name: `${start + i + 1}. ${song.name}`,
                    value: `${hyperlink('Link', song.url)} | Requested by ${song.requestedBy}`
                }))
            });
        };
        const canFitOnOnePage = songs.length <= 10;
        const embedMessage = await interaction.reply({
            embeds: [generateEmbed(0)],
            components: canFitOnOnePage
                ? []
                : [new MessageActionRow({ components: [forwardButton] })],
            fetchReply: true
        });
        if (canFitOnOnePage)
            return;
        const collector = embedMessage.createMessageComponentCollector({
            filter: reaction => reaction.user.id === user.id
        });
        let currentIndex = 0;
        collector.on('collect', async (buttonInteraction) => {
            buttonInteraction.customId === BACK_ID
                ? (currentIndex -= 10)
                : (currentIndex += 10);
            await buttonInteraction.update({
                embeds: [generateEmbed(currentIndex)],
                components: [
                    new MessageActionRow({
                        components: [
                            ...(currentIndex ? [backButton] : []),
                            ...(currentIndex + 10 < songs.length ? [forwardButton] : [])
                        ]
                    })
                ]
            });
        });
    }
};
export default command;
//# sourceMappingURL=queue.js.map