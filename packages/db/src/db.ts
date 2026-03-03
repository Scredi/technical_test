import Database from 'better-sqlite3'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { USER_TABLE, FORMALITY_TABLE } from './schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = join(__dirname, '..', 'data')
const DB_PATH = join(DATA_DIR, 'app.sqlite')

let db: Database.Database | null = null

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

export function getDb(): Database.Database {
  if (!db) {
    ensureDataDir()
    db = new Database(DB_PATH)
  }
  return db
}

export function initDb(): void {
  const database = getDb()
  database.exec(USER_TABLE)
  database.exec(FORMALITY_TABLE)
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

export { DB_PATH }
