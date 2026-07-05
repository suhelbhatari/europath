const request = require('supertest')
const app     = require('../src/index')

describe('GET /api/countries', () => {
  it('returns all 45 countries', async () => {
    const res = await request(app).get('/api/countries')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(45)
    expect(res.body.meta.total).toBe(45)
  })

  it('filters EU members only', async () => {
    const res = await request(app).get('/api/countries?eu=true')
    expect(res.status).toBe(200)
    res.body.data.forEach(c => expect(c.eu).toBe(true))
  })

  it('filters non-EU only', async () => {
    const res = await request(app).get('/api/countries?eu=false')
    expect(res.status).toBe(200)
    res.body.data.forEach(c => expect(c.eu).toBe(false))
  })

  it('filters by maxPrYears', async () => {
    const res = await request(app).get('/api/countries?maxPrYears=3')
    expect(res.status).toBe(200)
    res.body.data.forEach(c => expect(c.prYears).toBeLessThanOrEqual(3))
  })

  it('filters dual citizenship', async () => {
    const res = await request(app).get('/api/countries?dual=true')
    expect(res.status).toBe(200)
    res.body.data.forEach(c => expect(c.dualCitizenship).toBe(true))
  })

  it('filters digital nomad visas', async () => {
    const res = await request(app).get('/api/countries?nomad=true')
    expect(res.status).toBe(200)
    res.body.data.forEach(c => expect(c.digitalNomad).toBe(true))
  })

  it('sorts by prYears ascending', async () => {
    const res = await request(app).get('/api/countries?sort=prYears&order=asc')
    expect(res.status).toBe(200)
    const years = res.body.data.map(c => c.prYears)
    for (let i = 1; i < years.length; i++) expect(years[i]).toBeGreaterThanOrEqual(years[i-1])
  })

  it('sorts by safety descending', async () => {
    const res = await request(app).get('/api/countries?sort=safety&order=desc')
    expect(res.status).toBe(200)
    const scores = res.body.data.map(c => c.safety)
    for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeLessThanOrEqual(scores[i-1])
  })

  it('searches by country name', async () => {
    const res = await request(app).get('/api/countries?q=germany')
    expect(res.status).toBe(200)
    expect(res.body.data[0].id).toBe('DE')
  })

  it('searches by capital', async () => {
    const res = await request(app).get('/api/countries?q=lisbon')
    expect(res.status).toBe(200)
    expect(res.body.data[0].id).toBe('PT')
  })
})

describe('GET /api/countries/:id', () => {
  it('returns Germany', async () => {
    const res = await request(app).get('/api/countries/DE')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('DE')
    expect(res.body.name).toBe('Germany')
    expect(Array.isArray(res.body.prPathways)).toBe(true)
    expect(res.body.prPathways.length).toBeGreaterThan(0)
    expect(Array.isArray(res.body.citizenshipPathways)).toBe(true)
  })

  it('returns Portugal', async () => {
    const res = await request(app).get('/api/countries/PT')
    expect(res.status).toBe(200)
    expect(res.body.digitalNomad).toBe(true)
  })

  it('is case-insensitive', async () => {
    const res = await request(app).get('/api/countries/pt')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('PT')
  })

  it('returns 404 for unknown country', async () => {
    const res = await request(app).get('/api/countries/XX')
    expect(res.status).toBe(404)
    expect(res.body.error).toBeDefined()
  })
})
