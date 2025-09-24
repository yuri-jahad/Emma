import { SlashCommandBuilder } from 'discord.js'
import ColorMessage from '../utils/colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('country')
    .setDescription('Trouve le pays d\'une capitale')
    .addStringOption(option =>
      option.setName('capitale')
        .setDescription('Le nom de la capitale')
        .setRequired(true)),

  async execute(interaction) {
    const capitalName = interaction.options.getString('capitale', true)

    try {
      const response = await fetch(`https://restcountries.com/v3.1/capital/${encodeURIComponent(capitalName)}`)
      
      if (!response.ok) {
        const headerMessage = ColorMessage.errorHeader(
          'CAPITALE NON TROUVÉE',
          `La capitale "${capitalName}" n'existe pas ou n'a pas été trouvée`,
          `Demandé par ${interaction.user.username}`
        )

        const contentMessage = ColorMessage.errorContent([
          { label: 'Capitale recherchée', value: capitalName },
          { label: 'Statut', value: 'Non trouvée' }
        ])

        await interaction.channel.send({ content: headerMessage })
        await interaction.channel.send({ content: contentMessage })
        return
      }

      const data = await response.json()
      const country = data[0]
      
      const languages = country.languages ? Object.values(country.languages).slice(0, 3).join(', ') : 'Non disponible'
      const currencies = country.currencies ? Object.values(country.currencies)[0].name : 'Non disponible'
      const subregion = country.subregion || country.region || 'Non disponible'
      const population = country.population ? country.population.toLocaleString() : 'Non disponible'

      const headerMessage = ColorMessage.header(
        'PAYS TROUVÉ',
        `Capitale: ${capitalName.toUpperCase()} - Pays: ${country.name.common}`,
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.content([
        { label: 'Capitale', value: capitalName },
        { label: 'Pays', value: country.name.common },
        { label: 'Sous-région', value: subregion },
        { label: 'Population', value: population },
        { label: 'Langues', value: languages },
        { label: 'Monnaie', value: currencies }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })

    } catch (error) {
      console.error('Erreur dans la commande country:', error)

      const headerMessage = ColorMessage.errorHeader(
        'ERREUR API',
        'Impossible de récupérer les informations de la capitale',
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Capitale recherchée', value: capitalName },
        { label: 'Erreur', value: 'Connexion API échouée' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}