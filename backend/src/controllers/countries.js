const countries = require('../models/countries')

const summarise = c => ({
  id: c.id, name: c.name, flag: c.flag, capital: c.capital,
  population: c.population, gdp: c.gdp, currency: c.currency,
  languages: c.languages, eu: c.eu, schengen: c.schengen,
  passportRank: c.passportRank, avgSalary: c.avgSalary,
  costOfLiving: c.costOfLiving, climate: c.climate,
  prYears: c.prYears, citizenshipYears: c.citizenshipYears,
  dualCitizenship: c.dualCitizenship, taxRate: c.taxRate,
  healthcare: c.healthcare, safety: c.safety, education: c.education,
  digitalNomad: c.digitalNomad, startupScore: c.startupScore,
  familyFriendly: c.familyFriendly, retirementFriendly: c.retirementFriendly,
  prPathwaysCount: (c.prPathways || []).length,
  citizenshipPathwaysCount: (c.citizenshipPathways || []).length,
  hasHeritage: (c.citizenshipPathways || []).some(p => p.type === 'heritage'),
  hasInvestment: [...(c.prPathways || []), ...(c.citizenshipPathways || [])].some(p => p.type === 'investment')
})

exports.list = (req, res) => {
  let result = [...countries]

  if (req.query.eu !== undefined)       result = result.filter(c => c.eu === (req.query.eu === 'true'))
  if (req.query.schengen !== undefined) result = result.filter(c => c.schengen === (req.query.schengen === 'true'))
  if (req.query.dual !== undefined)     result = result.filter(c => c.dualCitizenship === (req.query.dual === 'true'))
  if (req.query.nomad !== undefined)    result = result.filter(c => c.digitalNomad === (req.query.nomad === 'true'))
  if (req.query.maxPrYears)            result = result.filter(c => c.prYears <= Number(req.query.maxPrYears))
  if (req.query.maxCitYears)           result = result.filter(c => c.citizenshipYears <= Number(req.query.maxCitYears))

  if (req.query.q) {
    const q = req.query.q.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q) ||
      (c.languages || []).some(l => l.toLowerCase().includes(q))
    )
  }

  const sortField = req.query.sort || 'name'
  const order = req.query.order === 'desc' ? -1 : 1
  const sortFns = {
    name:             (a, b) => a.name.localeCompare(b.name) * order,
    prYears:          (a, b) => (a.prYears - b.prYears) * order,
    citizenshipYears: (a, b) => (a.citizenshipYears - b.citizenshipYears) * order,
    safety:           (a, b) => (a.safety - b.safety) * order,
    healthcare:       (a, b) => (a.healthcare - b.healthcare) * order,
    passportRank:     (a, b) => (a.passportRank - b.passportRank) * order
  }
  if (sortFns[sortField]) result.sort(sortFns[sortField])

  const page  = Math.max(1, parseInt(req.query.page)  || 1)
  const limit = Math.min(45, parseInt(req.query.limit) || 45)
  const total = result.length
  const paged = result.slice((page - 1) * limit, page * limit)

  res.json({
    data: paged.map(summarise),
    meta: { total, page, limit, filtered: total, pages: Math.ceil(total / limit) }
  })
}

exports.get = (req, res) => {
  const country = countries.find(c => c.id === req.params.id.toUpperCase())
  if (!country) return res.status(404).json({ error: 'Country not found', code: 404, id: req.params.id })
  res.json(country)
}
