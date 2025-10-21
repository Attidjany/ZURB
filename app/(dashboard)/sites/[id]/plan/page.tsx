import { notFound } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import { MapView } from '@/components/MapView';
import { GeoJSONUpload } from '@/components/GeoJSONUpload';
import styles from './page.module.css';

export default async function SitePlanPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerComponentClient();
  const { data: site, error } = await supabase
    .from('sites')
    .select('id, name, area_ha, geom')
    .eq('id', params.id)
    .single();

  if (!site || error) {
    notFound();
  }

  const featureCollection = site.geom
    ? ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: site.name },
            geometry: site.geom
          }
        ]
      } as unknown as GeoJSON.FeatureCollection)
    : undefined;

  return (
    <div className={styles.stack}>
      <header>
        <h1>{site.name}</h1>
        <p>{site.area_ha ? `${site.area_ha.toFixed(2)} ha` : 'Upload a polygon to calculate key metrics.'}</p>
      </header>
      <section>
        <GeoJSONUpload siteId={site.id} />
      </section>
      <section>
        <MapView geojson={featureCollection} />
      </section>
      <section className={styles.todo}>
        <h2>Upcoming</h2>
        <p>Automated block and parcel generation will appear here soon.</p>
      </section>
    </div>
  );
}
