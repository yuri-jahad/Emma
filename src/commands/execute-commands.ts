import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { addCommand, emma } from '../core/config/emma-client'
import { REST, Routes } from 'discord.js'

const token = process.env.DISCORD_TOKEN!
const clientId = process.env.DISCORD_CLIENT_ID!
const guildId = process.env.DISCORD_GUILD_ID
const GUILD_FILE = join(process.cwd(), 'authorized-guilds.json')

const loadAuthorizedGuilds = () => {
  try {
    const data = readFileSync(GUILD_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.guilds || []
  } catch {
    return []
  }
}

const loadCommands = async () => {
  const currentFile = import.meta.file
  try {
    const commandsPathFolder = import.meta.dir
    const commandFiles = await readdir(commandsPathFolder)
    for (const commandFile of commandFiles) {
      if (
        commandFile === currentFile ||
        // commandFile === 'add-guild.ts' ||
        !commandFile.endsWith('.ts')
      )
        continue
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
    const authorizedGuilds = loadAuthorizedGuilds()

    if (authorizedGuilds.length > 0) {
      console.log(
        `Déploiement sur ${authorizedGuilds.length} serveur(s) autorisé(s)`
      )

      for (const guildIdDynamic of authorizedGuilds) {
        try {
          await rest.put(
            Routes.applicationGuildCommands(clientId, guildIdDynamic),
            {
              body: allCommands
            }
          )
          console.log(`✅ Commandes déployées sur le serveur ${guildIdDynamic}`)
        } catch (error) {
          console.error(
            `❌ Erreur déploiement serveur ${guildIdDynamic}:`,
            error.message
          )
        }
      }
    } else if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: allCommands
      })
      console.log('Commandes déployées sur le serveur de développement!')
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
