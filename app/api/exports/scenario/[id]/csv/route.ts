import { NextResponse } from 'next/server';
import { generateScenarioCsv } from '@/server/exports';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const csv = await generateScenarioCsv(params.id);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="scenario-${params.id}.csv"`
    }
  });
}
