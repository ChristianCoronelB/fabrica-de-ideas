import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'

export async function GET() {
  const filePath = path.join(process.cwd(), 'download', 'fabrica-de-ideas-v1.0.0.tar.gz')

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Deployment package not found. Run deploy/package.sh to generate it.' },
      { status: 404 }
    )
  }

  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': 'attachment; filename="fabrica-de-ideas-v1.0.0.tar.gz"',
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
