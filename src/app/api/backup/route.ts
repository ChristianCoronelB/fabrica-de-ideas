import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/backup - Trigger a manual backup
 * Requires authentication (handled by middleware)
 */
export async function POST() {
  try {
    // Use the standalone bun script to perform backup
    // We can't import bun:sqlite directly in Next.js nodejs runtime,
    // so we spawn the bun script as a subprocess
    const { execSync } = await import('node:child_process')

    const result = execSync('bun run /home/z/my-project/scripts/backup.ts', {
      cwd: '/home/z/my-project',
      timeout: 30000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Also commit to git
    try {
      execSync('git add backups/ db/', {
        cwd: '/home/z/my-project',
        timeout: 10000,
        encoding: 'utf-8',
      })
      execSync('git commit -m "auto-backup"', {
        cwd: '/home/z/my-project',
        timeout: 10000,
        encoding: 'utf-8',
      })
    } catch {
      // Git commit may fail if no changes - that's fine
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      output: result.trim(),
    })
  } catch (error) {
    console.error('[api/backup] Backup failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Backup failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/backup - Get backup status
 * Requires authentication (handled by middleware)
 */
export async function GET() {
  try {
    const { existsSync, readFileSync, readdirSync, statSync } = await import('node:fs')
    const { join } = await import('node:path')

    const backupDir = join(process.cwd(), 'backups')
    const dumpFile = join(backupDir, 'database_dump.sql')
    const metaFile = join(backupDir, 'backup_meta.json')
    const uploadsDir = join(backupDir, 'uploads')

    let lastBackup: string | null = null
    let tablesDumped = 0
    let uploadsCount = 0

    // Read backup metadata
    if (existsSync(metaFile)) {
      try {
        const meta = JSON.parse(readFileSync(metaFile, 'utf-8'))
        lastBackup = meta.timestamp ?? null
        tablesDumped = meta.tablesDumped ?? 0
      } catch {
        // ignore parse errors
      }
    }

    // Count backup uploads
    if (existsSync(uploadsDir)) {
      try {
        const files = readdirSync(uploadsDir)
        uploadsCount = files.filter(f => statSync(join(uploadsDir, f)).isFile()).length
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      dumpExists: existsSync(dumpFile),
      lastBackup,
      tablesDumped,
      uploadsCount,
    })
  } catch (error) {
    console.error('[api/backup] Status check failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    )
  }
}
