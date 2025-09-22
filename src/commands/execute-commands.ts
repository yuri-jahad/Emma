import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { addCommand, emma } from '../core/config/emma-client'
import { REST, Routes } from 'discord.js'
const token = process.env.DISCORD_TOKEN!
const clientId = process.env.DISCORD_CLIENT_ID!
const guildId = process.env.DISCORD_GUILD_ID

console.log(token, clientId, guildId)
const loadCommands = async () => {
  const currentFile = import.meta.file
  try {
    const commandsPathFolder = import.meta.dir
    const commandFiles = await readdir(commandsPathFolder)
    for (let commandFile of commandFiles) {
      if (commandFile === currentFile || !commandFile.endsWith('.ts')) continue
      const commandFilePath = join(commandsPathFolder, commandFile)
      const commandModule = await import(commandFilePath)
      const command = commandModule.default

      if ('data' in command && 'execute' in command) {
        addCommand(command.data.name, command)
      }
    }
  } catch (error) {

  }
}

export const deployCommands = async () => {
  try {
    await loadCommands()
    const userCommand = emma.getCommand('user')
    console.log(userCommand, "cc")
    console.log('Commande user trouvée:', !!userCommand)

    if (!userCommand) {
      console.error('❌ Aucune commande à déployer!')
      return
    }

    const commands = [userCommand.data.toJSON()]
    const rest = new REST().setToken(token)

    console.log('🚀 Déploiement en cours...')

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands
      })
      console.log('✅ Déployé sur le serveur!')
    } else {
      // Global (1 heure d'attente)
      await rest.put(Routes.applicationCommands(clientId), { body: commands })
      console.log('✅ Déployé globalement!')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}
