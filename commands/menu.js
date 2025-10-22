export default {
  name: 'menu',
  description: 'Affiche le menu principal du bot',
  emoji: '⚙️    ',
  category: 'Interface',
  execute: async (sock, chatId, msg, config) => {
    // 1️⃣ Réagir avec un emoji
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "⚙️", key: msg.key }
      })
    } catch (err) {
      console.log("Erreur réaction :", err)
    }

    // 2️⃣ Charger dynamiquement toutes les commandes
    const fs = await import('fs')
    const path = await import('path')
    const commandFiles = fs.readdirSync(path.join('./commands')).filter(f => f.endsWith('.js'))

    const commands = []
    for (const file of commandFiles) {
      const cmd = await import(`./${file}`)
      commands.push(cmd.default)
    }

    // 3️⃣ Générer la liste stylée des commandes
    const commandList = commands
      .map(cmd => `*│⟢${cmd.name}*`)
      .join('\n')

    // 4️⃣ Construire le menu final avec ton format
    const menuText = `
*╔═════════════════╗*
*║🤖Bot:*  ${config.BOT_NAME || "TowerBOT"}                  
*║👨🏾‍💻Dev:* ${config.NOM_OWNER || "TowerLow"}                   
*║⚙️Version:* ${config.VERSION || "v1.5"}                        
*║ℹ️Préfixe:* \`${config.PREFIXE || "."}\`                      
*║ℹ️Status:* Online*
*╚═════════════════╝*

*╔═◤COMMAND - INTERFACE◢═╗*
*╭─────────────────╮*
${commandList}
*╰─────────────────╯*

💡Pour exécuter une commande, tape simplement le préfixe suivi du nom.
Exemple : ${config.PREFIXE || "."}ping
`

    // 5️⃣ Envoi du menu avec image (optionnel)
    const imageUrl = 'https://files.catbox.moe/pl8vz7.jpg' // 👉 remplace par ton image
    await sock.sendMessage(chatId, {
      image: { url: imageUrl },
      caption: menuText.trim()
    })
  }
}