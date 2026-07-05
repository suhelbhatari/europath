# 🌍 EuroPath — Europe Immigration Explorer

> **The most comprehensive open-source European immigration information platform.**
> PR pathways, citizenship routes, visa types, and quality-of-life data for all 45 European countries — available as a web app, Android app, REST API, and Excel workbook.

[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)
[![Data Updated](https://img.shields.io/badge/Data-June%202025-ef4444?style=for-the-badge)](docs/DATA_SOURCES.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-22c55e?style=for-the-badge)](docs/CONTRIBUTING.md)

---

## 🗂 Repository Structure

```
europath/
├── 📱 android/          Kotlin + Jetpack Compose Android app
├── 🌐 frontend/         React web application (multi-page, hash routing)
├── ⚙️  backend/          Node.js REST API
├── 📊 excel/            Excel workbook generator (Python + openpyxl)
├── 📚 docs/             Full documentation
├── 🔧 scripts/          Utility scripts (data gen, deployment)
└── 🤖 .github/          CI/CD workflows, issue templates, PR templates
```

---

## ✨ Features

### 🗺 Web App
- Real political SVG map of Europe (D3-geo + Natural Earth)
- Live search + 6 smart filters
- Individual deep-linked country pages (`#/country/DE`)
- Deep-linked pathway anchors (`#/pathways/IT/heritage`)
- Side-by-side comparison of up to 4 countries

### 📱 Android App
- Native Kotlin/Compose, Material 3
- Full offline support — all 45 countries embedded
- Search, filter, sort, compare
- Expandable pathway cards with deep-link anchors

### ⚙️ REST API
- `GET /api/countries` — all countries with filters
- `GET /api/countries/:id` — full country profile
- `GET /api/countries/:id/pathways` — PR + citizenship routes
- `GET /api/compare?ids=DE,PT,IT` — comparison data
- Swagger docs at `/api/docs`

### 📊 Excel Workbook
- 12 sheets with live Country Search box
- Color-coded conditional formatting
- Auto-generated from JSON via Python

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/europath.git
cd europath

# Web app
cd frontend && npm install && npm run dev
# → http://localhost:5173

# API
cd ../backend && npm install && cp .env.example .env && npm run dev
# → http://localhost:3001/api/docs

# Excel workbook
cd ../excel && pip install -r requirements.txt && python build_workbook.py

# Android — open android/ folder in Android Studio
```

---

## 📊 Data Coverage

| Metric | Count |
|---|---|
| Countries | 45 |
| PR pathways documented | 180+ |
| Citizenship pathways documented | 250+ |
| Data points per country | 30+ |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | React 18, D3-geo, Natural Earth TopoJSON |
| Android | Kotlin, Jetpack Compose, Material 3 |
| Backend | Node.js, Express, OpenAPI/Swagger |
| Excel | Python, openpyxl |
| CI/CD | GitHub Actions |

---

## 📚 Documentation

| Doc | Description |
|---|---|
| [API Reference](docs/API.md) | Full REST API endpoint documentation |
| [Frontend Guide](docs/FRONTEND.md) | Setup, build, deployment |
| [Android Guide](docs/ANDROID.md) | Setup, build, release, deep linking |
| [Backend Guide](docs/BACKEND.md) | Setup, env vars, deployment |
| [Data Sources](docs/DATA_SOURCES.md) | Data sources and update process |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute |
| [Changelog](docs/CHANGELOG.md) | Version history |

---

## ⚠️ Disclaimer

Immigration laws change frequently. All information is for **informational purposes only**.
Always verify with official government sources and consult a qualified immigration lawyer.
Data compiled June 2025.

---

## 📄 License

MIT — see [LICENSE](LICENSE)
