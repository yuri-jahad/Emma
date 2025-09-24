import { SlashCommandBuilder } from 'discord.js'
import { refreshDico } from '../utils/refresh-dico'
import ColorMessage from '../utils/colors-message'
import { refreshList } from '../data/initialize-dico'

const OWNER_ID = '172441664227508224'

export default {
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Actualise le dictionnaire (opération longue ~6s)'),

  async execute (interaction) {
    if (interaction.user.id !== OWNER_ID) {
      const headerMessage = ColorMessage.errorHeader(
        'ACCÈS REFUSÉ',
        'Cette commande est réservée au propriétaire du bot',
        `Tentative par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'Votre ID', value: interaction.user.id },
        { label: 'Statut', value: 'Non autorisé' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
      return
    }

    try {
      const startTime = Date.now()

      const loadingHeader = ColorMessage.header(
        'ACTUALISATION EN COURS',
        'Mise à jour du dictionnaire en cours...',
        `Demandé par ${interaction.user.username}`
      )

      const loadingContent = ColorMessage.content([
        { label: 'Statut', value: 'En cours de traitement' },
        { label: 'Temps estimé', value: '~6 secondes' }
      ])

      await interaction.channel.send({ content: loadingHeader })
      const loadingMsg = await interaction.channel.send({ content: loadingContent })

      const result = await refreshDico()
      const duration = Date.now() - startTime

      if (result.success) {
        const successHeader = ColorMessage.header(
          'DICTIONNAIRE ACTUALISÉ',
          'Le dictionnaire a été mis à jour avec succès',
          `Demandé par ${interaction.user.username}`
        )

        const successContent = ColorMessage.content([
          { label: 'Statut', value: 'Succès' },
          { label: 'Durée côté API', value: result.duration },
          { label: 'Durée totale', value: `${duration}ms` },
          {
            label: 'Timestamp',
            value: new Date(result.timestamp).toLocaleString('fr-FR')
          }
        ])

        await refreshList()

        await interaction.channel.send({ content: successHeader })
        await interaction.channel.send({ content: successContent })
        
        await loadingMsg.delete().catch(() => {})

      } else {
        const errorHeader = ColorMessage.errorHeader(
          "ERREUR D'ACTUALISATION",
          'La mise à jour du dictionnaire a échoué',
          `Demandé par ${interaction.user.username}`
        )

        const errorContent = ColorMessage.errorContent([
          {
            label: 'Erreur',
            value: result.error || 'Erreur inconnue'
          },
          {
            label: 'Détails',
            value: result.details || 'Aucun détail disponible'
          },
          { label: 'Durée', value: `${duration}ms` }
        ])

        await interaction.channel.send({ content: errorHeader })
        await interaction.channel.send({ content: errorContent })
        
        await loadingMsg.delete().catch(() => {})
      }
    } catch (error) {
      console.error('Erreur dans la commande refresh:', error)

      const errorHeader = ColorMessage.errorHeader(
        'ERREUR CRITIQUE',
        "Impossible d'actualiser le dictionnaire",
        `Demandé par ${interaction.user.username}`
      )

      const errorContent = ColorMessage.errorContent([
        {
          label: 'Erreur',
          value: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        {
          label: 'Type',
          value: 'Erreur de connexion ou de traitement'
        }
      ])

      await interaction.channel.send({ content: errorHeader })
      await interaction.channel.send({ content: errorContent })
    }
  }
}