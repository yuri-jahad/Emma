import { SlashCommandBuilder } from 'discord.js'
import ColorMessage from '../utils/colors-message'

export default {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription("Affiche des informations sur l'utilisateur."),

  async execute (interaction) {
    const user = interaction.user
    const member = interaction.member

    const createdDate = new Date(user.createdTimestamp).toLocaleDateString(
      'fr-FR'
    )
    const joinedDate = member?.joinedAt
      ? new Date(member.joinedTimestamp).toLocaleDateString('fr-FR')
      : 'Non disponible'

    const headerMessage = ColorMessage.header(
      'PROFIL UTILISATEUR',
      `Informations sur ${user.username}`,
      `Demandé par ${interaction.user.username}`
    )

    const contentMessage = ColorMessage.content([
      { label: "Nom d'utilisateur", value: user.username },
      { label: 'ID Utilisateur', value: user.id },
      { label: 'Compte créé le', value: createdDate },
      { label: 'A rejoint le serveur', value: joinedDate }
    ])

    await interaction.channel.send({ content: headerMessage })
    await interaction.channel.send({ content: contentMessage })
  }
}
