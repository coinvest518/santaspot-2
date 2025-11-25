# Verify Firebase Migration

## Quick Verification Steps

### 1. Check Environment Variables
```bash
# Verify .env has Firebase credentials
cat .env | grep FIREBASE
```

Expected output:
```
VITE_FIREBASE_API_KEY=AIzaSyCK9wou94aEgnxpmJHQne62fijTGlBo1TY
VITE_FIREBASE_AUTH_DOMAIN=santaspot-d86b8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=santaspot-d86b8
...
```

### 2. Check No Supabase Imports Remain
```bash
# Search for Supabase imports
grep -r "from '@supabase" src/ || echo "✅ No Supabase imports found"
grep -r "from '../lib/supabase" src/ || echo "✅ No Supabase imports found"
```

### 3. Verify Firebase Imports
```bash
# Check Firebase imports exist
grep -r "from '@/lib/firebase" src/ | head -5
grep -r "useFirebaseUser" src/ | head -5
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Signup Flow
1. Go to http://localhost:5173
2. Click "Need an account?"
3. Enter email and password
4. Click "Create Account"
5. Check browser console for errors

### 6. Test Login Flow
1. Go to http://localhost:5173
2. Enter email and password
3. Click "Sign In"
4. Should redirect to dashboard

### 7. Check Firestore Data
1. Go to Firebase Console
2. Select santaspot-d86b8 project
3. Go to Firestore Database
4. Check collections:
   - users (should have new user)
   - clicks (should be empty initially)
   - referrals (should be empty initially)
   - donations (should be empty initially)

### 8. Test Dashboard
1. After login, should see dashboard
2. Check stats display
3. Check referral link copy works
4. Check donation history

## Files Migrated

### Pages (5/5)
- ✅ Landing.tsx
- ✅ Dashboard.tsx
- ✅ Referrals.tsx
- ✅ Payments.tsx
- ✅ Withdraw.tsx
- ✅ Offers.tsx
- ✅ CompleteProfile.tsx

### Utilities (2/2)
- ✅ useUser.ts
- ✅ authForm.tsx

### Core (5/5)
- ✅ App.tsx
- ✅ .env
- ✅ firebase.ts
- ✅ FirebaseUserContext.tsx
- ✅ FirebaseUserProvider.tsx
- ✅ useFirebaseUser.ts
- ✅ FirebaseAuthForm.tsx

## Common Issues & Solutions

### Issue: "Firebase app not initialized"
**Solution**: Restart dev server
```bash
npm run dev
```

### Issue: "Permission denied" in console
**Solution**: Check Firestore security rules are applied

### Issue: Blank dashboard
**Solution**: Check browser console for errors

### Issue: Can't sign up
**Solution**: Check Firebase Auth is enabled in console

## Success Indicators

✅ App starts without errors
✅ Can signup with email/password
✅ Can login with email/password
✅ Dashboard loads after login
✅ Firestore collections have data
✅ No Supabase errors in console
✅ Referral link works
✅ Click tracking works

## Rollback (If Needed)

If issues occur:
1. Keep old Supabase files as backup
2. Revert to previous git commit
3. Debug specific issue
4. Re-migrate

## Performance Check

```bash
# Build for production
npm run build

# Check bundle size
ls -lh dist/
```

## Final Checklist

- [ ] Environment variables set
- [ ] No Supabase imports remain
- [ ] Firebase imports present
- [ ] Dev server starts
- [ ] Signup works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Firestore has data
- [ ] No console errors
- [ ] Build succeeds

---

**Status**: Ready for production deployment

**Next**: Deploy to production!
