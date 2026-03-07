# temperature-map

A single-page web application that visualizes 100+ years of NOAA nClimGrid monthly land surface temperature data (average temperature) over CONUS. Live at [temperature-map.com](https://temperature-map.com).

## Architecture

Static SPA (React + Vite + TypeScript) served via CloudFront + S3. No backend.

- **Overlay rendering**: Cloud-Optimized GeoTIFFs (COGs) fetched by the browser via geotiff.js, with a client-side colormap applied at render time using deck.gl `BitmapLayer`.
- **Time series (click-to-graph)**: A single Zarr v3 array on S3, range-requested by zarrita.js directly from the browser. One chunk per click (~120KB).
- **Base map**: MapLibre GL JS with the Carto Dark Matter basemap.

## Local Development

```sh
cp .env.example .env   # fill in VITE_DATA_BUCKET_URL, VITE_ZARR_PATH, VITE_COG_PATH
pnpm install
pnpm dev
```

## Deployment

Pushes to `main` trigger the [CI/CD workflow](.github/workflows/ci-cd.yml), which:

1. Builds with `pnpm run build` (output: `dist/`)
2. Syncs `dist/` to S3, deleting stale app files but **excluding `data/*`**
3. Invalidates `/index.html` in CloudFront so the new build is served immediately

### Required GitHub Actions variable

Set `CLOUDFRONT_DISTRIBUTION_ID` as a repository variable (Settings → Secrets and variables → Variables) with the CloudFront distribution ID. This is used by the invalidation step.

## Cache Invalidation

CloudFront caching is split across three behaviors:

| Path | Policy | Rationale |
| --- | --- | --- |
| `assets/*` | CachingOptimized (max 1yr) | Vite content-hashes filenames — safe to cache indefinitely |
| `data/*` | CachingOptimized (max 1yr) | Long TTL is appropriate; manual invalidation is required when data is updated (see below) |
| `/*` (default) | CachingDisabled | `index.html` must be fresh on every deploy |

### App deploy

Handled automatically by the workflow — only `/index.html` is invalidated.

### Adding new COGs

No invalidation needed. COG files are named by date (e.g. `nclimgrid-tavg-192501.tif`). New files have new names and are not yet cached.

### Updating the Zarr store

When new months are added to the Zarr array, all chunk files are rewritten (chunk shape is `(T, 5, 5)` where T spans the full time extent). Invalidate the entire Zarr path after updating:

```sh
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/data/nclimgrid.zarr/*"
```

## Infrastructure (Terraform)

See [terraform/README.md](terraform/README.md) for provisioning instructions.
