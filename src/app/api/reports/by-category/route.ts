import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

// GET /api/reports/by-category - Stats by category
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden ver reportes' }, { status: 403 })
    }

    const categories = await db.category.findMany({
      include: {
        projects: {
          where: { deletedAt: null },
          select: {
            status: true,
            averageScore: true,
            totalScore: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const stats = categories.map((category) => {
      const projects = category.projects
      const statusBreakdown: Record<string, number> = {}
      projects.forEach((p) => {
        statusBreakdown[p.status] = (statusBreakdown[p.status] || 0) + 1
      })

      const scoredProjects = projects.filter((p) => p.averageScore > 0)
      const avgScore =
        scoredProjects.length > 0
          ? scoredProjects.reduce((sum, p) => sum + p.averageScore, 0) / scoredProjects.length
          : 0

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalProjects: projects.length,
        statusBreakdown,
        averageScore: Math.round(avgScore * 100) / 100,
        highestScore: scoredProjects.length > 0 ? Math.max(...scoredProjects.map((p) => p.averageScore)) : 0,
        lowestScore: scoredProjects.length > 0 ? Math.min(...scoredProjects.map((p) => p.averageScore)) : 0,
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting stats by category:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas por categoría' }, { status: 500 })
  }
}
