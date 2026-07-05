const request = require('supertest')
const app     = require('../src/index')

describe('GET /api/compare', () => {
  it('compares DE, PT, IT', async () => {
    const res = await request(app).get('/api/compare?ids=DE,PT,IT')
    expect(res.status).toBe(200)
    expect(res.body.countries).toHaveLength(3)
    expect(res.body.bestValues).toBeDefined()
    expect(res.body.bestValues.prYears).toBeDefined()
    expect(res.body.bestValues.healthcare).toBeDefined()
  })

  it('returns bestValues for all key metrics', async () => {
    const res = await request(app).get('/api/compare?ids=DE,FR,PT,IT')
    const bv = res.body.bestValues
    expect(bv.safety).toBeDefined()
    expect(bv.education).toBeDefined()
    expect(bv.passportRank).toBeDefined()
    expect(bv.prPathwaysCount).toBeDefined()
  })

  it('caps at 4 countries', async () => {
    const res = await request(app).get('/api/compare?ids=DE,PT,IT,IE,FR,ES')
    expect(res.status).toBe(200)
    expect(res.body.countries.length).toBeLessThanOrEqual(4)
  })

  it('returns 400 without ids', async () => {
    const res = await request(app).get('/api/compare')
    expect(res.status).toBe(400)
  })

  it('returns 400 with only 1 valid country', async () => {
    const res = await request(app).get('/api/compare?ids=DE')
    expect(res.status).toBe(400)
  })
})

describe('GET /api/search', () => {
  it('finds countries by name', async () => {
    const res = await request(app).get('/api/search?q=portugal&type=countries')
    expect(res.status).toBe(200)
    expect(res.body.results.countries.length).toBeGreaterThan(0)
    expect(res.body.results.countries[0].id).toBe('PT')
  })

  it('finds heritage pathways', async () => {
    const res = await request(app).get('/api/search?q=heritage&type=pathways')
    expect(res.status).toBe(200)
    expect(res.body.results.pathways.length).toBeGreaterThan(0)
  })

  it('searches both by default', async () => {
    const res = await request(app).get('/api/search?q=germany')
    expect(res.status).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
  })

  it('returns 400 for query under 2 chars', async () => {
    const res = await request(app).get('/api/search?q=a')
    expect(res.status).toBe(400)
  })
})

describe('GET /api/stats', () => {
  it('returns aggregate statistics', async () => {
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(200)
    expect(res.body.totalCountries).toBe(45)
    expect(res.body.euMembers).toBe(27)
    expect(res.body.totalPRPathways).toBeGreaterThan(100)
    expect(res.body.totalCitizenshipPathways).toBeGreaterThan(100)
    expect(res.body.fastestPR).toBeDefined()
    expect(res.body.pathwayTypeBreakdown).toBeDefined()
  })
})
