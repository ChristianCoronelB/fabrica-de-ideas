import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { hashPassword } from '@/lib/auth-password'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['ADMIN', 'PARTICIPANT', 'EVALUATOR']).default('PARTICIPANT'),
  phone: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = hashPassword(validated.password)

    // Create user
    const user = await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        role: validated.role,
        phone: validated.phone,
      },
    })

    // Generate token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
