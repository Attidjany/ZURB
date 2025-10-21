'use client';

import { FormEvent, useState } from 'react';
import { updateSiteGeometryAction } from '@/server/sites';

interface Props {
  siteId: string;
}

export function GeoJSONUpload({ siteId }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('geojson') as File | null;
    if (!file) {
      setStatus('Please choose a GeoJSON file.');
      return;
    }

    const text = await file.text();
    setStatus('Uploading…');
    try {
      await updateSiteGeometryAction(siteId, text);
      setStatus('Uploaded successfully.');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="upload-form" aria-label="Upload site geometry">
      <label htmlFor="geojson">GeoJSON file</label>
      <input id="geojson" name="geojson" type="file" accept="application/geo+json,.geojson" />
      <button type="submit">Upload GeoJSON</button>
      {status && <p role="status">{status}</p>}
      <style jsx>{`
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: #fff;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        button {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: none;
          background-color: #111827;
          color: #fff;
          cursor: pointer;
        }
        button:hover,
        button:focus-visible {
          background-color: #1f2937;
        }
      `}</style>
    </form>
  );
}
