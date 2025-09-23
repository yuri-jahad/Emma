import { SlashCommandBuilder } from 'discord.js'
import { getSoluces } from '../utils/search-syllables'
import ColorMessage from './colors-message'

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
        const message = ColorMessage.block(
          'ERREUR DE PARAMÈTRE',
          'Le paramètre fourni n\'est pas valide',
          [
            { label: 'Paramètre fourni', value: occurrenceCount, color: 'magenta' },
            { label: 'Erreur', value: result.message, color: 'magenta' }
          ],
          `Demandé par ${interaction.user.username}`,
          'red'
        )
        await interaction.reply({ content: message })
        return
      }

      const syllableCountMatch = result.message.match(/^\((\d+)\)/)
      const syllableCount = syllableCountMatch ? syllableCountMatch[1] : '0'
      
      const syllablesText = result.message.includes('\n') 
        ? result.message.split('\n').slice(1).join(' ') 
        : 'Aucune syllabe trouvée'

      const message = ColorMessage.block(
        'RECHERCHE DE SYLLABES',
        'Syllabes trouvées par nombre d\'occurrences',
        [
          { label: 'Occurrences recherchées', value: occurrenceCount, color: 'blue' },
          { label: 'Syllabes trouvées', value: syllableCount, color: 'blue' },
          { label: 'Syllabes affichées', value: 'Maximum 200', color: 'blue' },
          { label: 'Résultats', value: syllablesText, color: 'cyan' }
        ],
        `Demandé par ${interaction.user.username}`,
        'cyan'
      )

      await interaction.reply({ content: message })

    } catch (error) {
      console.error('Erreur dans la commande syllables:', error)
      
      const message = ColorMessage.block(
        'ERREUR SYSTÈME',
        'Une erreur est survenue lors de la recherche',
        [
          { label: 'Paramètre fourni', value: occurrenceCount, color: 'magenta' },
          { label: 'Erreur', value: 'Problème lors du traitement', color: 'magenta' }
        ],
        `Demandé par ${interaction.user.username}`,
        'red'
      )
      await interaction.reply({ content: message })
    }
  }
}