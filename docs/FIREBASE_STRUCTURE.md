# 🔥 Firebase Structure - Quick Reference

## 📁 Collections Overview

```
santaspot (Firestore Database)
│
├── users/                          # User profiles
│   └── {uid}/                      # Firebase Auth UID
│       ├── uid: string
│       ├── uuid: string
│       ├── email: string
│       ├── username: string | null
│       ├── referral_code: string
│       ├── earnings: number
│       ├── total_clicks: number
│       ├── total_referrals: number
│       ├── completed_offers: number
│       ├── total_donated: number        ← NEW
│       ├── influence_score: number      ← NEW
│       ├── created_at: Timestamp
│       └── updated_at: Timestamp
│
├── clicks/                         # Click tracking
│   └── {auto-id}/
│       ├── id: string
│       ├── user_uuid: string
│       ├── referral_code: string
│       ├── timestamp: Timestamp
│       └── ip_address?: string
│
├── referrals/                      # Referral relationships
│   └── {auto-id}/
│       ├── id: string
│       ├── referrer_uuid: string
│       ├── referred_uuid: string
│       ├── referral_code_used: string
│       ├── status: 'pending' | 'completed'
│       └── created_at: Timestamp
│
├── donations/                      # Donation records
│   └── {auto-id}/
│       ├── id: string
│       ├── user_uuid: string
│       ├── amount: number
│       ├── currency: string
│       ├── network: string
│       ├── transaction_hash?: string
│       └── created_at: Timestamp
│
└── globals/                        # Global statistics
    └── pot/                        ← NEW COLLECTION
        ├── total_amount: number
        ├── total_donations: number
        ├── total_users: number
        └── updated_at: Timestamp
```

---

## 🔍 Field Explanations

### **users/{uid}**

| Field | Type | Description | Initial Value |
|-------|------|-------------|---------------|
| `uid` | string | Firebase Auth user ID | Auto-generated |
| `uuid` | string | Unique identifier (v4) | Auto-generated |
| `email` | string | User's email address | From signup |
| `username` | string\|null | Display name | null or from Google |
| `referral_code` | string | 8-char unique code | Auto-generated |
| `earnings` | number | Signup + referral bonuses | 100 |
| `total_clicks` | number | Count of link clicks | 0 |
| `total_referrals` | number | Count of referrals | 0 |
| `completed_offers` | number | Count of offers done | 0 |
| `total_donated` | number | Sum of donations | 0 |
| `influence_score` | number | Calculated score | 0 |
| `created_at` | Timestamp | Account creation | Now |
| `updated_at` | Timestamp | Last update | Now |

### **clicks/{auto-id}**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID v4 |
| `user_uuid` | string | Owner of referral link |
| `referral_code` | string | Code that was clicked |
| `timestamp` | Timestamp | When click occurred |
| `ip_address` | string? | Optional IP for dedup |

### **referrals/{auto-id}**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID v4 |
| `referrer_uuid` | string | User who referred |
| `referred_uuid` | string | New user referred |
| `referral_code_used` | string | Code used at signup |
| `status` | string | 'pending' or 'completed' |
| `created_at` | Timestamp | When referral created |

### **donations/{auto-id}**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID v4 |
| `user_uuid` | string | User who donated |
| `amount` | number | Donation amount |
| `currency` | string | USD, ETH, BTC, etc. |
| `network` | string | Stripe, Ethereum, etc. |
| `transaction_hash` | string? | Blockchain tx hash |
| `created_at` | Timestamp | When donation made |

### **globals/pot**

| Field | Type | Description |
|-------|------|-------------|
| `total_amount` | number | Sum of ALL donations |
| `total_donations` | number | Count of donations |
| `total_users` | number | Total registered users |
| `updated_at` | Timestamp | Last update |

---

## 🔢 Influence Score Formula

```typescript
influence_score = (total_donated × 10) + (total_referrals × 5) + (total_clicks × 1)
```

**Weight Distribution:**
- Donations: 10x multiplier (most important)
- Referrals: 5x multiplier (medium importance)
- Clicks: 1x multiplier (least important)

---

## 📊 Example Data

