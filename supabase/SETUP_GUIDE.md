# Supabase Configuration Guide

## Step 1: Get Your API Keys

1. **Go to your Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/mqnbprkjqhupvjhzucpn
   
2. **Open Settings → API Keys:**
   - Click **Settings** in the left sidebar
   - Click **API Keys** tab
   
3. **Copy the following values:**
   - **Project URL** (at the top of the page)
   - **Publishable key** (under "Publishable and secret API keys" - safe to use in browser)
   - **Secret key** (under "Secret keys" - keep this secret, server-only!)

## Step 2: Update .env.local

Add these to your `.env.local` file (replace with your actual values):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mqnbprkjqhupvjhzucpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here
SUPABASE_SERVICE_ROLE_KEY=your_secret_key_here
```

**IMPORTANT:** 
- `NEXT_PUBLIC_*` variables are exposed to the browser - safe for Publishable key
- `SUPABASE_SERVICE_ROLE_KEY` (Secret key) is server-only - NEVER expose this in client code!

## Step 3: Verify Tables Created

In your Supabase Dashboard:

1. **Database → Tables**
   - You should see 9 tables:
     - support_directory
     - evidence_metadata
     - safety_plans
     - emergency_bag
     - safety_steps
     - security_audit
     - predefined_plans
     - predefined_steps
     - master_security_tasks

2. **Storage → Buckets**
   - You should see: `evidence-vault` (private)

3. **Authentication → Policies**
   - Each table should have RLS enabled
   - Check that policies exist for user access

## Next: Code Migration

Once you've updated `.env.local` with your keys, we'll:
1. Create `lib/supabase.ts` client
2. Migrate `SafetyContext.tsx` to use Supabase Auth
3. Update all database calls in hooks

Let me know when you've added the keys!
