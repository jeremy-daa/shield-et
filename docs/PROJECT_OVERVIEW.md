Project: "Shield-ET" (Telegram Mini App for Safety)
1. Executive Summary
A dual-purpose Telegram Mini App (TMA) designed for the Ethiopian context. It serves as an educational platform for women and children regarding sexual and marital abuse. It features a "Camouflage Mode" to hide its true purpose from abusers and a "Secure Vault" for evidence collection.

2. Technical Stack
Framework: Next.js 14+ (App Router)

Language: TypeScript

Backend-as-a-Service: Appwrite (Cloud or Self-Hosted)

Deployment: Vercel (Frontend) / Appwrite Cloud (Database/Storage/Auth)

Platform: Telegram Mini App SDK (@telegram-apps/sdk)

Styling: Tailwind CSS + Shadcn UI

3. High-Level Architecture
Code snippet

graph TD
    A[Telegram User] --> B{Telegram Mini App}
    B --> C[Camouflage Layer: News/Weather]
    C -->|Secret PIN/Gesture| D[Core Safety Platform]
    D --> E[Education Hub: Influencer Content]
    D --> F[Secure Vault: Appwrite Storage]
    D --> G[Support Directory: Appwrite DB]
    D --> H[SOS/Quick Exit: Panic Logic]
4. Key Constraints for the AI Agent
Privacy First: Absolutely no PII (Personally Identifiable Information) should be stored. Use Appwrite’s Anonymous Sessions.

Performance: Optimized for low-bandwidth (3G/EDGE) common in rural Ethiopia. Use Next.js Image/Video optimization.

Security: Ensure "Quick Exit" is a global state that can be triggered from any sub-route.

Language: Support for English, Amharic, and Oromo.

5. Directory Structure
Plaintext

/src
  /app
    /(camouflage)      # Routes for the fake news/weather app
    /(portal)          # Protected routes (Safety Hub)
    /api               # Appwrite Function triggers
  /components
    /global            # QuickExit, Navigation
    /vault             # Encryption/Upload components
    /education         # Video player, Quiz components
  /lib
    /appwrite          # Client/Server SDK initialization
    /context           # SafetyContext (handling the PIN state)
