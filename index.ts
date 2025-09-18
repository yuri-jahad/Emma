import { Client, Events, GatewayIntentBits } from 'discord.js'

const token = process.env.DISCORD_TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! logged in as ${readyClient.user.tag}`)
})

client.login(token)
