const countries = require('../models/countries')

exports.compare = (req, res) => {
  if (!req.query.ids)
    return res.status(400).json({ error: 'ids query param required (e.g. ?ids=DE,PT,IT)', code: 400 })

  const ids   = req.query.ids.split(',').map(id => id.trim().toUpperCase()).slice(0, 4)
  const found = ids.map(id => countries.find(c => c.id === id)).filter(Boolean)

  if (found.length < 2)
    return res.status(400).json({ error: 'At least 2 valid country IDs required', code: 400, provided: ids })

  const validPr  = found.filter(c => c.prYears < 999)
  const validCit = found.filter(c => c.citizenshipYears < 999)

  const best = (arr, fn, lower = true) => {
    if (!arr.length) return null
    return arr.reduce((b, c) => lower ? (fn(c) < fn(b) ? c : b) : (fn(c) > fn(b) ? c : b)).id
  }

  const bestValues = {
    prYears:                  best(validPr,  c => c.prYears),
    citizenshipYears:         best(validCit, c => c.citizenshipYears),
    healthcare:               best(found,    c => c.healthcare,    false),
    safety:                   best(found,    c => c.safety,        false),
    education:                best(found,    c => c.education,     false),
    startupScore:             best(found,    c => c.startupScore,  false),
    passportRank:             best(found,    c => c.passportRank,  true),
    prPathwaysCount:          best(found,    c => (c.prPathways||[]).length, false),
    citizenshipPathwaysCount: best(found,    c => (c.citizenshipPathways||[]).length, false)
  }

  res.json({
    countries: found.map(c => ({
      id: c.id, name: c.name, flag: c.flag,
      eu: c.eu, schengen: c.schengen,
      prYears: c.prYears, citizenshipYears: c.citizenshipYears,
      dualCitizenship: c.dualCitizenship, digitalNomad: c.digitalNomad,
      avgSalary: c.avgSalary, costOfLiving: c.costOfLiving, taxRate: c.taxRate,
      healthcare: c.healthcare, safety: c.safety, education: c.education,
      startupScore: c.startupScore, passportRank: c.passportRank,
      languages: c.languages,
      prPathwaysCount:          (c.prPathways  || []).length,
      citizenshipPathwaysCount: (c.citizenshipPathways || []).length,
      hasHeritage:   (c.citizenshipPathways || []).some(p => p.type === 'heritage'),
      hasInvestment: [...(c.prPathways||[]), ...(c.citizenshipPathways||[])].some(p => p.type === 'investment')
    })),
    bestValues
  })
}
