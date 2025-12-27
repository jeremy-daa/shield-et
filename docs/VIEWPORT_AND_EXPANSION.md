1. Viewport Lifecycle & MountingBefore accessing any dimension data, the viewport must be "mounted." This is an asynchronous process because the Mini App must request this data from the Telegram parent application.Initialization Requirement: Always use the viewport.mount() method.Stability Check: During the transition (like when a user is dragging the BottomSheet), the viewport is "unstable." The AI agent should avoid triggering heavy re-renders or layout shifts during this period.2. Expansion & Fullscreen ControlBy default, TMAs open in a minimized state on mobile (a BottomSheet). For your "Safety Portal," you may want to expand it programmatically to provide more space for educational content.Expansion: Use viewport.expand() to pull the app to its maximum height.Fullscreen Mode: For immersive education or video content, use viewport.requestFullscreen().Logic: - The "Camouflage" News feed should stay in the minimized state to look like a quick utility.The "Safety Portal" should trigger expand() upon entry to provide a full-app experience.3. Safe Area & Content InsetsTo prevent UI elements (like your "Quick Exit" button) from being covered by notches, home indicators, or Telegram's top bar, you must use Safe Area Insets.Safe Area Insets: The raw distance from the edge of the device to the usable area.Content Safe Area: The area specifically free from Telegram’s own UI overlays.CSS Integration (The Standard)The most efficient way to handle this is by binding viewport properties to CSS Variables.TypeScript// AI Agent: Initialize viewport and bind CSS variables in /src/hooks/useTelegramViewport.ts
import { viewport } from '@telegram-apps/sdk';

export const initViewportLogic = async () => {
  if (viewport.mount.isAvailable()) {
    await viewport.mount();
    
    // Binds --tg-viewport-height, --tg-viewport-width, etc.
    if (viewport.bindCssVars.isAvailable()) {
      viewport.bindCssVars();
    }
  }
};
4. UI Implementation StandardsUse these CSS variables in your Tailwind/HeroUI components to ensure perfect positioning:VariableUsagevar(--tg-viewport-height)Use for 100vh equivalents to prevent "bottom-bar overlap."var(--tg-viewport-stable-height)Use for pinning elements (like the Quick Exit button) to the bottom.padding-bottom: env(safe-area-inset-bottom)Crucial: Use this on the bottom container to avoid the iPhone home bar.Implementation Pattern: The "Fixed Bottom" ButtonTypeScript// AI Agent: Standard for any bottom-pinned button (Quick Exit, Main Action)
<div className="fixed bottom-0 w-full px-4 pb-[env(safe-area-inset-bottom)] mb-4">
  <Button color="danger" fullWidth onClick={quickExit}>
    Quick Exit
  </Button>
</div>
5. Device Width RecognitionTelegram does not provide a "Device Name" (e.g., "iPhone 15"), but it provides exact pixel widths. Your AI agent should use standard breakpoints but prioritize the width signal from the SDK.Mobile: Typically 320px to 420px.Desktop/Web: Opens in a fixed-size medium window (standard is ~600px centered).Guideline: If viewport.width > 600, the AI should switch to a "Tablet/Desktop" layout for the Admin/Influencer portals.