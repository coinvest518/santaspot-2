# Firebase Migration Guide

## Overview
This guide explains the migration from Supabase to Firebase with UUID-based user tracking for clicks, referrals, and donations.

## Key Changes

### 1. Authentication
- **Old**: Supabase Auth with email/password
- **New**: Firebase Authentication with email/password
- **Benefits**: Better integration with Firestore, simpler setup

### 2. Database Structure
- **Old**: Supabase PostgreSQL tables
- **New**: Firebase Firestore collections

#### Firestore Collections:

**users**
```
{
  uid: string (Firebase Auth UID)
  uuid: string (Unique identifier for tracking)
  email: string
  username: string | null
  referral_code: string
  earnings: number
  total_clicks: number
  total_referrals: number
  completed_offers: number
  created_at: Timestamp
  updated_at: Timestamp
}
```

**clicks**
```
{
  id: string (UUID)
  user_uuid: string
  referral_code: string
  timestamp: Timestamp
  ip_address: string (optional)
}
```

**referrals**
```
{
  id: string (UUID)
  referrer_uuid: string
  referred_uuid: string
  referral_code_used: string
  status: 'pending' | 'completed'
  created_at: Timestamp
}
```

**donations**
```
{
  id: string (UUID)
  user_uuid: string
  amount: number
  currency: string
  network: string
  transaction_hash: string (optional)
  created_at: Timestamp
}
```

### 3. UUID System
- Every user gets a unique UUID (v4) on signup
- All tracking (clicks, referrals, donations) uses UUID instead of Firebase UID
- Referral codes are 8-character uppercase strings derived from UUID
- Benefits: Privacy, easier data migration, better tracking

### 4. File Structure
```
src/
├── lib/
│   ├── firebase.ts (NEW - Firebase initialization and functions)
│   └── supabase.ts (OLD - Keep for reference during migration)
├── context/
│   ├── FirebaseUserContext.tsx (NEW)
│   ├── FirebaseUserProvider.tsx (NEW)
│   ├── UserContext.tsx (OLD)
│   └── UserProvider.tsx (OLD)
├── hooks/
│   ├── useFirebaseUser.ts (NEW)
│   └── useUser.ts (OLD)
└── components/
    ├── FirebaseAuthForm.tsx (NEW)
    └── authForm.tsx (OLD)
```

## Setup Instructions

### 1. Install Firebase SDK
```bash
npm install firebase
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your Firebase credentials:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### 3. Update App.tsx
Replace `UserProvider` with `FirebaseUserProvider`:
```tsx
import { FirebaseUserProvider } from './context/FirebaseUserProvider';

// In App component:
<FirebaseUserProvider>
  {/* rest of app */}
</FirebaseUserProvider>
```

### 4. Update Components
Replace old auth hooks with new Firebase hooks:
```tsx
// Old
import { useUser } from '@/lib/useUser';
const { user } = useUser();

// New
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
const { firebaseUser, userProfile } = useFirebaseUser();
```

## API Reference

### Authentication
```tsx
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

const { firebaseUser, userProfile, login, logout, signup } = useFirebaseUser();

// Sign up
await signup(email, password);

// Sign in
await login(email, password);

// Sign out
await logout();
```

### Click Tracking
```tsx
import { trackReferralClick, getClickCount } from '@/lib/firebase';

// Track a click
await trackReferralClick(userProfile.uuid, referralCode);

// Get total clicks
const clicks = await getClickCount(userProfile.uuid);
```

### Referral Management
```tsx
import { createReferralRecord, getReferrals } from '@/lib/firebase';

// Create referral
await createReferralRecord(referrerUUID, referredUUID, referralCode);

// Get referrals
const referrals = await getReferrals(userProfile.uuid);
```

### Donations
```tsx
import { recordDonation, getUserDonations } from '@/lib/firebase';

// Record donation
await recordDonation(userProfile.uuid, amount, currency, network, txHash);

// Get donations
const donations = await getUserDonations(userProfile.uuid);
```

## Migration Checklist

- [ ] Install Firebase SDK
- [ ] Set up Firebase project and get credentials
- [ ] Create `.env.local` with Firebase config
- [ ] Create Firestore collections (users, clicks, referrals, donations)
- [ ] Update App.tsx to use FirebaseUserProvider
- [ ] Update Landing page to use FirebaseAuthForm
- [ ] Update Dashboard to use useFirebaseUser
- [ ] Update Referrals page to use new API
- [ ] Update click tracking in referral links
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test referral tracking
- [ ] Test click tracking
- [ ] Deploy to production

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Anyone can read clicks (for analytics)
    match /clicks/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Anyone can read referrals
    match /referrals/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Users can read their own donations
    match /donations/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Issue: "useFirebaseUser must be used within FirebaseUserProvider"
**Solution**: Make sure FirebaseUserProvider wraps your entire app in App.tsx

### Issue: Environment variables not loading
**Solution**: Restart dev server after updating .env.local

### Issue: Firestore permission denied
**Solution**: Check Firestore security rules and ensure user is authenticated

## Next Steps

1. Migrate existing Supabase data to Firestore (if needed)
2. Update all pages to use new Firebase hooks
3. Implement real-time listeners for live updates
4. Add Firestore indexes for better query performance
5. Set up Firebase Cloud Functions for backend logic
