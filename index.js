import makeWASocket, { DisconnectReason } from "@whiskeysockets/baileys"
import pino from "pino"
import qrcode from "qrcode-terminal"
import fs from "fs"
import crypto from "crypto"

import { CONFIG, SESSION_PATH } from "./config.js"
import { loadCommands, handleMessage } from "./handler.js"
import { saveSession, loadSession } from "./database.js"

// Reset de la session si flag
if (process.argv.includes("--reset")) {
  if (fs.existsSync(SESSION_PATH)) {
    fs.rmSync(SESSION_PATH, { recursive: true, force: true })
    console.log("🗑️ Session existante supprimée.")
  }
}

const startBot = async () => {
  let authState = null
  let saveCreds = null

  // Si SESSION_ID défini, essayer de charger depuis Supabase
  if (CONFIG.SESSION_ID) {
    console.log("🔍 Récupération de la session depuis la base PostgreSQL...")
    const dbSession = await loadSession(CONFIG.SESSION_ID)
    if (dbSession) {
      authState = dbSession
      saveCreds = async () => {
        await saveSession(CONFIG.SESSION_ID, authState)
      }
    } else {
      console.log("⚠️ SESSION_ID introuvable en base ou invalide")
    }
  }

  // Si pas de session, fallback sur fichier local
  if (!authState) {
    console.log("🆕 Aucune session trouvée, scanne le QR pour te connecter.")
    const { state, saveCreds: saveCredsLocal } = await import("@whiskeysockets/baileys").then(m => m.useMultiFileAuthState(SESSION_PATH))
    authState = state
    saveCreds = saveCredsLocal
  }

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: authState,
  })

  const commands = await loadCommands()

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true })

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log("⚠️ Session expirée, supprime l’entrée DB si besoin.")
      } else {
        console.log("🔁 Reconnexion...")
        startBot()
      }
    } else if (connection === "open") {
      console.log("✅ Connecté à WhatsApp !")

      // Générer un SESSION_ID court si pas défini
      if (!CONFIG.SESSION_ID) {
        const newID = "whats_" + crypto.randomBytes(4).toString("hex")
        await saveSession(newID, authState)
        console.log(`🔑 Nouvelle session enregistrée avec ID: ${newID}`)
        console.log(`👉 Mets SESSION_ID=${newID} dans ton .env ou Render`)
      }
    }
  })

  sock.ev.on("creds.update", async () => {
    if (CONFIG.SESSION_ID) await saveSession(CONFIG.SESSION_ID, authState)
    else await saveCreds()
  })

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    await handleMessage(commands, sock, msg, CONFIG)
  })
}

startBot()