"use client";

import { useState } from "react";
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

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    setLogs((prev) => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  const clearLogs = () => setLogs([]);

  const handleLogin = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      addLog("Attempting login with email/password...");
      addLog(`Email: ${email}`);
      addLog(`Password length: ${password.length} chars`);

      const session = await account.createEmailPasswordSession(email, password);
      addLog("Session created!", "success");
      addLog(`Session ID: ${session.$id}`);
      
      await new Promise((r) => setTimeout(r, 300));
      
      addLog("Fetching user details...");
      const user = await account.get();
      addLog("User retrieved!", "success");
      addLog(`User ID: ${user.$id}`);
      addLog(`User Email: ${user.email}`);
      addLog(`User Name: ${user.name}`);
      addLog(`User Labels: ${JSON.stringify(user.labels)}`);
      
    } catch (error: any) {
      addLog(`Login failed: ${error.message}`, "error");
      addLog(`Error code: ${error.code}`, "error");
      addLog(`Error type: ${error. type}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      addLog("Creating new account...");
      addLog(`User ID: ${userId}`);
      addLog(`Email: ${email}`);
      addLog(`Password length: ${password.length} chars`);
      addLog(`Name: ${name}`);

      const user = await account.create(userId, email, password, name);
      addLog("Account created!", "success");
      addLog(`Created User ID: ${user.$id}`);
      addLog(`Created Email: ${user.email}`);
      
      await new Promise((r) => setTimeout(r, 300));
      
      addLog("Now logging in with new credentials...");
      const session = await account.createEmailPasswordSession(email, password);
      addLog("Session created!", "success");
      addLog(`Session ID: ${session.$id}`);
      
      await new Promise((r) => setTimeout(r, 300));
      
      addLog("Fetching user details...");
      const currentUser = await account.get();
      addLog("User retrieved!", "success");
      addLog(`User ID: ${currentUser.$id}`);
      addLog(`User Email: ${currentUser.email}`);
      
    } catch (error: any) {
      addLog(`Account creation failed: ${error.message}`, "error");
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
      const user = await account.get();
      addLog("Session exists!", "success");
      addLog(`User ID: ${user.$id}`);
      addLog(`User Email: ${user.email}`);
      addLog(`User Name: ${user.name}`);
      
    } catch (error: any) {
      addLog(`No active session: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      addLog("Deleting current session...");
      await account.deleteSession("current");
      addLog("Session deleted!", "success");
      
    } catch (error: any) {
      addLog(`Session deletion failed: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-500">🔧 Auth Debug Panel</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            ← Return to Camouflage
          </button>
        </div>

        {/* Input Fields */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-300">Credentials</h2>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">User ID (for creation)</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., tg-5980837152"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., 5980837152@shield-et.internal"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (visible for debugging)"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Name (for creation)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Test User"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg font-semibold transition-colors"
          >
            🔐 Login
          </button>

          <button
            onClick={handleCreateAccount}
            disabled={isLoading || !userId || !email || !password}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg font-semibold transition-colors"
          >
            ➕ Create Account
          </button>

          <button
            onClick={handleCheckSession}
            disabled={isLoading}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg font-semibold transition-colors"
          >
            🔍 Check Session
          </button>

          <button
            onClick={handleDeleteSession}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg font-semibold transition-colors"
          >
            🗑️ Delete Session
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
          
          <div className="bg-black border border-zinc-800 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm space-y-1">
            {logs.length === 0 ? (
              <div className="text-zinc-600 italic">No logs yet. Click a button to test auth.</div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes("✅") ? "text-green-400" :
                    log.includes("❌") ? "text-red-400" :
                    "text-zinc-400"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Fill Buttons */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-300 mb-4">Quick Fill</h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setUserId("tg-test-123");
                setEmail("test123@shield-et.internal");
                setPassword("test-password-123");
                setName("Test User");
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
            >
              Fill Test Data
            </button>
            
            <button
              onClick={() => {
                const randomId = Math.floor(Math.random() * 1000000);
                setUserId(`tg-${randomId}`);
                setEmail(`${randomId}@shield-et.internal`);
                setPassword(`pass-${randomId}`);
                setName(`User ${randomId}`);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
            >
              Fill Random Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
