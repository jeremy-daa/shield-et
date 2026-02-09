"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserProfile, createUserProfile } from "@/lib/course-helpers";

export default function LoginCard() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError) throw authError;

      if (data.user) {
        // Get user profile to determine role
        let profile = await getUserProfile(data.user.id);

        // Create profile if it doesn't exist
        if (!profile) {
          console.log("No profile found, creating default user profile");
          await createUserProfile(data.user.id, "user", data.user.email);
          profile = await getUserProfile(data.user.id);
        }

        console.log("User profile:", profile);

        // Redirect based on role
        if (profile?.user_role === "influencer") {
          console.log("Redirecting to influencer home");
          router.push("/home");
        } else if (profile?.user_role === "admin") {
          console.log("Redirecting to admin");
          router.push("/admin");
        } else {
          console.log("Redirecting to dashboard");
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Create user profile (default role: 'user')
        await createUserProfile(data.user.id, "user", displayName);

        setError(
          "Account created! Please check your email to verify your account.",
        );
        setIsSignUp(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 shadow-xl rounded-2xl overflow-hidden relative z-10">
      {/* Back Button */}
      <div className="pt-4 px-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </button>
      </div>

      <div className="flex flex-col gap-1 items-center px-8 pt-4 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
          {isSignUp ? (
            <UserPlus size={32} className="text-emerald-500" />
          ) : (
            <LogIn size={32} className="text-emerald-500" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-zinc-400 text-sm text-center">
          {isSignUp
            ? "Fill in your details to get started"
            : "Enter your credentials to access your dashboard"}
        </p>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-6">
        <form
          onSubmit={isSignUp ? handleSignUp : handleLogin}
          className="flex flex-col gap-5"
        >
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-sm font-medium">
                Display Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus size={18} className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl h-12 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-sm font-medium">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl h-12 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-zinc-400 text-sm font-medium">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl h-12 pl-10 pr-10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className={`text-sm p-3 rounded-xl border flex items-center gap-3 ${
                error.includes("created")
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  error.includes("created") ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus size={20} /> Create Account
              </>
            ) : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500 text-[10px] tracking-widest">
              Or continue with
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-zinc-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
