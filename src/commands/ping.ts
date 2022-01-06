import {SlashCommandBuilder} from '@discordjs/builders'
import type {Command} from '../command.js'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Gets my latency.'),
  supportsDM: true,
  async execute(interaction) {
    await interaction.reply('Pinging…')
    await interaction.editReply(`Latency: ${
      Date.now() - interaction.createdTimestamp
    } ms
Websocket: ${interaction.client.ws.ping} ms`)
  }
}
export default command
