/**
 * Shared Backup Module for Fábrica de Ideas
 * Uses bun:sqlite to dump the SQLite database and sync uploads.
 * This module is shared between the API endpoint and CLI scripts.
 */
import { Database } from 'bun:sqlite'
import { mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const PROJECT_ROOT = join(import.meta.dir, '..')
const DB_PATH = join(PROJECT_ROOT, 'db', 'custom.db')
const BACKUP_DIR = join(PROJECT_ROOT, 'backups')
const UPLOADS_DIR = join(PROJECT_ROOT, 'public', 'uploads')
const BACKUP_UPLOADS_DIR = join(BACKUP_DIR, 'uploads')
const DUMP_FILE = join(BACKUP_DIR, 'database_dump.sql')

interface BackupResult {
  success: boolean
  timestamp: string
  tablesDumped?: number
  uploadsSynced?: number
  error?: string
}

/**
 * Dump all tables from SQLite to SQL format
 */
function dumpDatabase(db: Database): string {
  const lines: string[] = []

  lines.push('-- Fábrica de Ideas Database Dump')
  lines.push(`-- Generated at: ${new Date().toISOString()}`)
  lines.push('-- ============================================\n')

  // Get all table creation SQL
  const tables = db.query("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string; sql: string }[]

  for (const table of tables) {
    lines.push(`-- Table: ${table.name}`)
    lines.push(`DROP TABLE IF EXISTS "${table.name}";`)
    lines.push(`${table.sql};\n`)

    // Dump all rows from the table
    try {
      const rows = db.query(`SELECT * FROM "${table.name}"`).all() as Record<string, unknown>[]
      if (rows.length > 0) {
        const columns = Object.keys(rows[0])
        for (const row of rows) {
          const values = columns.map(col => {
            const val = row[col]
            if (val === null || val === undefined) return 'NULL'
            if (typeof val === 'number') return String(val)
            // Escape single quotes and wrap in quotes
            return `'${String(val).replace(/'/g, "''")}'`
          })
          lines.push(`INSERT INTO "${table.name}" ("${columns.join('", "')}") VALUES (${values.join(', ')});`)
        }
        lines.push('')
      }
    } catch (err) {
      lines.push(`-- Error dumping data for ${table.name}: ${err}\n`)
    }
  }

  // Get indexes
  const indexes = db.query("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'").all() as { sql: string }[]
  if (indexes.length > 0) {
    lines.push('-- Indexes')
    for (const idx of indexes) {
      lines.push(`${idx.sql};`)
    }
  }

  return lines.join('\n')
}

/**
 * Sync uploads directory to backup
 */
function syncUploads(): number {
  let count = 0

  if (!existsSync(UPLOADS_DIR)) {
    return 0
  }

  mkdirSync(BACKUP_UPLOADS_DIR, { recursive: true })

  const files = readdirSync(UPLOADS_DIR)
  for (const file of files) {
    const srcPath = join(UPLOADS_DIR, file)
    const destPath = join(BACKUP_UPLOADS_DIR, file)

    try {
      const srcStat = statSync(srcPath)
      if (srcStat.isFile()) {
        let shouldCopy = true
        if (existsSync(destPath)) {
          const destStat = statSync(destPath)
          if (destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs) {
            shouldCopy = false
          }
        }
        if (shouldCopy) {
          copyFileSync(srcPath, destPath)
        }
        count++
      }
    } catch (err) {
      console.error(`Error syncing file ${file}:`, err)
    }
  }

  return count
}

/**
 * Perform a full backup: dump database + sync uploads
 */
export async function performBackup(): Promise<BackupResult> {
  const timestamp = new Date().toISOString()

  try {
    mkdirSync(BACKUP_DIR, { recursive: true })
    mkdirSync(BACKUP_UPLOADS_DIR, { recursive: true })

    let db: Database | null = null
    let tablesDumped = 0
    try {
      db = new Database(DB_PATH, { readonly: true })
      const dump = dumpDatabase(db)
      writeFileSync(DUMP_FILE, dump, 'utf-8')

      const tables = db.query("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get() as { count: number } | null
      tablesDumped = tables?.count ?? 0
    } finally {
      if (db) db.close()
    }

    const uploadsSynced = syncUploads()

    writeFileSync(
      join(BACKUP_DIR, 'backup_meta.json'),
      JSON.stringify({
        timestamp,
        tablesDumped,
        uploadsSynced,
        dbPath: DB_PATH,
      }, null, 2),
      'utf-8'
    )

    console.log(`[backup] Backup completed at ${timestamp}`)
    console.log(`[backup] Tables dumped: ${tablesDumped}`)
    console.log(`[backup] Uploads synced: ${uploadsSynced}`)

    return {
      success: true,
      timestamp,
      tablesDumped,
      uploadsSynced,
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`[backup] Backup failed: ${errMsg}`)
    return {
      success: false,
      timestamp,
      error: errMsg,
    }
  }
}

/**
 * Restore database from a SQL dump file
 */
export async function performRestore(): Promise<{ success: boolean; message: string }> {
  try {
    if (!existsSync(DUMP_FILE)) {
      return { success: true, message: 'No backup dump found, skipping restore' }
    }

    console.log('[restore] Restoring database from backup...')

    const dump = await Bun.file(DUMP_FILE).text()
    if (!dump || dump.trim().length === 0) {
      return { success: true, message: 'Backup dump is empty, skipping restore' }
    }

    let db: Database | null = null
    try {
      db = new Database(DB_PATH)
      db.exec('PRAGMA journal_mode=WAL;')
      db.exec('PRAGMA foreign_keys=OFF;')

      db.exec('BEGIN TRANSACTION;')
      try {
        db.exec(dump)
        db.exec('COMMIT;')
      } catch (execErr) {
        db.exec('ROLLBACK;')
        throw execErr
      }

      db.exec('PRAGMA foreign_keys=ON;')

      const tables = db.query("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get() as { count: number } | null
      console.log(`[restore] Database restored successfully. Tables: ${tables?.count ?? 0}`)
    } finally {
      if (db) db.close()
    }

    if (existsSync(BACKUP_UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true })
      const files = readdirSync(BACKUP_UPLOADS_DIR)
      let restoredCount = 0
      for (const file of files) {
        const srcPath = join(BACKUP_UPLOADS_DIR, file)
        const destPath = join(UPLOADS_DIR, file)
        try {
          const srcStat = statSync(srcPath)
          if (srcStat.isFile()) {
            copyFileSync(srcPath, destPath)
            restoredCount++
          }
        } catch (err) {
          console.error(`[restore] Error restoring file ${file}:`, err)
        }
      }
      console.log(`[restore] Uploads restored: ${restoredCount}`)
    }

    return { success: true, message: 'Database and uploads restored successfully' }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`[restore] Restore failed: ${errMsg}`)
    return { success: false, message: `Restore failed: ${errMsg}` }
  }
}

/**
 * Get backup status info
 */
export async function getBackupStatus(): Promise<{ lastBackup: string | null; dumpExists: boolean; uploadsCount: number }> {
  let lastBackup: string | null = null
  let dumpExists = false
  let uploadsCount = 0

  try {
    const metaPath = join(BACKUP_DIR, 'backup_meta.json')
    if (existsSync(metaPath)) {
      const meta = JSON.parse(await Bun.file(metaPath).text())
      lastBackup = meta.timestamp ?? null
    }
  } catch {
    // ignore
  }

  dumpExists = existsSync(DUMP_FILE)

  try {
    if (existsSync(BACKUP_UPLOADS_DIR)) {
      const files = readdirSync(BACKUP_UPLOADS_DIR)
      uploadsCount = files.filter(f => statSync(join(BACKUP_UPLOADS_DIR, f)).isFile()).length
    }
  } catch {
    // ignore
  }

  return { lastBackup, dumpExists, uploadsCount }
}
