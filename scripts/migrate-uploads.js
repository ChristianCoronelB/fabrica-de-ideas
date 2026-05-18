/**
 * Migration script: Move uploaded files from public/uploads/ to data/uploads/
 * and update database records from /uploads/ to /api/files/
 * 
 * Usage: node scripts/migrate-uploads.js
 */
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs')
const path = require('path')

// Simple SQLite access
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

const PROJECT_ROOT = path.resolve(__dirname, '..')
const OLD_DIR = path.join(PROJECT_ROOT, 'public', 'uploads')
const NEW_DIR = path.join(PROJECT_ROOT, 'data', 'uploads')

async function main() {
  console.log('🔄 Migration: Moving files from public/uploads/ to data/uploads/')
  console.log(`   Old dir: ${OLD_DIR}`)
  console.log(`   New dir: ${NEW_DIR}`)

  // Step 1: Create data/uploads if it doesn't exist
  if (!fs.existsSync(NEW_DIR)) {
    fs.mkdirSync(NEW_DIR, { recursive: true })
    console.log('   ✅ Created data/uploads/ directory')
  }

  // Step 2: Move files from public/uploads to data/uploads
  let movedCount = 0
  if (fs.existsSync(OLD_DIR)) {
    const files = fs.readdirSync(OLD_DIR)
    for (const file of files) {
      const oldPath = path.join(OLD_DIR, file)
      const newPath = path.join(NEW_DIR, file)
      
      // Skip if file already exists in new location
      if (fs.existsSync(newPath)) {
        console.log(`   ⏩ Skipping ${file} (already exists in data/uploads/)`)
        continue
      }
      
      try {
        // Copy file to new location
        fs.copyFileSync(oldPath, newPath)
        
        // Verify the copy was successful before deleting
        const oldStat = fs.statSync(oldPath)
        const newStat = fs.statSync(newPath)
        if (oldStat.size === newStat.size) {
          fs.unlinkSync(oldPath)
          movedCount++
          console.log(`   📦 Moved: ${file}`)
        } else {
          console.warn(`   ⚠️ Size mismatch for ${file}, keeping both`)
        }
      } catch (err) {
        console.error(`   ❌ Error moving ${file}:`, err.message)
      }
    }
  } else {
    console.log('   ℹ️  No public/uploads/ directory found, skipping file migration')
  }
  console.log(`   ✅ Moved ${movedCount} file(s)`)

  // Step 3: Update database records
  try {
    // Update Attachment records
    const attachments = await db.attachment.findMany({
      where: {
        filePath: { startsWith: '/uploads/' }
      }
    })
    
    for (const att of attachments) {
      const filename = att.filePath.replace('/uploads/', '')
      const newPath = `/api/files/${filename}`
      await db.attachment.update({
        where: { id: att.id },
        data: { filePath: newPath }
      })
      console.log(`   📝 Updated attachment ${att.id}: ${att.filePath} → ${newPath}`)
    }
    console.log(`   ✅ Updated ${attachments.length} attachment record(s)`)

    // Update Project imageUrl records
    const projects = await db.project.findMany({
      where: {
        imageUrl: { startsWith: '/uploads/' }
      }
    })
    
    for (const proj of projects) {
      const filename = proj.imageUrl.replace('/uploads/', '')
      const newPath = `/api/files/${filename}`
      await db.project.update({
        where: { id: proj.id },
        data: { imageUrl: newPath }
      })
      console.log(`   📝 Updated project ${proj.id} imageUrl: ${proj.imageUrl} → ${newPath}`)
    }
    console.log(`   ✅ Updated ${projects.length} project imageUrl record(s)`)
  } catch (err) {
    console.error('   ❌ Error updating database:', err.message)
  }

  await db.$disconnect()
  console.log('\n🎉 Migration complete!')
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
