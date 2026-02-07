"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";

export default function DebugAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("Test User");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);

  // Monitor localStorage
  useEffect(() => {
    const updateKeys = () => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      setLocalStorageKeys(keys);
    };
    
    updateKeys();
    const interval = setInterval(updateKeys, 1000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    setLogs((prev) => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  const clearLogs = () => setLogs([]);

  const handleNuclearClear = () => {
    clearLogs();
    addLog("🔥 NUCLEAR CLEAR - Removing ALL browser data...", "info");
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    addLog(`Cleared ${keysToRemove.length} localStorage items`, "success");
    
    sessionStorage.clear();
    addLog("Cleared sessionStorage", "success");
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    addLog("Cleared cookies", "success");
    
    addLog("🧹 Browser storage cleared! Refreshing page...", "success");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleCreateAndLogin = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      // STEP 1: Create Account
      addLog("➕ Creating new account...");
      addLog(`User ID: ${userId}`);
      addLog(`Email: ${email}`);
      addLog(`Password length: ${password.length} chars`);

      const user = await account.create(userId, email, password, name);
      addLog("Account created!", "success");
      addLog(`Created User ID: ${user.$id}`);
      
      await new Promise((r) => setTimeout(r, 500));
      
      // Check localStorage BEFORE login
      addLog("📦 Checking localStorage BEFORE login...");
      const keysBeforeLogin = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysBeforeLogin.push(key);
          addLog(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
        }
      }
      if (keysBeforeLogin.length === 0) {
        addLog("  No localStorage keys found", "error");
      }
      
      // STEP 2: Login
      addLog("🔐 Logging in with new credentials...");
      const session = await account.createEmailPasswordSession(email, password);
      addLog("Session created!", "success");
      addLog(`Session ID: ${session.$id}`);
      addLog(`Session userId: ${session.userId}`);
      
      await new Promise((r) => setTimeout(r, 500));
      
      // Check localStorage AFTER login
      addLog("📦 Checking localStorage AFTER login...");
      const keysAfterLogin = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysAfterLogin.push(key);
          const value = localStorage.getItem(key);
          if (key && value) {
            addLog(`  - ${key}: ${value.substring(0, 80)}...`);
          }
        }
      }
      if (keysAfterLogin.length === 0) {
        addLog("  ⚠️ WARNING: No localStorage keys after login!", "error");
        addLog("  This means AppWrite is NOT storing the session!", "error");
      } else {
        addLog(`  Found ${keysAfterLogin.length} keys`, "success");
      }
      
      // CRITICAL TEST: Wait longer and try multiple times
      addLog("⏳ Waiting 2 seconds for session to fully propagate...");
      await new Promise((r) => setTimeout(r, 2000));
      
      // STEP 3: Get User (FIRST ATTEMPT)
      addLog("👤 Attempt 1: Fetching user details with account.get()...");
      try {
        const currentUser = await account.get();
        addLog("User retrieved!", "success");
        addLog(`User ID: ${currentUser.$id}`);
        addLog(`User Email: ${currentUser.email}`);
        addLog(`User Name: ${currentUser.name}`);
        
        // Check for guest
        const userJson = JSON.stringify(currentUser);
        if (userJson.includes("guest")) {
          addLog("⚠️ WARNING: Response contains 'guest'!", "error");
          addLog(`Full object: ${userJson}`, "error");
        } else {
          addLog("✅ SUCCESS! No guest role found!", "success");
        }
      } catch (firstAttemptError: any) {
        addLog(`❌ First attempt failed: ${firstAttemptError.message}`, "error");
        
        // Try recreating session
        addLog("🔄 Recreating session and trying again...");
        await account.createEmailPasswordSession(email, password);
        await new Promise((r) => setTimeout(r, 1000));
        
        addLog("👤 Attempt 2: Fetching user details...");
        const currentUser = await account.get();
        addLog("User retrieved on second attempt!", "success");
        addLog(`User ID: ${currentUser.$id}`);
        addLog(`User Email: ${currentUser.email}`);
        
        // Check for guest
        const userJson = JSON.stringify(currentUser);
        if (userJson.includes("guest")) {
          addLog("⚠️ WARNING: Response contains 'guest'!", "error");
          addLog(`Full object: ${userJson}`, "error");
        } else {
          addLog("✅ SUCCESS! No guest role found!", "success");
        }
      }
      
      
    } catch (error: any) {
      addLog(`❌ Failed: ${error.message}`, "error");
      addLog(`Error code: ${error.code}`, "error");
      addLog(`Error type: ${error.type}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckSession = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      addLog("Checking current session...");
      
      // Check localStorage first
      addLog("📦 Current localStorage keys:");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            addLog(`  - ${key}: ${value.substring(0, 80)}...`);
          }
        }
      }
      
      const user = await account.get();
      addLog("Session exists!", "success");
      addLog(`User ID: ${user.$id}`);
      addLog(`User Email: ${user.email}`);
      addLog(`Full user: ${JSON.stringify(user, null, 2)}`);
      
    } catch (error: any) {
      addLog(`No active session: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-500">🔧 Session Debug Panel</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            ← Return to Camouflage
          </button>
        </div>

        {/* LocalStorage Monitor */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-300 mb-3">📦 localStorage Monitor</h2>
          <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-1">
            {localStorageKeys.length === 0 ? (
              <div className="text-zinc-600">No localStorage keys found</div>
            ) : (
              localStorageKeys.map((key) => (
                <div key={key} className="text-zinc-400">
                  <span className="text-green-400">{key}</span>
                  <span className="text-zinc-600"> = </span>
                  <span className="text-yellow-400">{localStorage.getItem(key)?.substring(0, 60)}...</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Nuclear Clear */}
        <div className="bg-red-950 border-2 border-red-700 rounded-lg p-6">
          <button
            onClick={handleNuclearClear}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            🔥 NUCLEAR CLEAR (Clear All + Refresh)
          </button>
        </div>

        {/* Input Fields */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-300">Test Credentials</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g., tg-test-999"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@shield-et.internal"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Test User"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            onClick={() => {
              const id = Math.floor(Math.random() * 100000);
              setUserId(`tg-test-${id}`);
              setEmail(`test${id}@shield-et.internal`);
              setPassword(`pass${id}`);
              setName(`User ${id}`);
            }}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
          >
            🎲 Fill Random Data
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCreateAndLogin}
            disabled={isLoading || !userId || !email || !password}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg font-semibold transition-colors"
          >
            ➕ Create Account + Login + Debug
          </button>

          <button
            onClick={handleCheckSession}
            disabled={isLoading}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg font-semibold transition-colors"
          >
            🔍 Check Current Session
          </button>
        </div>

        {/* Logs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-300">Debug Logs</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-black border border-zinc-800 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-zinc-600 italic">
                Click "Create Account + Login + Debug" to start testing with full localStorage monitoring
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes("✅") ? "text-green-400" :
                    log.includes("❌") ? "text-red-400" :
                    log.includes("⚠️") ? "text-yellow-400" :
                    log.includes("🔥") ? "text-orange-400" :
                    log.includes("📦") ? "text-blue-400" :
                    "text-zinc-400"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
