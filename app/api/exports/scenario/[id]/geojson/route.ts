import { NextResponse } from 'next/server';
import { generateScenarioGeoJSON } from '@/server/exports';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const geojson = await generateScenarioGeoJSON(params.id);
  return NextResponse.json(geojson, {
    headers: {
      'Content-Disposition': `attachment; filename="scenario-${params.id}.geojson"`
    }
  });
}
