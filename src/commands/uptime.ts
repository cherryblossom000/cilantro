import ms from 'ms'
import {SlashCommandBuilder} from '../discordjs-builders.js'
import type {Command} from '../command.js'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Gets my uptime.'),
  supportsDM: true,
  async execute(interaction) {
    await interaction.reply(ms(interaction.client.uptime))
  }
}
export default command
