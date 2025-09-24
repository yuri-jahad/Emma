import { SlashCommandBuilder } from 'discord.js'
import { writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ColorMessage from '../utils/colors-message'
import { deployCommands } from './execute-commands'

const OWNER_ID = '172441664227508224'
const GUILD_FILE = join(process.cwd(), 'authorized-guilds.json')
console.log(GUILD_FILE)
const loadAuthorizedGuilds = () => {
  try {
    const data = readFileSync(GUILD_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { guilds: [] }
  }
}

const saveAuthorizedGuilds = guilds => {
  writeFileSync(
    GUILD_FILE,
    JSON.stringify({ guilds, updatedAt: new Date().toISOString() }, null, 2)
  )
}

export default {
  data: new SlashCommandBuilder()
    .setName('add-guild')
    .setDescription('Ajoute un serveur à la liste autorisée (Owner uniquement)')
    .addStringOption(option =>
      option
        .setName('guild-id')
        .setDescription('ID du serveur Discord à ajouter')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('redeploy')
        .setDescription('Redéployer les commandes automatiquement')
        .setRequired(false)
    ),

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

    const guildIdToAdd = interaction.options.getString('guild-id', true)
    const shouldRedeploy = interaction.options.getBoolean('redeploy') ?? true

    if (!/^\d{17,20}$/.test(guildIdToAdd)) {
      const headerMessage = ColorMessage.errorHeader(
        'ID INVALIDE',
        "L'ID du serveur Discord est invalide",
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'ID fourni', value: guildIdToAdd },
        { label: 'Format attendu', value: '17-20 chiffres' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
      return
    }

    try {
      const authorizedData = loadAuthorizedGuilds()

      if (authorizedData.guilds.includes(guildIdToAdd)) {
        const headerMessage = ColorMessage.errorHeader(
          'SERVEUR DÉJÀ AUTORISÉ',
          'Ce serveur est déjà dans la liste autorisée',
          `Demandé par ${interaction.user.username}`
        )

        const contentMessage = ColorMessage.errorContent([
          { label: 'ID du serveur', value: guildIdToAdd },
          { label: 'Statut', value: 'Déjà présent' }
        ])

        await interaction.channel.send({ content: headerMessage })
        await interaction.channel.send({ content: contentMessage })
        return
      }

      authorizedData.guilds.push(guildIdToAdd)
      saveAuthorizedGuilds(authorizedData.guilds)

      const headerMessage = ColorMessage.header(
        'SERVEUR AJOUTÉ',
        'Le serveur a été ajouté à la liste autorisée',
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.content([
        { label: 'ID du serveur', value: guildIdToAdd },
        {
          label: 'Total serveurs autorisés',
          value: authorizedData.guilds.length.toString()
        },
        {
          label: 'Redéploiement',
          value: shouldRedeploy ? 'En cours...' : 'Manuel'
        }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })

      if (shouldRedeploy) {
        process.env.DISCORD_GUILD_IDS = authorizedData.guilds.join(',')

        const deployMessage = ColorMessage.header(
          'REDÉPLOIEMENT EN COURS',
          'Déploiement des commandes sur tous les serveurs autorisés',
          'Veuillez patienter...'
        )

        await interaction.channel.send({ content: deployMessage })

        try {
          await deployCommands()

          const successMessage = ColorMessage.header(
            'DÉPLOIEMENT TERMINÉ',
            'Les commandes ont été déployées avec succès',
            'Bot opérationnel sur tous les serveurs'
          )

          await interaction.channel.send({ content: successMessage })
        } catch (deployError) {
          const deployErrorMessage = ColorMessage.errorHeader(
            'ERREUR DÉPLOIEMENT',
            'Le déploiement a échoué',
            'Vérifiez les logs'
          )

          await interaction.channel.send({ content: deployErrorMessage })
        }
      }
    } catch (error) {
      console.error('Erreur dans add-guild:', error)

      const headerMessage = ColorMessage.errorHeader(
        'ERREUR SYSTÈME',
        "Impossible d'ajouter le serveur",
        `Demandé par ${interaction.user.username}`
      )

      const contentMessage = ColorMessage.errorContent([
        { label: 'ID du serveur', value: guildIdToAdd },
        { label: 'Erreur', value: 'Erreur de fichier ou déploiement' }
      ])

      await interaction.channel.send({ content: headerMessage })
      await interaction.channel.send({ content: contentMessage })
    }
  }
}