### **User Profile**
```json
{
  "uid": "e3Z7APasxxYajjvniK5eQONOS2K2",
  "uuid": "66852299-04ea-4066-85e2-9405a7c1b9ab",
  "email": "user@example.com",
  "username": "John Doe",
  "referral_code": "AD3E2354",
  "earnings": 150,
  "total_clicks": 25,
  "total_referrals": 1,
  "completed_offers": 0,
  "total_donated": 10,
  "influence_score": 130,
  "created_at": "2024-11-24T19:44:16Z",
  "updated_at": "2024-11-25T10:30:00Z"
}
```

**Calculation:**
- Donated $10 → 10 × 10 = 100 points
- 1 referral → 1 × 5 = 5 points
- 25 clicks → 25 × 1 = 25 points
- **Total: 130 influence score**

### **Click Record**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_uuid": "66852299-04ea-4066-85e2-9405a7c1b9ab",
  "referral_code": "AD3E2354",
  "timestamp": "2024-11-25T10:15:30Z",
  "ip_address": "192.168.1.1"
}
```

### **Referral Record**
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "referrer_uuid": "66852299-04ea-4066-85e2-9405a7c1b9ab",
  "referred_uuid": "77963300-15fb-5177-96f3-a516b8c2c0bc",
  "referral_code_used": "AD3E2354",
  "status": "completed",
  "created_at": "2024-11-25T11:00:00Z"
}
```

### **Donation Record**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "user_uuid": "66852299-04ea-4066-85e2-9405a7c1b9ab",
  "amount": 10,
  "currency": "USD",
  "network": "Stripe",
  "transaction_hash": null,
  "created_at": "2024-11-25T12:00:00Z"
}
```

### **Global Pot**
```json
{
  "total_amount": 1250.50,
  "total_donations": 87,
  "total_users": 234,
  "updated_at": "2024-11-25T12:00:00Z"
}
```

---

## 🔄 Update Triggers

### **When User Signs Up:**
- ✅ Create user document
- ✅ Increment globals/pot → total_users
- ✅ If referral code exists → create referral record

### **When Referral Link Clicked:**
- ✅ Create click document
- ✅ Update user → total_clicks
- ✅ Update user → influence_score

### **When User Donates:**
- ✅ Create donation document
- ✅ Update user → total_donated
- ✅ Update user → influence_score
- ✅ Update globals/pot → total_amount
- ✅ Update globals/pot → total_donations

### **When Referral Completes:**
- ✅ Create referral document
- ✅ Update referrer → total_referrals
- ✅ Update referrer → earnings (+$50)
- ✅ Update referrer → influence_score

---

## 🔐 Security Rules Template

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Anyone can read global pot
    match /globals/pot {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Authenticated users can read/write clicks
    match /clicks/{clickId} {
      allow read, write: if request.auth != null;
    }
    
    // Authenticated users can read/write referrals
    match /referrals/{referralId} {
      allow read, write: if request.auth != null;
    }
    
    // Authenticated users can read/write donations
    match /donations/{donationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📈 Queries You Can Run

### **Get User's Total Clicks**
```typescript
const q = query(
  collection(db, 'clicks'), 
  where('user_uuid', '==', userUUID)
);
const snapshot = await getDocs(q);
const clickCount = snapshot.size;
```

### **Get User's Referrals**
```typescript
const q = query(
  collection(db, 'referrals'), 
  where('referrer_uuid', '==', userUUID)
);
const snapshot = await getDocs(q);
const referrals = snapshot.docs.map(doc => doc.data());
```

### **Get User's Donations**
```typescript
const q = query(
  collection(db, 'donations'), 
  where('user_uuid', '==', userUUID)
);
const snapshot = await getDocs(q);
const donations = snapshot.docs.map(doc => doc.data());
```

### **Get Global Pot**
```typescript
const potSnap = await getDoc(doc(db, 'globals', 'pot'));
const pot = potSnap.data();
```

---

## 🎯 Key Relationships

```
User (uuid) ←→ Clicks (user_uuid)
User (uuid) ←→ Donations (user_uuid)
User (uuid) ←→ Referrals (referrer_uuid)
User (uuid) ←→ Referrals (referred_uuid)
User (referral_code) ←→ Clicks (referral_code)
User (referral_code) ←→ Referrals (referral_code_used)
```

---

## 💡 Tips

1. **Always use uuid, not uid** for relationships between collections
2. **uid** is for Firebase Auth, **uuid** is for app logic
3. **Real-time listeners** available for users, clicks, referrals, and globals/pot
4. **Influence score** auto-updates on any activity
5. **Global pot** updates immediately when anyone donates
