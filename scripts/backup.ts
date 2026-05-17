#!/usr/bin/env bun
/**
 * Standalone backup script for Fábrica de Ideas
 * Run with: bun run scripts/backup.ts
 */
import { performBackup } from './backup-module'

const result = await performBackup()

if (result.success) {
  console.log(`✅ Backup successful at ${result.timestamp}`)
  console.log(`   Tables dumped: ${result.tablesDumped}`)
  console.log(`   Uploads synced: ${result.uploadsSynced}`)
} else {
  console.error(`❌ Backup failed: ${result.error}`)
  process.exit(1)
}
