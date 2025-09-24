import { SlashCommandBuilder } from 'discord.js'
import ColorMessage from '../utils/colors-message'

const startTime = Date.now()

const formatUptime = (time: number): { display: string, details: any } => {
  const elapsedTime = Date.now() - time
  const seconds = Math.floor(elapsedTime / 1000) % 60
  const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60)) % 24
  const days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24))
  
  const display = `${days}j ${hours}h ${minutes}m ${seconds}s`
  
  return {
    display,
    details: { days, hours, minutes, seconds }
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Affiche depuis combien de temps le bot est en ligne'),

  async execute(interaction) {
    try {
      const uptime = formatUptime(startTime)
      
      const headerMessage = ColorMessage.header(
        'UPTIME DU BOT',
        `Temps de fonctionnement: ${uptime.display}`,
        `Demandé par ${interaction.user.username}`
      )
      
      const contentMessage = ColorMessage.content([
        { label: 'Uptime', value: uptime.display },
        { label: 'Démarré le', value: new Date(startTime).toLocaleString('fr-FR') },
        { label: 'Timestamp', value: startTime.toString() }
      ])
      
      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
      
    } catch (error) {
      console.error('Erreur dans la commande uptime:', error)
      
      const headerMessage = ColorMessage.errorHeader(
        'ERREUR UPTIME',
        'Impossible de calculer le temps de fonctionnement',
        `Demandé par ${interaction.user.username}`
      )
      
      const contentMessage = ColorMessage.errorContent([
        { label: 'Erreur', value: 'Problème de calcul du temps' }
      ])
      
      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}