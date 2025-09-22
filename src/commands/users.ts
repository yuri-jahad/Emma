import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription("Affiche des informations sur l'utilisateur."),

  async execute (interaction) {
    const user = interaction.user
    const member = interaction.member

    const embed = new EmbedBuilder()
      .setColor('#5865F2') 
      .setTitle(`👤 Profil de ${user.username}`)
      .setDescription(`Informations sur <@${user.id}>`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: "Nom d'utilisateur",
          value: `\`${user.username}\``,
          inline: true
        },
        { name: 'ID Utilisateur', value: `\`${user.id}\``, inline: true },
        {
          name: 'Compte créé',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
          inline: true
        }
      )
      .setFooter({
        text: `Demandé par ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp()

    if (member?.joinedAt) {
      embed.addFields({
        name: 'A rejoint le serveur',
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
        inline: true
      })
    }

    await interaction.reply({ embeds: [embed] })
  }
}
