#!/usr/bin/env bun
/**
 * Script para crear un usuario administrador
 * 
 * Uso:
 *   bun run scripts/create-admin.ts
 *   bun run scripts/create-admin.ts --email mi@email.com --password miPassword123 --name "Mi Nombre"
 * 
 * Si no se proporcionan argumentos, se usan los valores por defecto:
 *   email:    admin@fabrica.com
 *   password: admin123
 *   name:     Administrador General
 *   phone:    (vacío)
 */

import crypto from 'crypto'
import { PrismaClient, RoleType } from '@prisma/client'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'fabrica-de-ideas-salt-2024'
  return crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex')
}

function parseArgs(): { email: string; password: string; name: string; phone: string } {
  const args = process.argv.slice(2)
  const result = {
    email: 'admin@fabrica.com',
    password: 'admin123',
    name: 'Administrador General',
    phone: '',
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) result.email = args[++i]
    else if (args[i] === '--password' && args[i + 1]) result.password = args[++i]
    else if (args[i] === '--name' && args[i + 1]) result.name = args[++i]
    else if (args[i] === '--phone' && args[i + 1]) result.phone = args[++i]
  }

  return result
}

async function main() {
  const { email, password, name, phone } = parseArgs()

  console.log('🔑 Creando usuario administrador...\n')
  console.log(`   Email:    ${email}`)
  console.log(`   Nombre:   ${name}`)
  console.log(`   Password: ${'*'.repeat(password.length)}`)
  if (phone) console.log(`   Teléfono: ${phone}`)
  console.log('')

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log('⚠️  Ya existe un administrador con ese email.')
      console.log(`   ID:     ${existing.id}`)
      console.log(`   Nombre: ${existing.name}`)
      console.log(`   Email:  ${existing.email}`)
      console.log(`   Rol:    ${existing.role}`)
    } else {
      // Upgrade existing user to ADMIN
      const updated = await prisma.user.update({
        where: { email },
        data: { role: RoleType.ADMIN },
      })
      console.log('✅ Usuario existente actualizado a ADMIN:')
      console.log(`   ID:     ${updated.id}`)
      console.log(`   Nombre: ${updated.name}`)
      console.log(`   Email:  ${updated.email}`)
      console.log(`   Rol:    ${updated.role}`)
    }
  } else {
    // Create new admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name,
        role: RoleType.ADMIN,
        phone: phone || null,
        active: true,
      },
    })
    console.log('✅ Administrador creado exitosamente:')
    console.log(`   ID:     ${user.id}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Email:  ${user.email}`)
    console.log(`   Rol:    ${user.role}`)
  }

  console.log('\n🎉 ¡Listo! Puedes iniciar sesión con estas credenciales.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ Error:', e)
  process.exit(1)
})
