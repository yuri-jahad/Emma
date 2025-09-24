import { search } from '../utils/search-words'
import { SlashCommandBuilder } from 'discord.js'
import { list } from '../data/initialize-dico'
import ColorMessage from '../utils/colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('words')
    .setDescription('Recherche des mots dans le dictionnaire')
    .addStringOption(option =>
      option
        .setName('pattern')
        .setDescription('Pattern de recherche (regex supportée)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('limit')
        .setDescription('Nombre maximum de résultats affichés')
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(false)
    ),

  async execute (interaction) {
    const pattern = interaction.options.getString('pattern', true)
    const limit = interaction.options.getInteger('limit') ?? 10

    if (!list?.success) {
      const headerMessage = ColorMessage.errorHeader(
        'ERREUR DICTIONNAIRE',
        "Le dictionnaire n'est pas disponible actuellement",
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Pattern recherché', value: pattern },
        { label: 'Statut', value: 'Dictionnaire indisponible' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
      return
    }

    try {
      const { results, total } = search(pattern, list.data.words, limit)

      if (total === 0) {
        const headerMessage = ColorMessage.errorHeader(
          'AUCUN RÉSULTAT TROUVÉ',
          `Le pattern "${pattern}" ne correspond à aucun mot`,
          `Demandé par ${interaction.user.username}`
        )

        const contentMessage = ColorMessage.errorContent([
          { label: 'Pattern recherché', value: pattern },
          { label: 'Statut', value: 'Aucun résultat' }
        ])

        await interaction.channel.send({ content: headerMessage })
        await interaction.channel.send({ content: contentMessage })
        return
      }

      const headerMessage = ColorMessage.header(
        'RECHERCHE DICTIONNAIRE',
        `Pattern: ${pattern.toUpperCase()} - Résultats totaux: ${total} - Affichés: ${
          results.length
        }`,
        `Demandé par ${interaction.user.username}`
      )

      const wordsDisplay = results.join(', ')

      const contentMessage = ColorMessage.content([
        { label: 'Soluces', value: wordsDisplay }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    } catch (error) {
      console.error('Erreur dans la commande words:', error)

      const headerMessage = ColorMessage.errorHeader(
        'ERREUR DE RECHERCHE',
        'Pattern de recherche invalide',
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Pattern fourni', value: pattern },
        { label: 'Erreur', value: 'Expression régulière invalide' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}
