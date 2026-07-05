const request = require('supertest')
const app     = require('../src/index')

describe('GET /api/countries/:id/pathways', () => {
  it('returns pathways for Italy', async () => {
    const res = await request(app).get('/api/countries/IT/pathways')
    expect(res.status).toBe(200)
    expect(res.body.countryId).toBe('IT')
    expect(res.body.prPathways.length).toBeGreaterThan(0)
    expect(res.body.citizenshipPathways.length).toBeGreaterThan(0)
  })

  it('includes summary object', async () => {
    const res = await request(app).get('/api/countries/IT/pathways')
    expect(res.body.summary).toBeDefined()
    expect(res.body.summary.hasInstantCitizenship).toBe(true)
    expect(Array.isArray(res.body.summary.pathwayTypes)).toBe(true)
  })

  it('filters by type=heritage', async () => {
    const res = await request(app).get('/api/countries/IT/pathways?type=heritage')
    expect(res.status).toBe(200)
    res.body.citizenshipPathways.forEach(p => expect(p.type).toBe('heritage'))
  })

  it('filters by section=pr', async () => {
    const res = await request(app).get('/api/countries/IT/pathways?section=pr')
    expect(res.status).toBe(200)
    expect(res.body.citizenshipPathways).toHaveLength(0)
    expect(res.body.prPathways.length).toBeGreaterThan(0)
  })

  it('filters by section=citizenship', async () => {
    const res = await request(app).get('/api/countries/DE/pathways?section=citizenship')
    expect(res.status).toBe(200)
    expect(res.body.prPathways).toHaveLength(0)
    expect(res.body.citizenshipPathways.length).toBeGreaterThan(0)
  })

  it('returns 404 for unknown country', async () => {
    const res = await request(app).get('/api/countries/XX/pathways')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/countries/:id/visas', () => {
  it('returns visas for Germany', async () => {
    const res = await request(app).get('/api/countries/DE/visas')
    expect(res.status).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    res.body.visas.forEach(v => {
      expect(v.name).toBeDefined()
      expect(v.description).toBeDefined()
    })
  })

  it('returns 404 for unknown country', async () => {
    const res = await request(app).get('/api/countries/XX/visas')
    expect(res.status).toBe(404)
  })
})
