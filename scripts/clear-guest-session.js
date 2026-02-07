// Clear Cached Guest Sessions Script
// Run this in browser console to clear any stale guest sessions

(async function clearGuestSession() {
  console.log("🧹 Clearing guest sessions...");
  
  try {
    // Import AppWrite
    const { account } = await import('/lib/appwrite.js');
    
    // Try to get current user
    try {
      const user = await account.get();
      console.log("Current user:", user);
      
      // If guest/anonymous, delete the session
      if (!user.$id || user.$id === '' || user.$id.startsWith('anonymous')) {
        console.log("❌ Guest session detected! Deleting...");
        await account.deleteSession('current');
        console.log("✅ Guest session deleted!");
      } else {
        console.log("✅ Valid user session:", user.$id);
      }
    } catch (error) {
      console.log("ℹ️ No active session (this is fine)");
    }
    
    // Also clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ Cleared browser storage");
    
    console.log("🎉 Cleanup complete! Refresh the page.");
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
})();
