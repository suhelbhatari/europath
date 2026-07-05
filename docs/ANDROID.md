# Android App Setup Guide

Native Android app — Kotlin + Jetpack Compose + Material 3.

## Prerequisites
- Android Studio (Ladybug 2024.2.1+ or any newer stable release)
- JDK 17 (bundled)
- Android SDK API 35

## Quick Start
1. File -> Open -> select the `android/` folder
2. Wait for Gradle sync
3. Device Manager -> + -> Pixel 8 -> API 35 -> Finish
4. Click Run (Shift+F10)

## Build Release APK
```bash
cd android
./gradlew assembleRelease
# app/build/outputs/apk/release/app-release.apk
```

## Deep Linking
```kotlin
navController.navigate(Screen.Pathways.build("IT", "heritage"))
navController.navigate(Screen.Pathways.build("PT", "investment"))
```

## Project Structure
```
android/app/src/main/java/com/europath/app/
├── MainActivity.kt
├── data/            Country.kt, CountryData.kt, CompareViewModel.kt
├── nav/             Screen.kt, NavGraph.kt, MainScaffold.kt
└── ui/
    ├── theme/       Color.kt, Theme.kt, Type.kt
    ├── components/  Common.kt
    └── screens/     ExplorerScreen.kt, CountryDetailScreen.kt, PathwaysScreen.kt, CompareScreen.kt
```

## Common Errors

| Error | Fix |
|---|---|
| No target device found | Device Manager -> Create Virtual Device -> Pixel 8 -> API 35 |
| SDK location not found | File -> Project Structure -> SDK Location |
| Gradle sync failed | File -> Project Structure -> Gradle JDK -> Embedded JDK |
