const countries = require('../models/countries')

exports.stats = (req, res) => {
  const allPR  = countries.flatMap(c => c.prPathways  || [])
  const allCit = countries.flatMap(c => c.citizenshipPathways || [])

  const validPr  = countries.filter(c => c.prYears  < 999)
  const validCit = countries.filter(c => c.citizenshipYears < 999)
  const fastestPR  = validPr.reduce((b, c)  => c.prYears  < b.prYears  ? c : b, validPr[0])
  const fastestCit = validCit.reduce((b, c) => c.citizenshipYears < b.citizenshipYears ? c : b, validCit[0])

  const pathwayTypeBreakdown = {}
  ;[...allPR, ...allCit].forEach(p => {
    pathwayTypeBreakdown[p.type] = (pathwayTypeBreakdown[p.type] || 0) + 1
  })

  res.json({
    totalCountries:           countries.length,
    euMembers:                countries.filter(c => c.eu).length,
    schengenMembers:          countries.filter(c => c.schengen).length,
    allowDual:                countries.filter(c => c.dualCitizenship).length,
    digitalNomadVisas:        countries.filter(c => c.digitalNomad).length,
    totalPRPathways:          allPR.length,
    totalCitizenshipPathways: allCit.length,
    instantCitizenshipRoutes: allCit.filter(p => p.years === 0).length,
    ancestryRoutes:           allCit.filter(p => p.type === 'heritage').length,
    investmentRoutes:         [...allPR, ...allCit].filter(p => p.type === 'investment').length,
    fastestPR:          { countryId: fastestPR?.id, countryName: fastestPR?.name, years: fastestPR?.prYears },
    fastestCitizenship: { countryId: fastestCit?.id, countryName: fastestCit?.name, years: fastestCit?.citizenshipYears },
    averageHealthcare:  +(countries.reduce((s, c) => s + c.healthcare, 0) / countries.length).toFixed(2),
    averageSafety:      +(countries.reduce((s, c) => s + c.safety,     0) / countries.length).toFixed(2),
    pathwayTypeBreakdown,
    dataUpdated: 'June 2025'
  })
}
