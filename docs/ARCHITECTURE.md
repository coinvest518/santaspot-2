# Santa'sPot Firebase Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    App.tsx                               │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  FirebaseUserProvider (Context)                   │  │   │
│  │  │  ┌──────────────────────────────────────────────┐ │  │   │
│  │  │  │  Pages & Components                          │ │  │   │
│  │  │  │  - Landing (FirebaseAuthForm)               │ │  │   │
│  │  │  │  - Dashboard (FirebaseDashboard)            │ │  │   │
│  │  │  │  - Referrals                                │ │  │   │
│  │  │  │  - Payments                                 │ │  │   │
│  │  │  │  - Withdraw                                 │ │  │   │
│  │  │  └──────────────────────────────────────────────┘ │  │   │
│  │  │                                                    │  │   │
│  │  │  useFirebaseUser Hook                             │  │   │
│  │  │  - firebaseUser                                   │  │   │
│  │  │  - userProfile (with UUID)                        │  │   │
│  │  │  - login, logout, signup                          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase SDK (src/lib/firebase.ts)           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Authentication Functions                               │   │
│  │  - signUp(email, password)                             │   │
│  │  - signIn(email, password)                             │   │
│  │  - logOut()                                            │   │
│  │  - subscribeToAuthChanges()                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  User Profile Functions                                 │   │
│  │  - fetchUserProfile(uid)                               │   │
│  │  - updateUserProfile(uid, updates)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Click Tracking Functions                               │   │
│  │  - trackReferralClick(uuid, code)                      │   │
│  │  - getClickCount(uuid)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Referral Functions                                      │   │
│  │  - createReferralRecord(referrer, referred, code)      │   │
│  │  - getReferrals(uuid)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Donation Functions                                      │   │
│  │  - recordDonation(uuid, amount, currency, network)     │   │
│  │  - getUserDonations(uuid)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Firebase SDK
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Firebase Backend                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Firebase Authentication                                │   │
│  │  - Email/Password Auth                                 │   │
│  │  - Session Management                                  │   │
│  │  - User UID Generation                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Firestore Database                                     │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Collection: users                                  │ │   │
│  │  │ - uid (Firebase UID) - Document ID                │ │   │
│  │  │ - uuid (Unique identifier)                        │ │   │
│  │  │ - email, username, referral_code                 │ │   │
│  │  │ - earnings, total_clicks, total_referrals        │ │   │
│  │  │ - completed_offers, created_at, updated_at       │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Collection: clicks                                 │ │   │
│  │  │ - id (UUID)                                        │ │   │
│  │  │ - user_uuid, referral_code                        │ │   │
│  │  │ - timestamp, ip_address                           │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Collection: referrals                              │ │   │
│  │  │ - id (UUID)                                        │ │   │
│  │  │ - referrer_uuid, referred_uuid                    │ │   │
│  │  │ - referral_code_used, status, created_at         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Collection: donations                              │ │   │
│  │  │ - id (UUID)                                        │ │   │
│  │  │ - user_uuid, amount, currency, network           │ │   │
│  │  │ - transaction_hash, created_at                    │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Security Rules                                         │   │
│  │  - User can only access own profile                    │   │
│  │  - Authenticated users can create records             │   │
│  │  - Public read for analytics                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### User Signup Flow
```
User Input (Email, Password)
         │
         ▼
FirebaseAuthForm Component
         │
         ▼
useFirebaseUser.signup()
         │
         ▼
firebase.signUp()
         │
         ├─ Firebase Auth: createUserWithEmailAndPassword()
         │  └─ Returns: Firebase UID
         │
         ├─ Generate UUID (v4)
         │
         ├─ Generate Referral Code (8-char from UUID)
         │
         └─ Firestore: Create user document
            {
              uid: Firebase UID,
              uuid: Generated UUID,
              email: user email,
              referral_code: Generated code,
              earnings: 100 (signup bonus),
              total_clicks: 0,
              total_referrals: 0,
              created_at: now
            }
         │
         ▼
User Profile Created
         │
         ▼
Redirect to Dashboard
```

### Click Tracking Flow
```
User Clicks "Copy Link"
         │
         ▼
copyLink() Function
         │
         ├─ Copy link to clipboard
         │
         └─ trackReferralClick(uuid, referralCode)
            │
            ▼
            firebase.trackReferralClick()
            │
            ├─ Create click record:
            │  {
            │    id: UUID,
            │    user_uuid: user UUID,
            │    referral_code: code,
            │    timestamp: now
            │  }
            │
            └─ Firestore: Add to clicks collection
               │
               ├─ Query user profile
               │
               └─ Increment total_clicks
         │
         ▼
Click Recorded & Tracked
```

### Referral Creation Flow
```
New User Signs Up with Referral Code
         │
         ▼
firebase.signUp()
         │
         ├─ Create new user profile (as above)
         │
         └─ Check for referral code
            │
            ▼
            createReferralRecord(referrerUUID, newUserUUID, code)
            │
            ├─ Create referral record:
            │  {
            │    id: UUID,
            │    referrer_uuid: referrer UUID,
            │    referred_uuid: new user UUID,
            │    referral_code_used: code,
            │    status: 'completed',
            │    created_at: now
            │  }
            │
            ├─ Firestore: Add to referrals collection
            │
            ├─ Query referrer profile
            │
            ├─ Increment total_referrals
            │
            └─ Add $50 to earnings
         │
         ▼
Referral Recorded & Earnings Updated
```

