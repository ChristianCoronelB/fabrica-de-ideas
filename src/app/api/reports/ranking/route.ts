import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

// GET /api/reports/ranking - Full ranking
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden ver reportes' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const areaId = searchParams.get('areaId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {
      deletedAt: null,
      averageScore: { gt: 0 },
    }

    if (categoryId) where.categoryId = categoryId
    if (areaId) where.areaId = areaId
    if (status) where.status = status

    const projects = await db.project.findMany({
      where,
      include: {
        area: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        institution: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, email: true } },
        evaluations: {
          where: { isDraft: false },
          include: {
            evaluator: { select: { id: true, name: true, email: true } },
            scores: {
              include: {
                criteria: true,
              },
              orderBy: {
                criteria: { order: 'asc' },
              },
            },
          },
        },
      },
      orderBy: { averageScore: 'desc' },
    })

    const ranking = projects.map((project, index) => ({
      rank: index + 1,
      project: {
        id: project.id,
        name: project.name,
        pitch: project.pitch,
        status: project.status,
        totalScore: project.totalScore,
        averageScore: project.averageScore,
        area: project.area,
        category: project.category,
        institution: project.institution,
        owner: project.owner,
      },
      evaluationCount: project.evaluations.length,
      evaluations: project.evaluations.map((ev) => ({
        id: ev.id,
        evaluator: ev.evaluator,
        totalScore: ev.totalScore,
        comments: ev.comments,
        submittedAt: ev.submittedAt,
        scores: ev.scores.map((s) => ({
          criteriaId: s.criteriaId,
          criteriaName: s.criteria.name,
          score: s.score,
          maxScore: s.maxScore,
          observation: s.observation,
        })),
      })),
    }))

    return NextResponse.json(ranking)
  } catch (error) {
    console.error('Error getting ranking:', error)
    return NextResponse.json({ error: 'Error al obtener ranking' }, { status: 500 })
  }
}
