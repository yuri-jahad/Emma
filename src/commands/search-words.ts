import { search } from '../utils/search-words'
import { SlashCommandBuilder } from 'discord.js'
import { list } from '../data/initialize-dico'
import ColorMessage from './colors-message'


export default {
  data: new SlashCommandBuilder()
    .setName('words')
    .setDescription('Recherche des mots dans le dictionnaire')
    .addStringOption(option =>
      option.setName('pattern')
        .setDescription('Pattern de recherche (regex supportée)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Nombre maximum de résultats affichés')
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(false)),

  async execute(interaction) {
    const pattern = interaction.options.getString('pattern', true)
    const limit = interaction.options.getInteger('limit') ?? 10

    if (!list?.success) {
      const message = ColorMessage.block(
        'ERREUR DICTIONNAIRE',
        'Le dictionnaire n\'est pas disponible actuellement',
        [],
        `Demandé par ${interaction.user.username}`,
        'red'
      )
      await interaction.reply({ content: message })
      return
    }

    try {
      const { results, total } = search(pattern, list.data.words, limit)
      
      if (total === 0) {
        const message = ColorMessage.block(
          'RECHERCHE DICTIONNAIRE',
          'Aucun résultat trouvé pour le pattern',
          [
            { label: 'Pattern recherché', value: pattern, color: 'blue' },
            { label: 'Nombre total de mots', value: list.data.words.length.toLocaleString(), color: 'blue' }
          ],
          `Demandé par ${interaction.user.username}`,
          'cyan'
        )
        await interaction.reply({ content: message })
        return
      }

      const wordsDisplay = results.join(', ')
      
      const message = ColorMessage.block(
        'RECHERCHE DICTIONNAIRE',
        'Résultats de la recherche',
        [
          { label: 'Pattern recherché', value: pattern, color: 'blue' },
          { label: 'Résultats trouvés', value: `${total} mot(s)`, color: 'blue' },
          { label: 'Résultats affichés', value: `${results.length}/${limit}`, color: 'blue' },
          { label: 'Mots trouvés', value: wordsDisplay, color: 'cyan' }
        ],
        `Demandé par ${interaction.user.username}`,
        'cyan'
      )

      await interaction.reply({ content: message })

    } catch (error) {
      const message = ColorMessage.block(
        'ERREUR DE RECHERCHE',
        'Pattern de recherche invalide',
        [
          { label: 'Pattern fourni', value: pattern, color: 'magenta' },
          { label: 'Erreur', value: 'Expression régulière invalide', color: 'magenta' }
        ],
        `Demandé par ${interaction.user.username}`,
        'red'
      )
      await interaction.reply({ content: message })
    }
  }
}