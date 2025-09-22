import { Events } from 'discord.js'
import { initBot, getCommand } from './src/core/config/emma-client'
import { deployCommands } from './src/commands/execute-commands'

const client = await initBot()

if (client) {
  console.log('🚀 Déploiement des commandes...')

  try {
    await deployCommands()
    console.log('✅ Commandes déployées!')
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error)
  }

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = getCommand(interaction.commandName)

    if (!command) {
      await interaction.reply({
        content: 'Commande non trouvée!',
        ephemeral: true
      })
      return
    }

    try {
      console.log(`🔄 Exécution de la commande: ${interaction.commandName}`)
      await command.execute(interaction) // ✅ Cette ligne doit appeler ta commande
      console.log(`✅ Commande ${interaction.commandName} exécutée`)
    } catch (error) {
      const errorReply = {
        content: "Une erreur est survenue lors de l'exécution!",
        ephemeral: true
      }

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorReply)
      } else {
        await interaction.reply(errorReply)
      }
    }
  })
}
