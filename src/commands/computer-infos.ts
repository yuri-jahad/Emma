import { SlashCommandBuilder } from 'discord.js'
import { getSystemInfo } from '../utils/get-computer-infos'
import ColorMessage from '../utils/colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('computer')
    .setDescription('Affiche les informations système du serveur'),

  async execute(interaction) {
    const systemInfo = getSystemInfo()

    const headerMessage = ColorMessage.header(
      'INFORMATIONS SYSTÈME',
      'État actuel du serveur hébergeant le bot',
      `Demandé par ${interaction.user.username}`
    )

    const contentMessage = ColorMessage.content([
      { label: 'Système d\'exploitation', value: `${systemInfo.platform} ${systemInfo.arch}` },
      { label: 'Processeur', value: systemInfo.processor },
      { label: 'Nombre de cœurs', value: systemInfo.cores },
      { label: 'Mémoire RAM totale', value: `${systemInfo.totalMemory}GB` },
      { label: 'Mémoire RAM utilisée', value: `${systemInfo.usedMemory}GB (${systemInfo.memoryUsage}%)` },
      { label: 'Mémoire RAM libre', value: `${systemInfo.freeMemory}GB` },
      { label: 'Temps de fonctionnement', value: systemInfo.uptime },
      { label: 'Version Node.js', value: systemInfo.nodeVersion }
    ])

    await interaction.channel.send({ content: headerMessage })
    await interaction.channel.send({ content: contentMessage })
  }
}