#!/usr/bin/env bun
/**
 * Standalone restore script for Fábrica de Ideas
 * Run with: bun run scripts/restore.ts
 * Idempotent - safe to run multiple times
 */
import { performRestore } from './backup-module'

const result = await performRestore()

if (result.success) {
  console.log(`✅ ${result.message}`)
} else {
  console.error(`❌ ${result.message}`)
  process.exit(1)
}
