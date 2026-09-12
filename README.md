# ServeUp — Mobile

React Native app (bare CLI, no Expo) for the ServeUp marketplace: companies publish
shifts, waiters nearby apply, both sides rate each other afterwards.

## Requirements

- Node 20+
- JDK 17
- Android SDK (`ANDROID_HOME` set)
- Xcode + CocoaPods, for iOS

## Running

```bash
npm start           # Metro
npm run android
npm run ios         # run `cd ios && pod install` first
npm run lint
npx tsc --noEmit    # type-check
```

The app starts with `apiConfig.useMocks` on in development, so every screen renders
from fixtures without a backend. Point it at the real API by flipping that flag in
`src/shared/api/config.ts`.

## Structure

```
src/
├── app/            App root: providers and session bootstrap
├── navigation/     Stack and tab navigators, route types
├── screens/        Screens grouped by audience: company, waiter, shared
├── entities/       One folder per domain entity
│   └── <entity>/
│       ├── types.ts          Wire types, mirroring the API contract
│       ├── <entity>Service   HTTP calls — the only place a route string appears
│       ├── use<Entity>.ts    React Query hooks
│       └── components/       UI that only makes sense for this entity
├── shared/
│   ├── api/        Axios client, token storage, error normalisation, query client
│   ├── components/ Design-system pieces used across entities
│   ├── hooks/      Cross-cutting hooks (location)
│   ├── types/      Shared wire types (paging, address, coordinates)
│   └── utils/      Formatting, dates, geo maths
├── i18n/           i18next setup and locale files
├── theme/          Colours, spacing, typography, shadows
└── mocks/          Fixtures and the in-memory API used in development
```

### Why this shape

- **Entities own their data layer.** A screen never builds a URL; it calls a hook,
  the hook calls a service, the service owns the route. Changing an endpoint touches
  one file.
- **Services never touch React.** They are plain async functions, so they can be
  reused from anywhere and tested without rendering.
- **Screens are grouped by audience, not by entity**, because navigation is what
  actually varies between the company side and the waiter side. Entity-specific UI
  (a job post card, an assignment row) lives with its entity.

## i18n

`pt-BR` is the reference locale. `en.ts` is typed as `TranslationSchema`, so a
missing or renamed key fails the type-check instead of showing a raw key at runtime.
`src/i18n/i18n.d.ts` feeds the same schema to i18next, which makes `t()` keys
autocomplete and typo-proof.

Adding a key: add it to `locales/pt-BR.ts` first, then to `locales/en.ts` — the
compiler will point at the gap.

## Theme

Everything visual comes from `src/theme`. No screen hardcodes a colour, a font size
or a spacing value.

| Token | Value | Use |
| --- | --- | --- |
| `colors.primary` | `#B08D57` | brand gold: primary buttons, prices, active states |
| `colors.background` | `#F7F4EF` | cream page ground |
| `colors.heroBackground` | `#14110F` | dark cover blocks |
| `colors.surface` | `#FFFFFF` | cards |

## Known gaps

- **Maps are drawn, not real.** `MapPreview` paints a stylised map. Wiring
  `react-native-maps` needs a Google Maps API key and native configuration on both
  platforms; that component is the only file that changes.
- **Authentication is a role picker.** `WelcomeScreen` chooses which side of the app
  to open. The real sign-in form replaces it once `/auth/sign-in` exists.
- **Chat is a placeholder.** Out of scope for the first release: the phone number is
  shared once an application is accepted.
- **Push notifications are not wired.** `authService.registerDeviceToken` exists; the
  native setup does not.
- **Location permission strings** are not yet declared in `Info.plist` /
  `AndroidManifest.xml`; add them before the first device build.
