import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/api-auth'
import type { NextRequest } from 'next/server'

// GET /api/ref/criteria - List all evaluation criteria (ordered by order field)
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const criteria = await db.evaluationCriteria.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(criteria)
  } catch (error) {
    console.error('Error listing criteria:', error)
    return NextResponse.json({ error: 'Error al listar criterios' }, { status: 500 })
  }
}
