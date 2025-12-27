1. The Design Language (Single Source of Truth)
To ensure the app looks consistent across the Survivor Portal, Influencer Dashboard, and SuperAdmin Panel, we will use a centralized theme configuration.

Theme Variables (HeroUI / Tailwind)
Primary Color: #006FEE (Trust & Security Blue)

Success Color: #17C964 (Safety & Growth Green)

Danger Color: #F31260 (Emergency/Quick Exit Red)

Warning Color: #F5A524 (Alerts/Red Flags Orange)

Typography: Inter for UI elements; Noto Sans Ethiopic for Amharic/Oromo body text.

Implementation Pattern: tailwind.config.ts
TypeScript

// AI Agent: Configure HeroUI with a custom theme
import { heroui } from "@heroui/react";

module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ethiopia: ['var(--font-noto-ethiopia)'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: { DEFAULT: "#006FEE", foreground: "#FFFFFF" },
            danger: { DEFAULT: "#F31260", foreground: "#FFFFFF" },
          },
        },
        dark: {
          colors: {
            primary: { DEFAULT: "#006FEE", foreground: "#FFFFFF" },
            background: "#000000", // High contrast for night-time discretion
          },
        },
      },
    }),
  ],
};
2. Universal Layout & Routing Structure
The application is split into four distinct "Zones" using Next.js Route Groups.

Route Groups Architecture
(camouflage): The public-facing decoy app.

(portal): The safe space for women/children (Protected by PIN).

(influencer): Dashboard for the content creator to upload videos/quizzes.

(admin): SuperAdmin panel for managing users and verifying NGOs.

Detailed Directory Structure
Plaintext

/src/app
  ├── layout.tsx                # Root layout (HeroUI Provider + NextThemes)
  │
  ├── (camouflage)
  │   ├── layout.tsx            # No navigation bars, looks like a news app
  │   └── page.tsx              # The Fake News Feed
  │
  ├── (portal)
  │   ├── layout.tsx            # Persistent Quick-Exit FAB + Hidden Nav
  │   ├── dashboard/page.tsx    # Hub with Influencer's latest content
  │   ├── education/            # Sub-routes for various topics
  │   │   ├── [category]/page.tsx
  │   │   └── [articleId]/page.tsx
  │   ├── vault/                # Secure Evidence Storage
  │   │   ├── upload/page.tsx
  │   │   └── gallery/page.tsx
  │   └── directory/            # NGO/Help Map
  │       └── page.tsx
  │
  ├── (influencer)
  │   ├── layout.tsx            # Sidebar navigation for creator tools
  │   ├── dashboard/page.tsx    # Analytics & Content Overview
  │   ├── upload/page.tsx       # Video/Story uploader
  │   └── comments/page.tsx     # Managed anonymous Q&A
  │
  └── (admin)
      ├── layout.tsx            # High-security admin sidebar
      ├── overview/page.tsx     # System health & global stats
      ├── ngos/                 # Verify & Update NGO directory
      └── users/                # Manage Influencer permissions
3. Component Library Strategy
Use HeroUI’s Slots system to build reusable, accessible components.

Buttons: Use color="danger" variant="shadow" for the Quick Exit to make it visually distinct.

Cards: Use isPressable and isHoverable for the Education Hub tiles to make them feel interactive (essential for children).

Modals: All PIN entries and sensitive confirmations must use the Modal component with backdrop="blur" to hide background content from prying eyes.

Inputs: Use labelPlacement="outside" for clear, accessible forms in the Admin/Influencer portals.