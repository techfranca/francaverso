import { NextResponse } from 'next/server'

// Store de jobs (mesmo do download/route.js)
// Em produção, isso deveria estar num banco de dados ou Redis
const downloadJobs = global.downloadJobs || new Map()
global.downloadJobs = downloadJobs

export async function GET(request, { params }) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json({ error: 'jobId não fornecido' }, { status: 400 })
    }

    const job = downloadJobs.get(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job não encontrado' }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}