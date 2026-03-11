# temperature-map

A single-page web application that visualizes 100+ years of NOAA nClimGrid monthly land surface temperature data (average temperature) over CONUS. Live at [temperature-map.com](https://temperature-map.com).

## Architecture

Static SPA (React + Vite + TypeScript) served via CloudFront + S3. No backend.

- **Overlay rendering**: Cloud-Optimized GeoTIFFs (COGs) fetched by the browser via geotiff.js, with a client-side colormap applied at render time using deck.gl `BitmapLayer`.
- **Time series (click-to-graph)**: A single Zarr v3 array on S3, range-requested by zarrita.js directly from the browser. One chunk per click (~120KB).
- **Base map**: MapLibre GL JS with the Carto Dark Matter basemap.

## Local Development

```sh
pnpm install
pnpm dev
```

## Deployment

The [CI/CD workflow](.github/workflows/ci-cd.yml) runs on every push and pull request. On pushes to `main`, it also deploys:

1. Builds with `pnpm run build` (output: `dist/`)
2. Syncs `dist/assets/` to S3 with `Cache-Control: max-age=31536000,immutable` (Vite content-hashes filenames)
3. Syncs the rest of `dist/` to S3, excluding `data/*` and `assets/*`
4. Invalidates `/index.html` in CloudFront so the new build is served immediately

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
