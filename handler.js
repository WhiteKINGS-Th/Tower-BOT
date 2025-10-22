import fs from 'fs'
import path from 'path'

// Charge toutes les commandes dynamiquement
export const loadCommands = async () => {
  const commands = new Map()
  const commandFiles = fs.readdirSync(path.join('./commands')).filter(f => f.endsWith('.js'))

  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`)
    commands.set(command.default.name, command.default)
  }

  return commands
}

// Gestion de l’exécution d’une commande
export const handleMessage = async (commands, sock, msg, config) => {
  if (!msg.message || msg.key.fromMe) return

  const chatId = msg.key.remoteJid
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

  if (!text.startsWith(config.PREFIXE)) return

  const args = text.slice(config.PREFIXE.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  if (commands.has(commandName)) {
    try {
      await commands.get(commandName).execute(sock, chatId, msg, config)
    } catch (err) {
      console.log(`Erreur commande ${commandName} :`, err)
    }
  }
}