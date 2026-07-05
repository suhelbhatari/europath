# Data Sources & Update Process

## Sources Used

| Category | Source |
|---|---|
| PR / Citizenship requirements | Official government immigration websites |
| EU / Schengen membership | European Commission official lists |
| Passport rankings | Henley Passport Index 2025 |
| Healthcare / Safety / Education | EIU, WHO, OECD, Numbeo aggregate |
| Salaries | Eurostat, national statistics offices |
| Cost of living | Numbeo 2025 |
| Map boundaries | Natural Earth (public domain, CC0) |

## Update Schedule
- Monthly: visa fees, processing times
- Quarterly: salary, cost-of-living figures
- Annually: citizenship/PR year requirements, passport rankings
- On-demand: major law changes

## How to Update Data

All data lives in `frontend/src/App.jsx` (`COUNTRIES` array) — the single source of truth.

```bash
# 1. Edit COUNTRIES array in frontend/src/App.jsx

# 2. Export to JSON + backend model
node scripts/export-countries.js

# 3. Regenerate Android data
python3 scripts/gen_kotlin_data.py

# 4. Regenerate Excel workbook
cd excel && python3 build_workbook.py

# 5. Commit
git add -A && git commit -m "data: update [COUNTRY] requirements - [DATE]"
```

## Disclaimer
Data researched from official sources but immigration laws change frequently.
Always verify before making decisions.
