const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const apiRouter = require('./routes/api')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'https://europath.app'],
  methods: ['GET'],
  credentials: false
}))

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', code: 429 }
})
app.use('/api/', limiter)

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'EuroPath API',
    version: '1.0.0',
    description: 'European immigration data — 45 countries, 180+ PR pathways, 250+ citizenship routes'
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local' },
    { url: 'https://api.europath.app', description: 'Production' }
  ],
  paths: {
    '/api/countries': {
      get: {
        summary: 'List all countries',
        tags: ['Countries'],
        parameters: [
          { name: 'eu', in: 'query', schema: { type: 'boolean' } },
          { name: 'schengen', in: 'query', schema: { type: 'boolean' } },
          { name: 'dual', in: 'query', schema: { type: 'boolean' } },
          { name: 'nomad', in: 'query', schema: { type: 'boolean' } },
          { name: 'maxPrYears', in: 'query', schema: { type: 'number' } },
          { name: 'maxCitYears', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['name', 'prYears', 'citizenshipYears', 'safety', 'healthcare'] } },
          { name: 'q', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'List of countries' } }
      }
    },
    '/api/countries/{id}': {
      get: {
        summary: 'Get full country profile',
        tags: ['Countries'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'DE' } }],
        responses: { 200: { description: 'Country profile' }, 404: { description: 'Not found' } }
      }
    },
    '/api/countries/{id}/pathways': {
      get: {
        summary: 'Get PR and citizenship pathways',
        tags: ['Pathways'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'section', in: 'query', schema: { type: 'string', enum: ['pr', 'citizenship'] } }
        ],
        responses: { 200: { description: 'Pathways' } }
      }
    },
    '/api/countries/{id}/visas': {
      get: {
        summary: 'Get visa types',
        tags: ['Visas'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Visa list' } }
      }
    },
    '/api/compare': {
      get: {
        summary: 'Compare multiple countries',
        tags: ['Compare'],
        parameters: [{ name: 'ids', in: 'query', required: true, schema: { type: 'string', example: 'DE,PT,IT' } }],
        responses: { 200: { description: 'Comparison data' } }
      }
    },
    '/api/search': {
      get: {
        summary: 'Full-text search',
        tags: ['Search'],
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['countries', 'pathways', 'all'], default: 'all' } }
        ],
        responses: { 200: { description: 'Search results' } }
      }
    },
    '/api/stats': {
      get: {
        summary: 'Aggregate statistics',
        tags: ['Stats'],
        responses: { 200: { description: 'Stats' } }
      }
    }
  }
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api', apiRouter)

app.get('/', (req, res) => {
  res.json({
    name: 'EuroPath API',
    version: '1.0.0',
    docs: '/api/docs',
    endpoints: [
      'GET /api/countries', 'GET /api/countries/:id', 'GET /api/countries/:id/pathways',
      'GET /api/countries/:id/visas', 'GET /api/compare?ids=DE,PT,IT', 'GET /api/search?q=heritage', 'GET /api/stats'
    ]
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error', code: 500 })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', code: 404, path: req.path })
})

app.listen(PORT, () => {
  console.log(`EuroPath API running on http://localhost:${PORT}`)
  console.log(`Swagger docs at http://localhost:${PORT}/api/docs`)
})

module.exports = app
