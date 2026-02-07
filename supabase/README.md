# Supabase CLI Setup & Migration Guide

## Quick Start (Using npx - No Installation Required)

Since global npm installation requires admin rights, we'll use `npx` to run Supabase CLI:

### Step 1: Login to Supabase

```powershell
npx supabase login
```

This will open your browser to authenticate.

### Step 2: Get Your Project Reference

1. Go to your Supabase Dashboard
2. Select your project
3. Copy the **Project Reference** from Settings → General
   - It's in the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### Step 3: Link Your Project

```powershell
# Replace YOUR_PROJECT_REF with your actual project reference
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Step 4: Push Migrations

```powershell
# Push all migrations to your Supabase project
npx supabase db push
```

This will execute:
- ✅ Create all 9 database tables
- ✅ Set up Row Level Security policies
- ✅ Create evidence-vault storage bucket
- ✅ Configure bucket permissions

### Step 5: Verify

Check your Supabase Dashboard:
1. **Database** → **Tables** - Should see 9 tables
2. **Storage** → Should see `evidence-vault` bucket

---

## Alternative: Manual Setup (No CLI)

If you prefer not to use the CLI, you can manually run the SQL migrations:

### 1. Copy Schema SQL

Open: `supabase/migrations/20260207000000_initial_schema.sql`

### 2. Run in Supabase SQL Editor

1. Go to Supabase Dashboard → **SQL Editor**
2. Paste the entire SQL file
3. Click **Run**

### 3. Create Storage Bucket

Open: `supabase/migrations/20260207000001_storage_bucket.sql`

1. Go to **SQL Editor**
2. Paste and **Run**

---

## Next Steps After Migration

Once migrations are pushed successfully:

1. **Install Supabase Client**
   ```powershell
   npm install @supabase/supabase-js
   ```

2. **Update `.env.local`**
   - Get your API keys from Supabase Dashboard → Settings → API
   - Add:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

3. **Start Code Migration**
   - Create `lib/supabase.ts`
   - Update `SafetyContext.tsx`
   - Migrate database calls

---

## Troubleshooting

**Permission Errors**: Use `npx supabase` instead of global install

**Migration Fails**: Check that project ref is correct and you're authenticated

**Bucket Not Created**: Run storage migration SQL manually in SQL Editor
