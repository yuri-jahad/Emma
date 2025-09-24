import { SlashCommandBuilder } from 'discord.js'
import ColorMessage from '../utils/colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('capital')
    .setDescription('Trouve la capitale d\'un pays')
    .addStringOption(option =>
      option.setName('pays')
        .setDescription('Le nom du pays')
        .setRequired(true)),

  async execute(interaction) {
    const countryName = interaction.options.getString('pays', true)

    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`)
      
      if (!response.ok) {
        const headerMessage = ColorMessage.errorHeader(
          'PAYS NON TROUVÉ',
          `Le pays "${countryName}" n'existe pas ou n'a pas été trouvé`,
          `Demandé par ${interaction.user.username}`
        )

        const contentMessage = ColorMessage.errorContent([
          { label: 'Pays recherché', value: countryName },
          { label: 'Statut', value: 'Non trouvé' }
        ])

        await interaction.channel.send({ content: headerMessage })
        await interaction.channel.send({ content: contentMessage })
        return
      }

      const data = await response.json()
      const country = data[0]
      
      const capital = country.capital ? country.capital[0] : 'Aucune capitale'
      const population = country.population ? country.population.toLocaleString() : 'Non disponible'
      const region = country.region || 'Non disponible'
      const currency = country.currencies ? Object.values(country.currencies)[0].name : 'Non disponible'

      const headerMessage = ColorMessage.header(
        'CAPITALE',
        `Pays: ${country.name.common.toUpperCase()} - Capitale: ${capital}`,
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.content([
        { label: 'Pays', value: country.name.common },
        { label: 'Capitale', value: capital },
        { label: 'Région', value: region },
        { label: 'Population', value: population },
        { label: 'Monnaie', value: currency }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })

    } catch (error) {
      console.error('Erreur dans la commande capital:', error)

      const headerMessage = ColorMessage.errorHeader(
        'ERREUR API',
        'Impossible de récupérer les informations du pays',
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Pays recherché', value: countryName },
        { label: 'Erreur', value: 'Connexion API échouée' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}