### Donation Recording Flow
```
User Records Donation
         │
         ▼
recordDonation(uuid, amount, currency, network, txHash)
         │
         ├─ Create donation record:
         │  {
         │    id: UUID,
         │    user_uuid: user UUID,
         │    amount: amount,
         │    currency: currency,
         │    network: network,
         │    transaction_hash: txHash,
         │    created_at: now
         │  }
         │
         └─ Firestore: Add to donations collection
            │
            ▼
            Donation Recorded
         │
         ▼
Dashboard Updates
         │
         ├─ Recalculate pot total
         │
         └─ Display in donation history
```

## Component Hierarchy

```
App
├── FirebaseUserProvider
│   ├── QueryClientProvider
│   │   ├── SidebarProvider
│   │   │   ├── TooltipProvider
│   │   │   │   ├── BrowserRouter
│   │   │   │   │   ├── Landing
│   │   │   │   │   │   └── FirebaseAuthForm
│   │   │   │   │   ├── Dashboard
│   │   │   │   │   │   └── FirebaseDashboard
│   │   │   │   │   ├── Referrals
│   │   │   │   │   ├── Payments
│   │   │   │   │   ├── Withdraw
│   │   │   │   │   └── Offers
│   │   │   │   └── Toaster
│   │   │   └── Analytics
```

## State Management

```
FirebaseUserContext
├── firebaseUser (Firebase User object)
│   ├── uid
│   ├── email
│   └── metadata
├── userProfile (User Profile from Firestore)
│   ├── uuid
│   ├── referral_code
│   ├── earnings
│   ├── total_clicks
│   ├── total_referrals
│   └── completed_offers
├── loading (boolean)
├── error (string | null)
└── Methods
    ├── login(email, password)
    ├── logout()
    └── signup(email, password)
```

## Database Schema

### users Collection
```
Document ID: Firebase UID
{
  uid: string,
  uuid: string,
  email: string,
  username: string | null,
  referral_code: string,
  earnings: number,
  total_clicks: number,
  total_referrals: number,
  completed_offers: number,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### clicks Collection
```
Document ID: Auto-generated
{
  id: string (UUID),
  user_uuid: string,
  referral_code: string,
  timestamp: Timestamp,
  ip_address: string (optional)
}
```

### referrals Collection
```
Document ID: Auto-generated
{
  id: string (UUID),
  referrer_uuid: string,
  referred_uuid: string,
  referral_code_used: string,
  status: 'pending' | 'completed',
  created_at: Timestamp
}
```

### donations Collection
```
Document ID: Auto-generated
{
  id: string (UUID),
  user_uuid: string,
  amount: number,
  currency: string,
  network: string,
  transaction_hash: string (optional),
  created_at: Timestamp
}
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│  Firestore Security Rules               │
├─────────────────────────────────────────┤
│                                         │
│  /users/{uid}                           │
│  ├─ read: if auth.uid == uid           │
│  └─ write: if auth.uid == uid          │
│                                         │
│  /clicks/{document}                     │
│  ├─ read: if auth != null              │
│  └─ create: if auth != null            │
│                                         │
│  /referrals/{document}                  │
│  ├─ read: if auth != null              │
│  └─ create: if auth != null            │
│                                         │
│  /donations/{document}                  │
│  ├─ read: if auth != null              │
│  └─ create: if auth != null            │
│                                         │
└─────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────┐
│  Firestore Indexes                      │
├─────────────────────────────────────────┤
│                                         │
│  clicks                                 │
│  ├─ user_uuid (Ascending)              │
│  └─ timestamp (Descending)             │
│                                         │
│  referrals                              │
│  ├─ referrer_uuid (Ascending)          │
│  └─ created_at (Descending)            │
│                                         │
│  donations                              │
│  ├─ user_uuid (Ascending)              │
│  └─ created_at (Descending)            │
│                                         │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│  Development Environment                     │
│  - Local Firebase Emulator (optional)        │
│  - .env.local with dev credentials          │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│  Staging Environment                         │
│  - Firebase Project (staging)                │
│  - .env.staging with staging credentials    │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│  Production Environment                      │
│  - Firebase Project (santaspot-d86b8)       │
│  - .env.production with prod credentials    │
│  - Firestore with security rules            │
│  - Firebase Auth enabled                    │
└──────────────────────────────────────────────┘
```

## Scalability

```
As Users Grow:

1-100 Users
├─ Single Firestore database
├─ No indexes needed
└─ Real-time listeners work fine

100-1000 Users
├─ Add Firestore indexes
├─ Implement caching
└─ Monitor read/write costs

1000+ Users
├─ Use Cloud Functions for complex logic
├─ Implement data archiving
├─ Consider sharding strategies
└─ Monitor performance metrics
```

## Monitoring & Analytics

```
Firebase Console Provides:
├─ Authentication metrics
│  ├─ Sign-ups per day
│  ├─ Active users
│  └─ Sign-in methods
├─ Firestore metrics
│  ├─ Read/write operations
│  ├─ Storage usage
│  └─ Query performance
└─ Real-time database usage
```
