import { Events } from 'discord.js'
import { initBot, getCommand } from './src/core/config/emma-client'
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
        ephemeral: true
      })
      return
    }

    try {
      const start = performance.now()
      let hasReplied = false

      const originalReply = interaction.reply.bind(interaction)

      ;(interaction as any).reply = function (options: any) {
        hasReplied = true
        const elapsed = (performance.now() - start).toFixed(2) + 'ms'

        if (typeof options === 'string') {
          options = options + `\nExécuté en ${elapsed}`
        } else if (options.content) {
          // Injecte dans le footer gris de tes messages ANSI
          options.content = options.content.replace(
            /(\u001b\[90m.*?)(\u001b\[0m\n```$)/,
            `$1 • ${elapsed}$2`
          )
        }

        return originalReply(options)
      }

      await command.execute(interaction)
    } catch (error) {
      console.error(`Erreur dans ${interaction.commandName}:`, error)

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
