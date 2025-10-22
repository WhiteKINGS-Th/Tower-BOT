export default {
  name: 'ping',
  description: 'Répond Pong avec latence',
  execute: async (sock, chatId, msg, config) => {
    const start = Date.now()
    
    // Réagir au message
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "🏓", key: msg.key }
      })
    } catch (err) {
      console.log("Erreur réaction :", err)
    }

    // Envoyer Pong et latence
    const latency = Date.now() - start
    const sentMsg = await sock.sendMessage(chatId, { text: "🏓 Pong !" })
    await sock.sendMessage(chatId, { text: `📡 Latence : ${latency}ms` }, { quoted: sentMsg })
  }
}