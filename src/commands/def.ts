import { SlashCommandBuilder } from 'discord.js'
import { getDefinitions } from '../utils/get-definitions'
import ColorMessage from '../utils/colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('def')
    .setDescription("Affiche la définition d'un mot")
    .addStringOption(option =>
      option.setName('mot').setDescription('Le mot à définir').setRequired(true)
    ),

  async execute (interaction) {
    const word = interaction.options.getString('mot', true).toLowerCase().trim()

    try {
      const result = await getDefinitions(word)

      if (!result || !result.success) {
        const headerMessage = ColorMessage.errorHeader(
          'DÉFINITION NON TROUVÉE',
          `Le mot "${word}" n'existe pas dans le dictionnaire`,
          `Demandé par ${interaction.user.username}`
        )

        const contentMessage = ColorMessage.errorContent([
          { label: 'Mot recherché', value: word },
          { label: 'Statut', value: 'Non trouvé' }
        ])

        await interaction.channel.send({ content: headerMessage })
        await interaction.channel.send({ content: contentMessage })
        return
      }

      const { word_details, definitions } = result

      const headerMessage = ColorMessage.header(
        'DÉFINITION',
        `Mot: ${word_details.word.toUpperCase()} - Définitions totales: ${
          definitions.length
        } - Affichées: ${Math.min(definitions.length, 3)}`,
        `Demandé par ${interaction.user.username}`
      )

      const definitionsText = definitions
        .slice(0, 3)
        .map((def, index) => {
          const shortDef =
            def.definition.length > 280
              ? def.definition.substring(0, 280) + '...'
              : def.definition
          return `${index + 1}. ${shortDef} (${def.source_name})`
        })
        .join('\n\n')

      const contentMessage = ColorMessage.content([
        { label: 'Defs', value: definitionsText }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })

    } catch (error) {
      console.error('Erreur dans la commande def:', error)

      const headerMessage = ColorMessage.errorHeader(
        'ERREUR SYSTÈME',
        'Impossible de récupérer les définitions',
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Mot recherché', value: word },
        { label: 'Erreur', value: 'Connexion API échouée' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}