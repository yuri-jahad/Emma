import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { addCommand, emma } from '../core/config/emma-client'
import { REST, Routes } from 'discord.js'
const token = process.env.DISCORD_TOKEN!
const clientId = process.env.DISCORD_CLIENT_ID!
const guildId = process.env.DISCORD_GUILD_ID

const loadCommands = async () => {
  const currentFile = import.meta.file
  try {
    const commandsPathFolder = import.meta.dir
    const commandFiles = await readdir(commandsPathFolder)
    for (const commandFile of commandFiles) {
      if (commandFile === currentFile || !commandFile.endsWith('.ts')) continue
      const commandFilePath = join(commandsPathFolder, commandFile)
      const commandModule = await import(commandFilePath)
      const command = commandModule.default
      if ('data' in command && 'execute' in command) {
        addCommand(command.data.name, command)
      }
    }
  } catch (error) {}
}

export const deployCommands = async () => {
  try {
    await loadCommands()

    const allCommands = emma.getCommandsForDeployment()

    if (allCommands.length === 0) {
      console.error('Aucune commande à déployer!')
      return
    }

    console.log(`Déploiement de ${allCommands.length} commande(s)`)

    const rest = new REST().setToken(token)

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: allCommands
      })
      console.log('Commandes déployées sur le serveur!')
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body: allCommands
      })
      console.log('Commandes déployées globalement!')
    }
  } catch (error) {
    console.error('Erreur lors du déploiement:', error)
  }
}
