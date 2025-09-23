import { SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription("Affiche des informations sur l'utilisateur."),

  async execute(interaction) {
    const user = interaction.user
    const member = interaction.member

    const createdDate = new Date(user.createdTimestamp).toLocaleDateString('fr-FR')
    const joinedDate = member?.joinedAt ? new Date(member.joinedTimestamp).toLocaleDateString('fr-FR') : 'Non disponible'

    const message = `\`\`\`ansi
\u001b[36m\u001b[1m═══════════════════════════════════════
           PROFIL UTILISATEUR
═══════════════════════════════════════\u001b[0m

\u001b[37mInformations sur ${user.username}\u001b[0m

\u001b[36mNom d'utilisateur      :\u001b[0m \u001b[34m${user.username}\u001b[0m
\u001b[36mID Utilisateur         :\u001b[0m \u001b[37m${user.id}\u001b[0m
\u001b[36mCompte créé le         :\u001b[0m \u001b[33m${createdDate}\u001b[0m
\u001b[36mA rejoint le serveur   :\u001b[0m \u001b[34m${joinedDate}\u001b[0m

\u001b[90mDemandé par ${interaction.user.username}\u001b[0m
\`\`\``

    await interaction.reply({ content: message })
  }
}