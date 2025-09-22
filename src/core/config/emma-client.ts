import { Client, Events, GatewayIntentBits, Collection } from 'discord.js'

const token = process.env.DISCORD_TOKEN

class Emma {
  private static instance: Emma | null = null
  private client: Client | null = null
  private isStarted: boolean = false
  private commands = new Collection<string, any>()

  private constructor () {}

  static getInstance (): Emma {
    if (!Emma.instance) {
      Emma.instance = new Emma()
    }
    return Emma.instance
  }

  async start (): Promise<Client | null> {
    if (this.isStarted && this.client?.isReady()) {
      return this.client
    }

    try {
      if (!token) {
        throw new Error(
          "DISCORD_TOKEN manquant dans les variables d'environnement"
        )
      }

      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ]
      })

      await new Promise<void>((resolve, reject) => {
        this.client!.once(Events.ClientReady, readyClient => {
          console.log(`Ready! Logged in as ${readyClient.user.tag}`)
          this.isStarted = true
          resolve()
        })

        this.client!.once(Events.Error, error => {
          console.error('Client error:', error)
          reject(error)
        })

        // Connexion
        this.client!.login(token).catch(reject)
      })

      return this.client
    } catch (error) {
      console.error('Connection failed:', error)
      this.client = null
      this.isStarted = false
      return null
    }
  }

  addCommand (name: string, command: any): void {
    this.commands.set(name, command)
  }

  getCommand (name: string): any | null {
    return this.commands.get(name) ?? null
  }

  hasCommand (name: string): boolean {
    return this.commands.has(name)
  }

  getClient (): Client | null {
    return this.client
  }

  isReady (): boolean {
    return this.client?.isReady() ?? false
  }

  async stop (): Promise<void> {
    if (this.client) {
      await this.client.destroy()
      this.client = null
      this.isStarted = false
    }
  }
}

export const emma = Emma.getInstance()
export const initBot = () => emma.start()
export const getClient = () => emma.getClient()
export const isBotReady = () => emma.isReady()
export const stopBot = () => emma.stop()
export const addCommand = (name: string, command: any) => emma.addCommand(name, command)
export const getCommand = (name: string) => emma.getCommand(name)