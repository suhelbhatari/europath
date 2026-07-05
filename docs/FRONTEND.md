# Frontend Setup Guide

Single-file React app using hash-based routing.

## Prerequisites
- Node.js 18+, npm 9+

## Local Development
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

## Routes

| URL | Page |
|---|---|
| `#/` | Explorer |
| `#/country/DE` | Country detail |
| `#/pathways/IT` | All pathways |
| `#/pathways/IT/heritage` | Deep-link to ancestry routes |
| `#/compare` | Compare up to 4 countries |

### Deep-link Anchor Types
`heritage`, `investment`, `family`, `residence`, `eu`, `humanitarian`, `birthright`, `digital`, `skilled`, `treaty`, `special`

## Political Map
Loads boundary data at runtime from `https://unpkg.com/world-atlas@2.0.2/countries-110m.json`
(Natural Earth public domain data). Falls back to a bubble-grid map if unreachable.

## Build & Deploy
```bash
npm run build        # outputs to dist/
vercel --prod         # Vercel
netlify deploy --dir=dist --prod   # Netlify
npm run deploy         # GitHub Pages (gh-pages)
```

## Environment Variables
```env
VITE_API_BASE_URL=https://api.europath.app
VITE_APP_VERSION=1.0.0
```

## Customization
- Add a country: edit `COUNTRIES` array, add map position to `MAP_POS`, add ISO code to `ISO_NUMERIC`
- Add a pathway type: add to `PATHWAY_TYPE_META` and `ANCHOR_TYPES`
