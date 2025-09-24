import { Events } from 'discord.js'
import { initBot, getCommand, addCommand } from './src/core/config/emma-client'
import { deployCommands } from './src/commands/execute-commands'

const client = await initBot()

if (client) {
  await deployCommands()

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = getCommand(interaction.commandName)

    if (!command) {
      await interaction.reply({
        content: 'Commande non trouvée!',
        flags: 64
      })
      return
    }

    try {
        const addGuildCommand = await import('./src/commands/add-guild')
        addCommand('add-guild', addGuildCommand.default)
      
      await interaction.reply({
        content: '⏳ Traitement en cours...',
        flags: 64
      })

      await command.execute(interaction)

    } catch (error) {
      console.error(`Erreur dans ${interaction.commandName}:`, error)

      const errorReply = {
        content: "Une erreur est survenue lors de l'exécution!",
        flags: 64
      }

      await interaction.followUp(errorReply)
    }
  })
}