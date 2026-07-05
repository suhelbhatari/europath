# EuroPath Android App 🌍

A native Android app for the EuroPath Europe Immigration Explorer, built with **Kotlin + Jetpack Compose + Material 3**.

## Features
- **45 European countries** with full PR & citizenship pathway data
- **Live search** — filter by country name or capital as you type
- **Smart filters** — EU, Schengen, dual citizenship, digital nomad visa, PR timeline, citizenship timeline
- **Sort options** — A-Z, Fastest PR, Fastest Citizenship, Safety, Healthcare
- **Country Detail pages** with 6 tabs: Overview, Visa Types, PR Pathways, Citizenship, Pros & Cons, Timeline
- **Deep-linked Pathways screen** — jump directly to a route type (ancestry, investment, family, etc.)
- **Side-by-side Compare** — up to 4 countries, scrollable comparison with "best in class" highlighting
- **Bottom navigation** with compare badge counter

## Tech Stack
| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Navigation | Navigation Compose |
| State | ViewModel + mutableStateListOf |
| Architecture | Single-activity, multi-screen |
| Min SDK | API 26 (Android 8.0) |
| Target SDK | API 35 (Android 15) |

## Setup

1. **Clone / unzip** the project
2. Open in **Android Studio Ladybug (2024.2.1+)** or newer
3. Let Gradle sync complete (requires internet for first dependency download)
4. Run on an emulator (API 26+) or physical device

## Project Structure
```
app/src/main/java/com/europath/app/
├── MainActivity.kt               # Entry point
├── data/
│   ├── Country.kt                # Data models (Country, Pathway, PathwayTypeMeta)
│   ├── CountryData.kt            # 45 countries × all pathway data (auto-generated)
│   └── CompareViewModel.kt       # App-wide compare selection state
├── nav/
│   ├── Screen.kt                 # Route definitions
│   ├── NavGraph.kt               # Navigation host + composable destinations
│   └── MainScaffold.kt           # Bottom nav bar scaffold
└── ui/
    ├── theme/
    │   ├── Color.kt              # Dark navy/indigo palette matching web app
    │   ├── Theme.kt              # MaterialTheme + status bar config
    │   └── Type.kt               # Typography scale
    ├── components/
    │   └── Common.kt             # Chip, ScoreBar, StatBox, MetricRow, PillButton
    └── screens/
        ├── ExplorerScreen.kt     # Home — search, filters, country grid
        ├── CountryDetailScreen.kt # Per-country page with 6 tabs
        ├── PathwaysScreen.kt     # Deep-linkable pathways + PathwaysTab composable
        └── CompareScreen.kt      # Side-by-side country comparison
```

## Deep Linking (In-App)
Pathways can be deep-linked to a specific route type:
- `navigate(Screen.Pathways.build("IT", "heritage"))` → Italy, jump to ancestry routes
- `navigate(Screen.Pathways.build("PT", "investment"))` → Portugal, jump to investment routes

## Data Update
Country data lives in `CountryData.kt`. To regenerate from the source JSON:
```bash
python3 gen_kotlin_data.py
```

---
⚠️ **Disclaimer**: Immigration laws change frequently. Always verify with official government sources and a qualified immigration lawyer before making decisions. Data compiled June 2025.
