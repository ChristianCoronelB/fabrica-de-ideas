import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/api-auth'
import type { NextRequest } from 'next/server'

// GET /api/ref/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { projects: true } },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error listing categories:', error)
    return NextResponse.json({ error: 'Error al listar categorías' }, { status: 500 })
  }
}
