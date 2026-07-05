#!/usr/bin/env node
/**
 * export-countries.js
 * Extracts the COUNTRIES array from frontend/src/App.jsx and writes:
 *   - excel/countries.json          (for Excel + Android generators)
 *   - backend/src/models/countries.js  (for the API)
 *
 * Run: node scripts/export-countries.js
 */
const fs   = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')

const appSrc = fs.readFileSync(path.join(root, 'frontend/src/App.jsx'), 'utf8')
const start  = appSrc.indexOf('const COUNTRIES = [')
const end    = appSrc.indexOf('\n];', start) + 3
if (start === -1 || end <= start) {
  console.error('Could not locate COUNTRIES array in App.jsx')
  process.exit(1)
}

const block   = appSrc.slice(start, end).replace('const COUNTRIES = ', '').replace(/;$/, '').trim()
const arraySrc = block.slice(0, block.lastIndexOf(']') + 1)
const tmpFile  = path.join(root, '.tmp_export.js')

fs.writeFileSync(tmpFile,
  `const COUNTRIES = ${arraySrc};\nconsole.log(JSON.stringify(COUNTRIES));`)

const { execSync } = require('child_process')
try {
  const json = execSync(`node "${tmpFile}"`, { maxBuffer: 10 * 1024 * 1024 }).toString()
  const data = JSON.parse(json)

  // Write excel/countries.json
  const excelOut = path.join(root, 'excel/countries.json')
  fs.writeFileSync(excelOut, JSON.stringify(data, null, 2))
  console.log(`✅ ${data.length} countries → ${excelOut}`)

  // Write backend model
  const backendOut = path.join(root, 'backend/src/models/countries.js')
  fs.writeFileSync(backendOut, `module.exports = ${JSON.stringify(data, null, 2)}`)
  console.log(`✅ ${data.length} countries → ${backendOut}`)

  console.log('\nNext steps:')
  console.log('  python3 scripts/gen_kotlin_data.py   # Rebuild Android CountryData.kt')
  console.log('  python3 excel/build_workbook.py      # Rebuild Excel workbook')
} catch (e) {
  console.error('❌ Export failed:', e.message)
  process.exit(1)
} finally {
  try { fs.unlinkSync(tmpFile) } catch {}
}
