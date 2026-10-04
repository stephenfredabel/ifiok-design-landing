# Ifiok Designs dashboards: translations

Every user-facing string in the design dashboards (`/design`, `/student`, `/creators/dashboard`: Home, My files,
Templates, Fonts, Orders, Account, Student perks, Creator studio, My templates, My fonts, Earnings, Guidelines,
Profile, the apps launcher, dialogs, panels, wizards, validation messages, toasts, empty states, sample data
such as template names and dates) translated into the five languages Ifiok ships today.

| Code | Language |
| --- | --- |
| `fr` | Français |
| `pcm` | Naijá Pidgin |
| `yo` | Yorùbá |
| `ha` | Hausa |
| `ig` | Igbo |

## Files

| File | What it is |
| --- | --- |
| `en.json` | The source list. `[{ "key": "<English source>", "where": ["file:line", …] }]`. This is the complete set of strings. |
| `fr.json`, `pcm.json`, `yo.json`, `ha.json`, `ig.json` | `{ "<English source>": "<translation>" }` per language. Every key of `en.json` is present in every file. |
| `design.csv` | One row per string, one column per language, plus where it is used. For spreadsheets and review. |
| `engine-import.json` | Rows already shaped for the main translation engine (see below). |

## Wiring into the main translation engine

The dashboards use the same call shape as the main Ifiok app: `tr("English source")` with the English text as the
key, and `{name}` placeholders filled from a second argument, for example
`tr("{shownCount} of {designsCount} designs", { shownCount, designsCount })`.

So the strings drop straight into the engine as `legacy-inline` strings:

- **namespace:** `legacy-inline`
- **source key:** the English text (`source` in `engine-import.json`)
- **languages:** `fr`, `pcm`, `yo`, `ha`, `ig` (`language`)
- **suggested status:** `ai_translated` (`status`). These were translated by AI and have **not** been reviewed by native speakers.
- `context` is the first file and line the string is used at.

Placeholders (`{name}`, `{count}` …) are validated: every translation contains exactly the placeholders of its source.
Plural pairs are separate keys (`{n} payout` / `{n} payouts`) because the app picks one with a normal conditional.

To use the engine's own runtime in the dashboards, replace the import in the components
(`import { tr } from '@/i18n/tr'`) with the engine's `tr`. Nothing else in the components changes.

## How the prototype uses them

- `src/i18n/tr.ts` is a tiny `tr()` that looks the English string up in `src/i18n/design-dict.ts` for the language chosen in
  the language menu, and falls back to English.
- `src/i18n/design-dict.ts` is **generated**. Do not edit it by hand.
- Language switching is live: the dashboards re-render when the language changes.

## Regenerating

```bash
node scripts/i18n-extract.cjs   # re-scan the source: rewrites translations/design/en.json
# add the new keys to fr.json, pcm.json, yo.json, ha.json, ig.json
node scripts/i18n-build.cjs     # validates, writes src/i18n/design-dict.ts, design.csv and engine-import.json
```

`i18n-build` prints any string that is missing in a language or whose placeholders do not match.

## QA hook

Setting `window.__IFIOK_TR_MARK__ = true` before the page loads wraps everything that passes through `tr()` in « ».
Crawling the dashboards in that mode lists any visible text that was never routed through the translation engine.
Only user-entered values (names, school names, file names) and font glyph specimens are expected to remain unmarked.

## Not translated on purpose

- Brand and product names (Ifiok, CorelDRAW …), acronyms (PDF, QR, CMYK, DPI), the ₦ sign.
- People, businesses, universities, banks, cities and font family names used as sample data.
- Text the user types, file names, and the specimen lines that show a font's letters.
- Browser-tab titles and the marketing pages (`/`, `/get-app`, `/creators`), which use the site's own dictionary in `src/i18n/strings.ts`.

## Review needed

All five languages were produced by AI. Please have a native speaker review them before launch, especially:
Yorùbá tone marks, Hausa hooked letters and glottal stops, Igbo dot-below vowels, and the Pidgin register on
payment and verification messages.
