# Troubleshooting Guide

## Common Issues and Solutions

### 1. React Router Warnings ✅ FIXED

**Warning Messages:**
```
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7.
```

**Solution:** ✅ Fixed in `src/App.tsx`
- Added future flags to `BrowserRouter` to opt-in to v7 behavior early
- This eliminates the warnings

### 2. Firebase Authentication Error (400) ⚠️ NEEDS CONFIGURATION

**Error Message:**
```
Failed to load resource: the server responded with a status of 400
identitytoolkit.googleapis.com/v1/accounts:signUp?key=...
```

**Causes:**
1. **Missing Environment Variables** - Most common cause
2. **Invalid Firebase API Key**
3. **Firebase Authentication not enabled**
4. **Incorrect Firebase project configuration**

**Solutions:**

#### Step 1: Create `.env` File

Create a `.env` file in the project root with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Step 2: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Click the **Web app icon** (`</>`) or **"Add app"** → **Web**
6. Register your app (give it a nickname)
7. Copy the `firebaseConfig` values
8. Paste them into your `.env` file

#### Step 3: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

#### Step 4: Restart Development Server

After creating/updating `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Firebase Initialization Errors

**Console Messages:**
```
❌ Missing Firebase environment variables: VITE_FIREBASE_API_KEY, ...
⚠️ Firebase configuration is incomplete
```

**Solution:**
- Check that all required environment variables are set in `.env`
- Ensure variable names start with `VITE_` (required for Vite)
- Restart the dev server after changes

### 4. Better Error Messages ✅ IMPROVED

**What Changed:**
- Added better error handling in `src/hooks/useAuth.tsx`
- More user-friendly error messages for:
  - Invalid email
  - Weak password
  - Email already in use
  - Network errors
  - Firebase configuration errors

**Error Messages Now Show:**
- "This email is already registered. Please sign in instead."
- "Password must be at least 6 characters"
- "Firebase configuration error. Please check your .env file."
- And more...

### 5. Validation Improvements ✅ ADDED

**What Changed:**
- Email format validation before API calls
- Password length validation
- Better error messages for validation failures

---

## Quick Checklist

Before running the app, ensure:

- [ ] `.env` file exists in project root
- [ ] All `VITE_FIREBASE_*` variables are set
- [ ] Firebase project is created
- [ ] Authentication is enabled in Firebase Console
- [ ] Email/Password provider is enabled
- [ ] Development server is restarted after `.env` changes

---

## Testing Firebase Connection

1. **Check Console:**
   - Look for: `✅ Firebase initialized successfully`
   - If you see errors, check your `.env` file

2. **Test Sign Up:**
   - Try creating a new account
   - Check browser console for detailed errors
   - Check Firebase Console → Authentication → Users

3. **Test Sign In:**
   - Try logging in with created account
   - Verify redirect to dashboard works

---

## Still Having Issues?

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

2. **Verify Firebase Setup:**
   - Go to Firebase Console
   - Check Authentication is enabled
   - Verify API key is correct

3. **Check Environment Variables:**
   ```bash
   # In your terminal, verify variables are loaded:
   echo $VITE_FIREBASE_PROJECT_ID
   ```

4. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache

---

## Need Help?

- See `SETUP_GUIDE.md` for detailed setup instructions
- See `BACKEND_DOCUMENTATION.md` for backend details
- Check Firebase Console for project status

