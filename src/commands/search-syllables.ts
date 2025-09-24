import { SlashCommandBuilder } from 'discord.js'
import { getSoluces } from '../utils/search-syllables'
import ColorMessage from '../utils/colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('syllables')
    .setDescription('Trouve les syllabes avec un nombre d\'occurrences spécifique')
    .addStringOption(option =>
      option.setName('occurrences')
        .setDescription('Nombre d\'occurrences des syllabes à rechercher')
        .setRequired(true)),

  async execute(interaction) {
    const occurrenceCount = interaction.options.getString('occurrences', true)

    try {
      const result = await getSoluces(occurrenceCount)

      if (result.status === 'failed') {
        const headerMessage = ColorMessage.errorHeader(
          'ERREUR DE PARAMÈTRE',
          'Le paramètre fourni n\'est pas valide',
          `Demandé par ${interaction.user.username}`
        )

        const contentMessage = ColorMessage.errorContent([
          { label: 'Paramètre fourni', value: occurrenceCount },
          { label: 'Erreur', value: result.message }
        ])

        await interaction.channel.send({ content: headerMessage })
        await interaction.channel.send({ content: contentMessage })
        return
      }

      const syllableCountMatch = result.message.match(/^\((\d+)\)/)
      const syllableCount = syllableCountMatch ? syllableCountMatch[1] : '0'
      
      const syllablesText = result.message.includes('\n') 
        ? result.message.split('\n').slice(1).join(' ') 
        : 'Aucune syllabe trouvée'

      const headerMessage = ColorMessage.header(
        'RECHERCHE DE SYLLABES',
        `Occurrences: ${occurrenceCount} - Syllabes trouvées: ${syllableCount} - Affichées: Maximum 200`,
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.content([
        { label: 'Syllables', value: syllablesText }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })

    } catch (error) {
      console.error('Erreur dans la commande syllables:', error)
      
      const headerMessage = ColorMessage.errorHeader(
        'ERREUR SYSTÈME',
        'Une erreur est survenue lors de la recherche',
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Paramètre fourni', value: occurrenceCount },
        { label: 'Erreur', value: 'Problème lors du traitement' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}