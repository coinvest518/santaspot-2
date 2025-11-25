# Firebase Implementation Guide for Santa'sPot

## Quick Start

### Step 1: Install Dependencies
```bash
npm install firebase
```

### Step 2: Set Up Environment Variables
Create `.env.local` in your project root:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 3: Update App.tsx
Replace the old UserProvider with FirebaseUserProvider:

```tsx
import { FirebaseUserProvider } from './context/FirebaseUserProvider';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseUserProvider>
      <SidebarProvider defaultOpen={true}>
        <TooltipProvider>
          <BrowserRouter>
            {/* Routes */}
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </FirebaseUserProvider>
  </QueryClientProvider>
);
```

### Step 4: Create Firestore Collections
In Firebase Console, create these collections:

**1. users**
- Document ID: Firebase UID
- Fields: uid, uuid, email, username, referral_code, earnings, total_clicks, total_referrals, completed_offers, created_at, updated_at

**2. clicks**
- Auto-generated document IDs
- Fields: id, user_uuid, referral_code, timestamp, ip_address

**3. referrals**
- Auto-generated document IDs
- Fields: id, referrer_uuid, referred_uuid, referral_code_used, status, created_at

**4. donations**
- Auto-generated document IDs
- Fields: id, user_uuid, amount, currency, network, transaction_hash, created_at

### Step 5: Set Firestore Security Rules
Go to Firebase Console > Firestore > Rules and paste:

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

## File Structure

```
src/
├── lib/
│   └── firebase.ts                 # Firebase initialization & functions
├── context/
│   ├── FirebaseUserContext.tsx      # Context type definitions
│   └── FirebaseUserProvider.tsx     # Context provider
├── hooks/
│   └── useFirebaseUser.ts           # Custom hook for Firebase context
├── components/
│   └── FirebaseAuthForm.tsx         # Login/signup form
└── pages/
    └── FirebaseDashboard.tsx        # Dashboard with Firebase
```

## Usage Examples

### Authentication

```tsx
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

function MyComponent() {
  const { firebaseUser, userProfile, login, logout, signup } = useFirebaseUser();

  const handleSignup = async () => {
    try {
      await signup('user@example.com', 'password123');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      {firebaseUser ? (
        <>
          <p>Welcome, {userProfile?.username || 'User'}!</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={handleSignup}>Sign Up</button>
          <button onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  );
}
```

### Click Tracking

```tsx
import { trackReferralClick, getClickCount } from '@/lib/firebase';

// Track when user clicks referral link
await trackReferralClick(userProfile.uuid, referralCode);

// Get total clicks for user
const clicks = await getClickCount(userProfile.uuid);
console.log(`User has ${clicks} clicks`);
```

### Referral Management

```tsx
import { createReferralRecord, getReferrals } from '@/lib/firebase';

// Create referral when new user signs up with referral code
await createReferralRecord(referrerUUID, newUserUUID, referralCode);

// Get all referrals for a user
const referrals = await getReferrals(userProfile.uuid);
console.log(`User has ${referrals.length} referrals`);
```

### Donations

```tsx
import { recordDonation, getUserDonations } from '@/lib/firebase';

// Record a crypto donation
await recordDonation(
  userProfile.uuid,
  100,
  'USDC',
  'Ethereum',
  '0x123abc...'
);

// Get all donations for user
const donations = await getUserDonations(userProfile.uuid);
const total = donations.reduce((sum, d) => sum + d.amount, 0);
console.log(`User donated $${total}`);
```

## Data Flow

### User Signup
1. User enters email and password
2. Firebase creates auth user (gets Firebase UID)
3. System generates UUID and referral code
4. User profile created in Firestore with all data
5. User redirected to dashboard

### Referral Click
1. User clicks referral link
2. `trackReferralClick()` called with user UUID and referral code
3. Click record created in Firestore
4. User's total_clicks incremented

### New Referral
1. New user signs up with referral code
2. `createReferralRecord()` called
3. Referral record created in Firestore
4. Referrer's earnings increased by $50
5. Referrer's total_referrals incremented

### Donation
1. User makes crypto donation
2. `recordDonation()` called with amount, currency, network
3. Donation record created in Firestore
4. Donation appears in user's donation history

## UUID System Benefits

1. **Privacy**: Users identified by UUID, not email
2. **Tracking**: All actions (clicks, referrals, donations) linked to UUID
3. **Migration**: Easy to migrate data between systems
4. **Analytics**: Better data analysis with consistent identifiers
5. **Security**: Decouples user identity from Firebase UID

## Referral Code Format

- 8 characters, uppercase
- Generated from UUID slice
- Example: `A1B2C3D4`
- Used in referral links: `santaspot.xyz/r/A1B2C3D4`

## Real-time Updates

To add real-time listeners for live updates:

```tsx
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Listen to user's clicks in real-time
const q = query(collection(db, 'clicks'), where('user_uuid', '==', userProfile.uuid));
const unsubscribe = onSnapshot(q, (snapshot) => {
  const clicks = snapshot.docs.map(doc => doc.data());
  console.log('Updated clicks:', clicks);
});

// Cleanup
return () => unsubscribe();
```

## Performance Optimization

### Indexes
Create Firestore indexes for better query performance:

1. **clicks**: Index on (user_uuid, timestamp)
2. **referrals**: Index on (referrer_uuid, created_at)
3. **donations**: Index on (user_uuid, created_at)

### Caching
Use React Query to cache data:

```tsx
import { useQuery } from '@tanstack/react-query';
import { getReferrals } from '@/lib/firebase';

const { data: referrals } = useQuery({
  queryKey: ['referrals', userProfile.uuid],
  queryFn: () => getReferrals(userProfile.uuid),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Troubleshooting

### Issue: "Firebase app not initialized"
**Solution**: Make sure firebase.ts is imported before using any Firebase functions

### Issue: "Permission denied" errors
**Solution**: Check Firestore security rules and ensure user is authenticated

### Issue: Data not appearing in Firestore
**Solution**: Check browser console for errors, verify collection names match exactly

### Issue: UUID not generating
**Solution**: Make sure uuid package is installed: `npm install uuid`

## Migration from Supabase

If migrating existing data:

1. Export data from Supabase
2. Transform to Firebase format (add UUID, referral_code)
3. Import to Firestore using Firebase Admin SDK
4. Test all functionality
5. Update app to use Firebase
6. Deploy

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Create Firestore collections
3. ✅ Set security rules
4. ✅ Update App.tsx
5. ✅ Update Landing page to use FirebaseAuthForm
6. ✅ Update Dashboard to use FirebaseDashboard
7. ✅ Update Referrals page
8. ✅ Test all flows
9. ✅ Deploy to production

## Support

For Firebase documentation: https://firebase.google.com/docs
For Firestore documentation: https://firebase.google.com/docs/firestore
