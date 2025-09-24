import { SlashCommandBuilder } from 'discord.js'
import ColorMessage from '../utils/colors-message'

const QUIZ_COUNTRIES = [
  'France', 'Germany', 'Italy', 'Spain', 'Japan', 'Brazil', 'Australia', 'Canada', 'Mexico', 'Argentina',
  'India', 'China', 'Russia', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Chile', 'Peru', 'Thailand',
  'Vietnam', 'Philippines', 'Indonesia', 'Turkey', 'Greece', 'Poland', 'Sweden', 'Norway', 'Portugal'
]

export default {
  data: new SlashCommandBuilder()
    .setName('quiz-capitals')
    .setDescription('Quiz aléatoire sur les capitales du monde')
    .addStringOption(option =>
      option.setName('niveau')
        .setDescription('Difficulté du quiz')
        .addChoices(
          { name: 'Facile (Europe/Amérique)', value: 'easy' },
          { name: 'Moyen (Monde)', value: 'medium' },
          { name: 'Difficile (Aléatoire)', value: 'hard' }
        )
        .setRequired(false)),

  async execute(interaction) {
    const difficulty = interaction.options.getString('niveau') || 'medium'
    
    let selectedCountries
    switch(difficulty) {
      case 'easy':
        selectedCountries = ['France', 'Germany', 'Italy', 'Spain', 'Canada', 'Brazil', 'Australia']
        break
      case 'hard':
        selectedCountries = QUIZ_COUNTRIES
        break
      default:
        selectedCountries = QUIZ_COUNTRIES.slice(0, 20)
    }

    const randomCountry = selectedCountries[Math.floor(Math.random() * selectedCountries.length)]

    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(randomCountry)}`)
      
      if (!response.ok) {
        const headerMessage = ColorMessage.errorHeader(
          'ERREUR QUIZ',
          'Impossible de charger le quiz',
          `Demandé par ${interaction.user.username}`
        )

        await interaction.channel.send({ content: headerMessage })
        return
      }

      const data = await response.json()
      const country = data[0]
      const capital = country.capital ? country.capital[0] : 'Aucune'
      
      // Générer des choix multiples pour rendre le quiz plus facile
      const allCapitals = [
        'Paris', 'Londres', 'Berlin', 'Madrid', 'Rome', 'Tokyo', 'Brasília', 'Canberra', 
        'Ottawa', 'Mexico', 'Buenos Aires', 'New Delhi', 'Beijing', 'Moscow', 'Cairo'
      ]
      
      const wrongChoices = allCapitals
        .filter(cap => cap !== capital)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
      
      const choices = [capital, ...wrongChoices].sort(() => 0.5 - Math.random())
      const choicesText = choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n')

      const headerMessage = ColorMessage.header(
        'QUIZ CAPITALES',
        `Niveau: ${difficulty.toUpperCase()} - Quelle est la capitale de ce pays ?`,
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.content([
        { label: 'Pays', value: `🏛️ ${country.name.common}` },
        { label: 'Choix possibles', value: choicesText },
        { label: '', value: `💡 Tapez le numéro de votre réponse !` }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })

      // Envoyer la réponse après 15 secondes
      setTimeout(async () => {
        const answerNumber = choices.indexOf(capital) + 1
        const answerMessage = ColorMessage.header(
          'RÉPONSE QUIZ',
          `La capitale de ${country.name.common} est ${capital}`,
          'Quiz terminé'
        )

        const detailsMessage = ColorMessage.content([
          { label: 'Bonne réponse', value: `${answerNumber}. ${capital}` },
          { label: 'Région', value: country.region || 'Non disponible' },
          { label: 'Population', value: country.population ? country.population.toLocaleString() : 'Non disponible' }
        ])

        await interaction.channel.send({ content: answerMessage })
        await interaction.channel.send({ content: detailsMessage })
      }, 15000)

    } catch (error) {
      console.error('Erreur dans la commande quiz-capitals:', error)

      const headerMessage = ColorMessage.errorHeader(
        'ERREUR QUIZ',
        'Impossible de charger le quiz',
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Erreur', value: 'Connexion API échouée' },
        { label: 'Niveau demandé', value: difficulty }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}