# Critical Fix Required: Delete Old AppWrite Users

## The Problem

The guest session error is happening because:

1. **Old users** were created with deterministic password: `shield-identity-{telegramId}-v1`
2. **New auth** uses PIN-based password: `SHA256({pin}-{telegramId})`
3. When you try to login, passwords don't match → **401 error**
4. The error handler then tries to CREATE account → **409 conflict** (user exists)
5. This triggers wrong PIN flow, which shows the guest error

## The Solution

**Delete ALL existing users from AppWrite Console**

### Step-by-Step Instructions

1. **Open AppWrite Console**
   - Go to your AppWrite dashboard
   - Navigate to **Auth** → **Users**

2. **Delete Test Users**
   - Find any users with email pattern: `{number}@shield-et.internal`
   - Example: `5980837152@shield-et.internal`
   - Click on each user → **Delete**
   - Confirm deletion

3. **Clear Browser Sessions**
   - Open browser console (F12)
   - Run:
     ```javascript
     localStorage.clear();
     sessionStorage.clear();
     location.reload();
     ```

4. **Test Fresh Auth Flow**
   - Long-press "Shield" header for 3 seconds
   - Enter a new 4-digit PIN (e.g., `1234`)
   - Should see in console:
     ```
     [SafetyContext] Creating new account...
     [SafetyContext] ✅ NEW ACCOUNT CREATED
     ```

## Alternative: Migration Script (if you want to keep users)

If you want to migrate existing users instead of deleting them:

```javascript
// Run in AppWrite Console or backend
// This would need  to be a server-side script with Admin SDK
// NOT recommended - cleaner to start fresh in development
```

## Why This Happened

The authentication method changed fundamentally:
- **Before**: Password = `shield-identity-{id}-v1` (stored, PIN verified separately)
- **After**: Password = `SHA256({PIN}-{id})` (PIN IS the password)

Existing accounts can't be updated because:
- We don't know the original PIN they chose
- AppWrite doesn't let you update passwords without knowing the old password
- Would need complex migration flow

## Recommended Action

**✅ Delete old users** (development environment)
- Clean slate
- All new accounts use PIN-based auth
- No migration complexity

---

Once you've deleted the users, test again and it should work perfectly!
