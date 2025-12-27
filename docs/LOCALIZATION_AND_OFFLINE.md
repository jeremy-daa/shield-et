1. Multilingual Routing (i18n)
The app must support Amharic (am), Oromo (om), and English (en).

Library: Use next-intl or next-i18next for the App Router.

Strategy: Use Locale-based routing (e.g., /am/portal or /om/portal).

Language Switcher: Place a discreet language toggle in the "Settings" or "About" section of the Portal. Ensure it doesn't appear on the Camouflage screen to keep it looking like a standard local news app.

Font Support: Use next/font/google to load Noto Sans Ethiopic specifically for Amharic/Oromo segments to prevent "broken" characters.

2. Offline-First Architecture (PWA)
Given the connectivity challenges in Ethiopia, the "Support Directory" and "Emergency Tips" must be available 100% offline.

Library: Use @ducanh2912/next-pwa (the most updated PWA plugin for Next.js 14+).

Caching Strategy:

Stale-While-Revalidate: For the Influencer's educational thumbnails and text.

Cache-First: For the "Support Directory" data and the "Camouflage" assets (news icons, weather icons).

Network-Only: For the "Evidence Vault" uploads (to prevent local caching of sensitive media).

Fallbacks: Create a /offline route that displays the essential emergency phone numbers (7711, 991, AWSAD) if the app is launched without any signal and no cache.

3. Implementation Pattern: Multilingual Config
TypeScript

// AI Agent: Configure next.config.js for PWA and i18n
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
});

module.exports = withPWA({
  i18n: {
    locales: ['en', 'am', 'om'],
    defaultLocale: 'am', // Prioritize local language
  },
});
4. The "Support Directory" Sync
The directory should be stored in an Appwrite Database but synced to a local IndexedDB or LocalStorage cache once the user enters the Portal.

Requirement: When the user is online, the app fetches the latest NGO list from Appwrite and saves it locally.

Offline UI: If navigator.onLine is false, the app pulls from the local cache so the user can still find a safe house.