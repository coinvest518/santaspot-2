# Firebase Quick Start - Santa'sPot

## 5-Minute Setup

### 1. Install Firebase
```bash
npm install firebase
```

### 2. Add Environment Variables
Create `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Update App.tsx
```tsx
import { FirebaseUserProvider } from './context/FirebaseUserProvider';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseUserProvider>
      {/* Your routes */}
    </FirebaseUserProvider>
  </QueryClientProvider>
);
```

### 4. Create Firestore Collections
In Firebase Console:
- Create collection: `users`
- Create collection: `clicks`
- Create collection: `referrals`
- Create collection: `donations`

### 5. Set Security Rules
Firebase Console > Firestore > Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /clicks/{document=**} {
      allow read, create: if request.auth != null;
    }
    match /referrals/{document=**} {
      allow read, create: if request.auth != null;
    }
    match /donations/{document=**} {
      allow read, create: if request.auth != null;
    }
  }
}
```

## Common Tasks

### Get Current User
```tsx
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

const { firebaseUser, userProfile } = useFirebaseUser();
console.log(userProfile.uuid);
console.log(userProfile.referral_code);
```

### Track Click
```tsx
import { trackReferralClick } from '@/lib/firebase';

await trackReferralClick(userProfile.uuid, referralCode);
```

### Get Referrals
```tsx
import { getReferrals } from '@/lib/firebase';

const referrals = await getReferrals(userProfile.uuid);
console.log(`${referrals.length} referrals`);
```

### Record Donation
```tsx
import { recordDonation } from '@/lib/firebase';

await recordDonation(
  userProfile.uuid,
  100,
  'USDC',
  'Ethereum',
  '0x123...'
);
```

### Get Donations
```tsx
import { getUserDonations } from '@/lib/firebase';

const donations = await getUserDonations(userProfile.uuid);
const total = donations.reduce((sum, d) => sum + d.amount, 0);
```

## File Structure
```
src/lib/firebase.ts                    # Core Firebase functions
src/context/FirebaseUserContext.tsx    # Context types
src/context/FirebaseUserProvider.tsx   # Context provider
src/hooks/useFirebaseUser.ts           # Custom hook
src/components/FirebaseAuthForm.tsx    # Login/signup form
src/pages/FirebaseDashboard.tsx        # Dashboard page
```

## Data Model

### User Profile
```
{
  uid: string,              // Firebase UID
  uuid: string,             // Unique identifier
  email: string,
  username: string | null,
  referral_code: string,    // 8-char code
  earnings: number,
  total_clicks: number,
  total_referrals: number,
  completed_offers: number,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Click Record
```
{
  id: string,
  user_uuid: string,
  referral_code: string,
  timestamp: Timestamp
}
```

### Referral Record
```
{
  id: string,
  referrer_uuid: string,
  referred_uuid: string,
  referral_code_used: string,
  status: 'pending' | 'completed',
  created_at: Timestamp
}
```

### Donation Record
```
{
  id: string,
  user_uuid: string,
  amount: number,
  currency: string,
  network: string,
  transaction_hash: string,
  created_at: Timestamp
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase app not initialized" | Import firebase.ts before using functions |
| "Permission denied" | Check Firestore security rules |
| "useFirebaseUser must be used within provider" | Wrap app with FirebaseUserProvider |
| Environment variables not loading | Restart dev server after updating .env.local |
| Data not appearing in Firestore | Check collection names match exactly |

## Referral Link Format
```
santaspot.xyz/r/A1B2C3D4
```
- 8-character uppercase code
- Generated from UUID
- Used for tracking referrals

## Key Features

✅ UUID-based user tracking
✅ Automatic referral code generation
✅ Click tracking with timestamps
✅ Referral chain management
✅ Donation history
✅ Real-time updates possible
✅ Type-safe TypeScript
✅ Firestore security rules

## Next: Full Guides
- See `IMPLEMENTATION_GUIDE.md` for detailed setup
- See `FIREBASE_MIGRATION.md` for migration details
- See `FIREBASE_REDESIGN_SUMMARY.md` for complete overview
