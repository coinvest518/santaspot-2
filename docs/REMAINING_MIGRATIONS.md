# Remaining Pages to Migrate from Supabase to Firebase

## Pages to Update

### 1. src/pages/Referrals.tsx
**Current**: Uses Supabase queries
**Change to**: Use Firebase functions
```tsx
// Replace
import { supabase } from '../lib/supabase';

// With
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { getReferrals } from '@/lib/firebase';
```

### 2. src/pages/Payments.tsx
**Current**: Uses Supabase for payment data
**Change to**: Use Firebase for user data

### 3. src/pages/Withdraw.tsx
**Current**: Uses Supabase for earnings
**Change to**: Use Firebase userProfile.earnings

### 4. src/pages/Offers.tsx
**Current**: Uses Supabase for offers
**Change to**: Keep as is (offers data can stay in Supabase or migrate to Firestore)

### 5. src/pages/CompleteProfile.tsx
**Current**: Uses Supabase for profile updates
**Change to**: Use Firebase updateUserProfile

### 6. src/lib/useUser.ts
**Current**: Supabase-based hook
**Replace with**: useFirebaseUser hook (already created)

### 7. src/components/authForm.tsx
**Current**: Old auth form
**Replace with**: FirebaseAuthForm.tsx (already created)

### 8. src/lib/supabase.ts
**Current**: Supabase client
**Action**: Can be deleted (Firebase client in src/lib/firebase.ts)

## Quick Migration Template

For each page, follow this pattern:

### Before (Supabase)
```tsx
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/useUser';

const { user } = useUser();

const { data } = await supabase
  .from('table')
  .select('*')
  .eq('id', user.id);
```

### After (Firebase)
```tsx
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { functionName } from '@/lib/firebase';

const { userProfile } = useFirebaseUser();

const data = await functionName(userProfile.uuid);
```

## Firebase Functions Available

```tsx
// Authentication
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
const { firebaseUser, userProfile, login, logout, signup } = useFirebaseUser();

// Click Tracking
import { trackReferralClick, getClickCount } from '@/lib/firebase';
await trackReferralClick(userProfile.uuid, referralCode);
const clicks = await getClickCount(userProfile.uuid);

// Referrals
import { createReferralRecord, getReferrals } from '@/lib/firebase';
await createReferralRecord(referrerUUID, referredUUID, referralCode);
const referrals = await getReferrals(userProfile.uuid);

// Donations
import { recordDonation, getUserDonations } from '@/lib/firebase';
await recordDonation(userProfile.uuid, amount, currency, network, txHash);
const donations = await getUserDonations(userProfile.uuid);

// User Profile
import { fetchUserProfile, updateUserProfile } from '@/lib/firebase';
const profile = await fetchUserProfile(firebaseUser.uid);
await updateUserProfile(firebaseUser.uid, { username: 'new name' });
```

## Priority Order

1. **HIGH**: Referrals.tsx (user-facing feature)
2. **HIGH**: CompleteProfile.tsx (signup flow)
3. **MEDIUM**: Payments.tsx (payment processing)
4. **MEDIUM**: Withdraw.tsx (earnings display)
5. **LOW**: Offers.tsx (can stay with Supabase)
6. **CLEANUP**: Delete old files

## Testing Checklist

After each migration:
- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] User can interact with features
- [ ] No console errors
- [ ] Firebase calls work

## Files Already Migrated

✅ App.tsx
✅ Landing.tsx
✅ Dashboard.tsx
✅ .env (environment variables)

## Files Created (Ready to Use)

✅ src/lib/firebase.ts
✅ src/context/FirebaseUserContext.tsx
✅ src/context/FirebaseUserProvider.tsx
✅ src/hooks/useFirebaseUser.ts
✅ src/components/FirebaseAuthForm.tsx

## Summary

- **Total pages to update**: 5
- **Total utilities to update**: 2
- **Total components to update**: 1
- **Estimated time**: 2-3 hours
- **Difficulty**: Low (mostly find/replace)

---

**Start with Referrals.tsx for highest impact!**
