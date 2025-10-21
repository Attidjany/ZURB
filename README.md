# Zenoàh Urban Design Studio (ZUDS)

An MVP for managing urban development projects, capturing site geometry, and testing financial scenarios with gold-indexed construction costs.

## Stack
- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres + PostGIS + Auth)
- MapLibre GL JS
- TipTap editor for scenario notes

## Key features
- Supabase-authenticated workspace with project and site hierarchy
- Upload or draw GeoJSON polygons (EPSG:4326) to compute area, centroid, and bounding boxes stored in PostGIS
- Scenario planning with live KPIs for cost/m², CAPEX, and margin
- Stubbed parcel/block generation and CSV/GeoJSON exports for future expansion

## Getting started
See [`scripts/dev-setup.md`](scripts/dev-setup.md) for the full setup flow including database migrations and environment configuration.

## Testing
```bash
pnpm test
```

## Linting
```bash
pnpm lint
```
