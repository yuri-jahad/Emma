import { SlashCommandBuilder } from 'discord.js'

import { getDefinitions } from '../utils/get-definitions'
import ColorMessage from './colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('def')
    .setDescription('Affiche la définition d\'un mot')
    .addStringOption(option =>
      option.setName('mot')
        .setDescription('Le mot à définir')
        .setRequired(true)),

  async execute(interaction) {
    const word = interaction.options.getString('mot', true).toLowerCase().trim()

    try {
      const result = await getDefinitions(word)
      console.log(result)
      
      if (!result || !result.success) {
        const message = ColorMessage.block(
          'DÉFINITION NON TROUVÉE',
          'Aucune définition disponible pour ce mot',
          [
            { label: 'Mot recherché', value: word, color: 'blue' },
            { label: 'Statut', value: 'Non trouvé dans le dictionnaire', color: 'magenta' }
          ],
          `Demandé par ${interaction.user.username}`,
          'yellow'
        )
        await interaction.reply({ content: message })
        return
      }

      const { word_details, definitions } = result
      
      const definitionsText = definitions
        .slice(0, 5)
        .map((def, index) => {
          const shortDef = def.definition.length > 150 
            ? def.definition.substring(0, 150) + '...' 
            : def.definition
          return `${index + 1}. ${shortDef} (${def.source_name})`
        })
        .join('\n\n')

      const message = ColorMessage.block(
        'DÉFINITION',
        `Définitions du mot "${word_details.word}"`,
        [
          { label: 'Mot', value: word_details.word, color: 'blue' },
          { label: 'Nombre de définitions', value: `${definitions.length}`, color: 'blue' },
          { label: 'Définitions affichées', value: `${Math.min(definitions.length, 5)}`, color: 'blue' },
          { label: 'Définitions', value: definitionsText, color: 'cyan' }
        ],
        `Demandé par ${interaction.user.username}`,
        'cyan'
      )

      await interaction.reply({ content: message })

    } catch (error) {
      console.error('Erreur dans la commande def:', error)
      
      const message = ColorMessage.block(
        'ERREUR DE RECHERCHE',
        'Une erreur est survenue lors de la recherche',
        [
          { label: 'Mot recherché', value: word, color: 'magenta' },
          { label: 'Erreur', value: 'Problème de connexion à l\'API', color: 'magenta' }
        ],
        `Demandé par ${interaction.user.username}`,
        'red'
      )
      await interaction.reply({ content: message })
    }
  }
}