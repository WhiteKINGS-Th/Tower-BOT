import pkg from "pg"
const { Pool } = pkg
import zlib from "zlib"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function saveSession(id, authState) {
  const compressed = zlib.gzipSync(JSON.stringify(authState)).toString("base64")
  const client = await pool.connect()
  try {
    await client.query(
      `INSERT INTO sessions (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [id, compressed]
    )
  } finally {
    client.release()
  }
  console.log(`💾 Session sauvegardée pour ID: ${id}`)
}

export async function loadSession(id) {
  const client = await pool.connect()
  try {
    const res = await client.query("SELECT data FROM sessions WHERE id=$1", [id])
    if (res.rowCount === 0) return null
    const decompressed = zlib.gunzipSync(Buffer.from(res.rows[0].data, "base64")).toString()
    return JSON.parse(decompressed)
  } finally {
    client.release()
  }
}