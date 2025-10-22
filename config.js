import 'dotenv/config'

export const CONFIG = {
  PREFIXE: process.env.PREFIXE || '.',
  NOM_OWNER: process.env.NOM_OWNER || 'Owner',
  NUMERO_OWNER: process.env.NUMERO_OWNER || '0000',
  MODE: process.env.MODE || 'public',
  SESSION_ID: process.env.SESSION_ID || '',
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || 'MyPack',
  STICKER_AUTHOR_NAME: process.env.STICKER_AUTHOR_NAME || 'Author',
  BOT_NAME: process.env.BOT_NAME || 'TowerBOT',
  VERSION: process.env.VERSION || 'v1.4'
}

// SESSION_PATH configurable pour Render
export const SESSION_PATH = process.env.SESSION_PATH || './session'