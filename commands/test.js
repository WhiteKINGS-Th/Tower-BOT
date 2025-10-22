export default {
  name: 'test',
  description: 'Vérifie si le bot fonctionne',
  execute: async (sock, chatId, msg, config) => {
    // 1️⃣ Réagir au message avec un engrenage
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "✅", key: msg.key }
      })
    } catch (err) {
      console.log("Erreur lors de la réaction :", err)
    }

    // 2️⃣ Envoyer le message de confirmation
    await sock.sendMessage(chatId, { text: "🤖 Bot fonctionnel ! ✅" })
  }
}