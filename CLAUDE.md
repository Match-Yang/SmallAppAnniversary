# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **dual-platform anniversary management application** with two implementations:

1. **Uni-app (root directory)**: Cross-platform app using Vue.js, supporting WeChat Mini Program, Alipay, Baidu, Toutiao, and 5+ App platforms
2. **Android Native (android-native/)**: Full-featured Kotlin Android app with Jetpack Compose, supporting both solar (Gregorian) and lunar (Chinese) calendars

The Android native app is the primary, feature-rich implementation.

---

## Android Native App (android-native/)

### Build System

Gradle 8.13 with version catalogs (`gradle/libs.versions.toml`).

**Key versions:**
- AGP 8.13.2, Kotlin 2.0.21
- Compile SDK 36, Min SDK 24, Target SDK 36
- Java 11 target with core library desugaring

**Build (run after code modifications):**
```bash
cd android-native
# Windows
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat assembleDebug

# Git Bash
cd /c/Users/26966/AndroidStudioProjects/Anniversary
JAVA_HOME="C:/Program Files/Android/Android Studio/jbr" ./gradlew assembleDebug
```

**Run tests:**
```bash
# All tests
./gradlew testDebugUnitTest

# Specific test classes
./gradlew testDebugUnitTest --tests "*LunarCalendarTest"
./gradlew testDebugUnitTest --tests "*LunarAnniversaryTest"
```

### Architecture

MVVM + Repository pattern:

```
app/src/main/java/fun/fastcar/anniversary/
├── data/
│   ├── model/          # Data models (Anniversary, Category, CalendarType)
│   └── repository/     # AnniversaryRepository (SharedPreferences + Gson)
├── viewmodel/          # AnniversaryViewModel (StateFlow-based, Screen navigation)
├── ui/
│   ├── screens/        # Screen composables (List, Add/Edit)
│   └── components/     # Reusable UI components (CalendarPicker, etc.)
└── utils/              # DateUtils, LunarCalendarHelper
```

**Key components:**

- **AnniversaryViewModel**: Manages screen navigation via `Screen` sealed class (List/Add). Exposes `StateFlow` for anniversaries, categories, and UI state
- **AnniversaryRepository**: Uses SharedPreferences with Gson serialization. Custom TypeAdapters for `LocalDate`, `LocalDateTime`, and `Category`. Migration support for deprecated categories
- **Anniversary data class**: `@Parcelize` with `@RawValue` for Category/LocalDateTime. `isRecurring` flag controls yearly repeat vs one-time

### Calendar Support

**Solar dates:** Standard `java.time.LocalDate`

**Lunar dates:** `LunarCalendarHelper` wraps `com.xhinliang:LunarCalendar:4.0.7` (supports 1900-2100, synced with Microsoft ChineseLunisolarCalendar)

**Key utilities in `DateUtils.kt`:**
- `calculateAnniversaryStatus()` - Returns `AnniversaryStatus` with days remaining
- `getNextRecurringDate()` - Handles edge cases (Feb 29, missing days)
- `getValidDate()` - Fallback for invalid dates (Feb 29 → Feb 28)

**Lunar edge cases handled:**
- Leap months: Auto-adjust when leap month doesn't exist in current year
- Big/small months: 30th day adjusts to 29th for small months (29 days)

See `android-native/LUNAR_CALENDAR_GUIDE.md` for detailed lunar calendar implementation.

### Category System

Built-in categories: `All`, `Birthday`
Custom categories: `Category.Custom(id, customName, customIcon)`

When modifying categories, update:
1. `Category` sealed class in `data/model/`
2. `CategoryAdapter` in Repository (migration support)
3. `getBuiltInCategories()` companion function

### Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Jetpack Compose BOM | 2024.09.00 | UI framework |
| Material 3 | - | Design system |
| Material Icons Extended | 1.7.5 | Extended icon set |
| Gson | 2.10.1 | JSON serialization |
| XhinLiang/LunarCalendar | 4.0.7 | Lunar calendar support |
| WheelPickerCompose | 1.1.11 | Date/time wheel picker |
| Desugaring | 2.0.4 | API < 26 support |

### Permissions

- `POST_NOTIFICATIONS` - For reminders
- `SCHEDULE_EXACT_ALARM` - Precise alarm scheduling
- `USE_EXACT_ALARM` - Exact alarm permission

### Parcelize Notes

Use `@RawValue` annotation for types not directly supported by Parcelize:
- Sealed classes (`Category`)
- Java time types (`LocalDateTime`)

For transparency in Compose, use `.copy(alpha = 0.4f)` not `.withAlpha()`.

---

## Uni-app (Root Directory)

Vue 3 based cross-platform framework. Configured for multiple platforms via `manifest.json` and `pages.json`.

**Build:** Use HBuilderX IDE or CLI tools for platform-specific builds.

**Key files:**
- `App.vue` - Main app component
- `main.js` - Entry point
- `manifest.json` - Platform configurations (WeChat, Alipay, Baidu, Toutiao, 5+ App)
- `pages.json` - Page routing and configuration
- `uni.scss` - Global styles

**Icon Usage:**
本项目使用 **lime-icon** 插件加载图标。
- 图标来源：https://icones.js.org/collection/material-symbols
- 使用示例：
  ```vue
  <l-icon name="icon-park-outline:acoustic" />
  ```
