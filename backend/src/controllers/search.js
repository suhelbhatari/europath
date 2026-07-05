const countries = require('../models/countries')

exports.search = (req, res) => {
  const q = (req.query.q || '').trim()
  if (q.length < 2)
    return res.status(400).json({ error: 'Search query must be at least 2 characters', code: 400 })

  const type = req.query.type || 'all'
  const ql   = q.toLowerCase()

  const countryResults = (type === 'all' || type === 'countries')
    ? countries
        .filter(c =>
          c.name.toLowerCase().includes(ql) ||
          c.capital.toLowerCase().includes(ql) ||
          (c.languages || []).some(l => l.toLowerCase().includes(ql)) ||
          (c.visas || []).some(v => v.toLowerCase().includes(ql))
        )
        .map(c => ({ id: c.id, name: c.name, flag: c.flag, capital: c.capital }))
    : []

  const pathwayResults = (type === 'all' || type === 'pathways')
    ? countries.flatMap(c => [
        ...(c.prPathways || []).map(p => ({ ...p, countryId: c.id, countryName: c.name, section: 'pr' })),
        ...(c.citizenshipPathways || []).map(p => ({ ...p, countryId: c.id, countryName: c.name, section: 'citizenship' }))
      ])
        .filter(p =>
          p.name.toLowerCase().includes(ql) ||
          p.requirements.toLowerCase().includes(ql) ||
          (p.notes || '').toLowerCase().includes(ql) ||
          p.type.toLowerCase().includes(ql)
        )
        .map(p => ({
          countryId: p.countryId, countryName: p.countryName,
          pathwayName: p.name, section: p.section,
          type: p.type, years: p.years
        }))
    : []

  res.json({
    query: q,
    total: countryResults.length + pathwayResults.length,
    results: { countries: countryResults, pathways: pathwayResults }
  })
}
