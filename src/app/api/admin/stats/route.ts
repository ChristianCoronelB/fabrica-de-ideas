import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'
import type { NextRequest } from 'next/server'

// GET /api/admin/stats - Dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
    }

    // Total projects
    const totalProjects = await db.project.count({
      where: { deletedAt: null },
    })

    // Projects by status
    const projectsByStatus = await db.project.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true },
    })

    const statusCounts: Record<string, number> = {}
    projectsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status
    })

    // Projects by category
    const projectsByCategory = await db.project.groupBy({
      by: ['categoryId'],
      where: { deletedAt: null },
      _count: { categoryId: true },
    })

    const categories = await db.category.findMany()
    const categoryStats = projectsByCategory.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId)
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Desconocido',
        count: item._count.categoryId,
      }
    })

    // Projects by area
    const projectsByArea = await db.project.groupBy({
      by: ['areaId'],
      where: { deletedAt: null },
      _count: { areaId: true },
    })

    const areas = await db.area.findMany()
    const areaStats = projectsByArea.map((item) => {
      const area = areas.find((a) => a.id === item.areaId)
      return {
        areaId: item.areaId,
        areaName: area?.name || 'Desconocido',
        count: item._count.areaId,
      }
    })

    // Active evaluators count
    const activeEvaluators = await db.user.count({
      where: {
        role: 'EVALUATOR',
        active: true,
        deletedAt: null,
      },
    })

    // Average scores
    const evaluations = await db.evaluation.findMany({
      where: { isDraft: false },
      select: { totalScore: true },
    })

    const avgScore =
      evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length
        : 0

    // Top 10 projects by score
    const topProjects = await db.project.findMany({
      where: {
        deletedAt: null,
        averageScore: { gt: 0 },
      },
      include: {
        area: { select: { name: true } },
        category: { select: { name: true } },
        institution: { select: { name: true } },
        owner: { select: { name: true, email: true } },
      },
      orderBy: { averageScore: 'desc' },
      take: 10,
    })

    // Recent projects
    const recentProjects = await db.project.findMany({
      where: { deletedAt: null },
      include: {
        area: { select: { name: true } },
        category: { select: { name: true } },
        owner: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Additional counts
    const totalUsers = await db.user.count({ where: { deletedAt: null } })
    const totalEvaluations = await db.evaluation.count()
    const pendingEvaluations = await db.evaluation.count({ where: { isDraft: true } })

    return NextResponse.json({
      totalProjects,
      projectsByStatus: statusCounts,
      projectsByCategory: categoryStats,
      projectsByArea: areaStats,
      activeEvaluators,
      totalUsers,
      totalEvaluations,
      pendingEvaluations,
      averageScore: Math.round(avgScore * 100) / 100,
      topProjects,
      recentProjects,
    })
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
