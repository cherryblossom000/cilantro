import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, Permissions } from 'discord.js';
let options;
const command = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Gets my invite link.'),
    supportsDM: true,
    async execute(interaction) {
        await interaction.reply((options ??= {
            content: 'Invite me using this link!',
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            style: 'LINK',
                            label: 'Invite link',
                            url: interaction.client.generateInvite({
                                scopes: ['applications.commands', 'bot'],
                                permissions: [
                                    Permissions.FLAGS.VIEW_CHANNEL,
                                    Permissions.FLAGS.SEND_MESSAGES,
                                    Permissions.FLAGS.EMBED_LINKS,
                                    Permissions.FLAGS.CONNECT,
                                    Permissions.FLAGS.SPEAK
                                ]
                            })
                        })
                    ]
                })
            ]
        }));
    }
};
export default command;
//# sourceMappingURL=invite.js.map