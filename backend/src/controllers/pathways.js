const countries = require('../models/countries')

exports.get = (req, res) => {
  const country = countries.find(c => c.id === req.params.id.toUpperCase())
  if (!country) return res.status(404).json({ error: 'Country not found', code: 404 })

  let prPathways  = [...(country.prPathways  || [])]
  let citPathways = [...(country.citizenshipPathways || [])]

  if (req.query.type) {
    const types = req.query.type.split(',').map(t => t.trim())
    prPathways  = prPathways.filter(p => types.includes(p.type))
    citPathways = citPathways.filter(p => types.includes(p.type))
  }

  if (req.query.section === 'pr')          citPathways = []
  if (req.query.section === 'citizenship') prPathways  = []

  const allYearsPr  = (country.prPathways  || []).map(p => p.years).filter(y => y < 999)
  const allYearsCit = (country.citizenshipPathways || []).map(p => p.years).filter(y => y < 999)

  res.json({
    countryId:   country.id,
    countryName: country.name,
    countryFlag: country.flag,
    dualCitizenship: country.dualCitizenship,
    prPathways,
    citizenshipPathways: citPathways,
    summary: {
      prCount:              (country.prPathways || []).length,
      citizenshipCount:     (country.citizenshipPathways || []).length,
      fastestPR:            allYearsPr.length  ? Math.min(...allYearsPr)  : null,
      fastestCitizenship:   allYearsCit.length ? Math.min(...allYearsCit) : null,
      hasInstantCitizenship: (country.citizenshipPathways || []).some(p => p.years === 0),
      pathwayTypes: [...new Set([...(country.prPathways||[]), ...(country.citizenshipPathways||[])].map(p => p.type))]
    }
  })
}

exports.visas = (req, res) => {
  const country = countries.find(c => c.id === req.params.id.toUpperCase())
  if (!country) return res.status(404).json({ error: 'Country not found', code: 404 })

  const VISA_DESC = {
    'Skilled Worker':       'For professionals with job offers. Employer sponsorship and salary threshold required.',
    'EU Blue Card':         'EU-wide permit for highly qualified non-EU nationals. Minimum salary thresholds apply.',
    'Digital Nomad':        'Work remotely for non-domestic employers while residing in-country.',
    'Student':              'For enrolled students at recognised institutions. Limited work rights.',
    'Family Reunification': 'For family members of legal residents.',
    'Golden Visa':          'Investment-based residency. Low physical presence required.',
    'Investor':             'Business or capital investment residency pathway.',
    'Entrepreneur':         'For those establishing or running a business.',
    'Startup':              'For founders of innovative startups.',
    'Research':             'For academic researchers at recognised institutions.',
    'Seasonal':             'Temporary permits for agricultural and tourism workers.',
    'Job Seeker':           'Short-term permit to search for employment without a prior job offer.'
  }

  res.json({
    countryId:   country.id,
    countryName: country.name,
    total:       (country.visas || []).length,
    visas: (country.visas || []).map(name => ({
      name,
      description: VISA_DESC[name] || `Legal pathway for ${name.toLowerCase()} activities in ${country.name}.`,
      leadsTopr: true
    }))
  })
}
