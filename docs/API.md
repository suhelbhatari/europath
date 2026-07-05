# EuroPath REST API Reference

Base URL: `https://api.europath.app` (production) | `http://localhost:3001` (local)

Interactive docs: `GET /api/docs` (Swagger UI)

---

## Authentication

The public API requires no authentication. Rate limit: **100 requests/minute per IP**.

---

## Endpoints

### `GET /api/countries`

Returns all countries with optional filtering and sorting.

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `eu` | boolean | Filter EU members only |
| `schengen` | boolean | Filter Schengen area only |
| `dual` | boolean | Filter countries allowing dual citizenship |
| `nomad` | boolean | Filter countries with digital nomad visa |
| `maxPrYears` | number | Max years to PR eligibility |
| `maxCitYears` | number | Max years to citizenship |
| `sort` | string | `name`, `prYears`, `citizenshipYears`, `safety`, `healthcare` |
| `order` | string | `asc` or `desc` |
| `q` | string | Full-text search (name, capital) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 45, max: 45) |

**Response**
```json
{
  "data": [
    {
      "id": "DE", "name": "Germany", "flag": "DE-flag", "capital": "Berlin",
      "eu": true, "schengen": true, "prYears": 5, "citizenshipYears": 5,
      "dualCitizenship": true, "digitalNomad": false,
      "healthcare": 9.2, "safety": 8.8, "passportRank": 3
    }
  ],
  "meta": { "total": 45, "page": 1, "limit": 45, "filtered": 45 }
}
```

---

### `GET /api/countries/:id`

Returns full profile for a single country (2-letter ISO code, e.g. `DE`, `PT`, `IT`).

Includes all fields plus full `prPathways` and `citizenshipPathways` arrays.

---

### `GET /api/countries/:id/pathways`

Returns all PR and citizenship pathways for a country.

**Query Parameters**
- `type` — filter by route type (`residence`, `heritage`, `investment`, `family`, `eu`, `humanitarian`, `birthright`, `special`, `digital`, `skilled`, `treaty`)
- `section` — `pr` or `citizenship`

---

### `GET /api/countries/:id/visas`

Returns all visa types for a country with descriptions.

---

### `GET /api/compare`

Returns side-by-side comparison data for 2-4 countries.

**Query Parameters**
- `ids` — comma-separated country IDs, e.g. `?ids=DE,PT,IT,IE`

Returns each country's key metrics plus a `bestValues` object indicating which country wins each category.

---

### `GET /api/search`

Full-text search across countries and pathways.

**Query Parameters**
- `q` — search query (min 2 chars)
- `type` — `countries` | `pathways` | `all` (default: `all`)

---

### `GET /api/stats`

Returns aggregate statistics: total countries, EU/Schengen counts, fastest PR/citizenship, pathway type breakdown.

---

## Error Responses

```json
{ "error": "Country not found", "code": 404 }
```

| Code | Meaning |
|---|---|
| 400 | Bad request |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limiting

100 requests/minute per IP. Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
