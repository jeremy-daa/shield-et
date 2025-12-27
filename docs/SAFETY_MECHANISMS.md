1. The Global "Safety State"
The app must manage a global state (using React Context) to track if the user is in Camouflage Mode or Portal Mode.

Camouflage Mode (Default): Shows only news/weather. No safety data is fetched.

Portal Mode: Accessible only after PIN verification. Unlocks educational content and the vault.

2. Quick Exit (Panic Logic)
The "Quick Exit" is a high-priority function available in every Portal component.

Trigger: A permanent Red Floating Action Button (FAB) or a specific gesture (triple-tap on screen).

Action:

State Reset: Immediately set SafetyMode to CAMOUFLAGE.

History Scrubbing: Use router.replace('/') to ensure the browser "Back" button doesn't return to the safety content.

Session Purge: Optional—clear the Appwrite local session if the threat is high.

Redirect: Force navigation to a neutral URL (e.g., google.com or the weather sub-page).

3. The Camouflage Entry (PIN System)
The PIN entry must be integrated into the "Fake" News page to avoid detection.

Mechanism: Users long-press (3 seconds) on the News Logo to trigger a subtle PIN overlay.

Security: - No "Incorrect PIN" error messages (to prevent brute-forcing by an abuser). Instead, use a silent fail or a "Network Error" disguise.

PIN is stored only in Appwrite’s sensitive user preferences, never in local storage as plain text.

4. Requirement for AI Agent
When generating code for these features, follow these patterns:

Implementation Pattern: The SafetyProvider
TypeScript

// AI Agent: Implement this pattern in /src/lib/context/SafetyContext.tsx
export const useSafety = () => {
  const [isSecure, setIsSecure] = useState(false);
  
  const quickExit = () => {
    setIsSecure(false);
    window.location.replace('https://www.google.com'); // Complete redirect
  };

  return { isSecure, setIsSecure, quickExit };
};
Implementation Pattern: The "Fake" News Route
Create a route /(camouflage)/news that acts as the public face.

Use Next.js Middleware to ensure that any attempt to access /(portal)/* without the isSecure session cookie redirects back to /news.