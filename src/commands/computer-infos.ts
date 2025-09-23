import { SlashCommandBuilder } from 'discord.js'
import { getSystemInfo } from '../utils/get-computer-infos'

export default {
  data: new SlashCommandBuilder()
    .setName('computer')
    .setDescription('Affiche les informations système du serveur'),

  async execute(interaction) {
    const systemInfo = getSystemInfo()

    const message = `\`\`\`ansi
\u001b[36m\u001b[1m═══════════════════════════════════════
           INFORMATIONS SYSTÈME
═══════════════════════════════════════\u001b[0m

\u001b[37mÉtat actuel du serveur hébergeant le bot\u001b[0m

\u001b[36mSystème d'exploitation :\u001b[0m \u001b[34m${systemInfo.platform} ${systemInfo.arch}\u001b[0m
\u001b[36mProcesseur             :\u001b[0m \u001b[37m${systemInfo.processor}\u001b[0m
\u001b[36mNombre de cœurs        :\u001b[0m \u001b[33m${systemInfo.cores}\u001b[0m
\u001b[36mMémoire RAM totale     :\u001b[0m \u001b[37m${systemInfo.totalMemory}GB\u001b[0m
\u001b[36mMémoire RAM utilisée   :\u001b[0m \u001b[33m${systemInfo.usedMemory}GB (${systemInfo.memoryUsage}%)\u001b[0m
\u001b[36mMémoire RAM libre      :\u001b[0m \u001b[34m${systemInfo.freeMemory}GB\u001b[0m
\u001b[36mTemps de fonctionnement:\u001b[0m \u001b[35m${systemInfo.uptime}\u001b[0m
\u001b[36mVersion Node.js        :\u001b[0m \u001b[34m${systemInfo.nodeVersion}\u001b[0m

\u001b[90mDemandé par ${interaction.user.username}\u001b[0m
\`\`\``

    await interaction.reply({ content: message })
  }
}