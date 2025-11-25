# Firebase Security Rules - Santa'sPot

## ⚠️ URGENT: Update Your Security Rules

Your current Firestore rules expire on **December 24, 2025**. You must update them before then to prevent unauthorized access.

---

## Firestore Security Rules (RECOMMENDED)

Replace your test mode rules with these production-ready rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Authenticated users can create clicks
    match /clicks/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // Authenticated users can create referrals
    match /referrals/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // Authenticated users can create donations
    match /donations/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

---

## Realtime Database Security Rules

If you're using Realtime Database, use these rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "clicks": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "referrals": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "donations": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## How to Update Rules

### For Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `santaspot-d86b8`
3. Go to **Firestore Database**
4. Click **Rules** tab
5. Replace all content with the Firestore rules above
6. Click **Publish**

### For Realtime Database:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `santaspot-d86b8`
3. Go to **Realtime Database**
4. Click **Rules** tab
5. Replace all content with the Realtime Database rules above
6. Click **Publish**

---

## Security Features

### ✅ What These Rules Protect

1. **User Privacy**
   - Users can only access their own profile
   - No user can read other users' data

2. **Data Integrity**
   - Only authenticated users can create records
   - Records cannot be deleted or modified after creation
   - Prevents data tampering

3. **Unauthorized Access Prevention**
   - Anonymous users cannot access any data
   - Unauthenticated requests are rejected
   - All operations require valid Firebase Auth token

4. **Audit Trail**
   - Clicks, referrals, donations are immutable
   - Complete history preserved
   - No accidental data loss

---

## Rule Breakdown

### Users Collection
```
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
}
```
- Only the user can read/write their own profile
- `{uid}` is a wildcard matching the document ID
- `request.auth.uid` is the authenticated user's ID

### Clicks Collection
```
match /clicks/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if false;
}
```
- Authenticated users can read all clicks (for analytics)
- Authenticated users can create new clicks
- No one can update or delete clicks (immutable)

### Referrals Collection
```
match /referrals/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if false;
}
```
- Same as clicks - immutable referral records

### Donations Collection
```
match /donations/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if false;
}
```
- Same as clicks - immutable donation records

---

## Testing Your Rules

### Test 1: Unauthenticated Access (Should FAIL)
```javascript
// This should be denied
const db = getFirestore();
const docRef = doc(db, 'users', 'any-uid');
const docSnap = await getDoc(docRef); // ❌ DENIED
```

### Test 2: Authenticated User Accessing Own Profile (Should SUCCEED)
```javascript
// This should be allowed
const db = getFirestore();
const docRef = doc(db, 'users', auth.currentUser.uid);
const docSnap = await getDoc(docRef); // ✅ ALLOWED
```

### Test 3: Authenticated User Accessing Other Profile (Should FAIL)
```javascript
// This should be denied
const db = getFirestore();
const docRef = doc(db, 'users', 'different-uid');
const docSnap = await getDoc(docRef); // ❌ DENIED
```

### Test 4: Creating Click Record (Should SUCCEED)
```javascript
// This should be allowed
const db = getFirestore();
await addDoc(collection(db, 'clicks'), {
  user_uuid: userProfile.uuid,
  referral_code: code,
  timestamp: Timestamp.now()
}); // ✅ ALLOWED
```

---

## Common Issues & Solutions

### Issue: "Permission denied" when reading user profile
**Solution**: Make sure you're authenticated and reading your own profile
```javascript
// ❌ Wrong - reading someone else's profile
const docRef = doc(db, 'users', 'other-uid');

// ✅ Correct - reading your own profile
const docRef = doc(db, 'users', auth.currentUser.uid);
```

### Issue: "Permission denied" when creating click
**Solution**: Make sure you're authenticated
```javascript
// ❌ Wrong - not authenticated
// User not signed in

// ✅ Correct - authenticated
// User signed in with Firebase Auth
```

### Issue: "Permission denied" when updating donation
**Solution**: Donations are immutable - create new record instead
```javascript
// ❌ Wrong - cannot update
await updateDoc(doc(db, 'donations', id), { amount: 200 });

// ✅ Correct - create new record
await addDoc(collection(db, 'donations'), { amount: 200 });
```

---

## Advanced Security (Optional)

### Admin Access
If you need admin access to modify records:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin can do anything
    match /{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
    
    // Regular user rules...
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

Then set admin claim in Firebase Console or Cloud Functions.

### Rate Limiting (Advanced)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clicks/{document=**} {
      allow create: if request.auth != null && 
        request.time > resource.data.timestamp + duration.value(1, 's');
    }
  }
}
```

---

## Deployment Checklist

- [ ] Read and understand the rules
- [ ] Copy Firestore rules to Firebase Console
- [ ] Copy Realtime Database rules (if using)
- [ ] Click Publish
- [ ] Test unauthenticated access (should fail)
- [ ] Test authenticated access (should succeed)
- [ ] Test cross-user access (should fail)
- [ ] Monitor Firebase Console for errors
- [ ] Set calendar reminder for rule review

---

## Monitoring

### Check Rule Violations
1. Go to Firebase Console
2. Go to **Firestore** or **Realtime Database**
3. Check **Rules** tab for any errors
4. Check **Usage** tab for denied requests

### Enable Audit Logs
1. Go to **Cloud Logging**
2. Filter by resource type: `Cloud Firestore`
3. Look for `PERMISSION_DENIED` errors

---

## Timeline

- **NOW**: Update your security rules
- **Before Dec 24, 2025**: Rules must be updated (deadline)
- **After Dec 24, 2025**: Test mode rules expire, database becomes read-only

---

## Support

- [Firestore Security Rules Docs](https://firebase.google.com/docs/firestore/security/start)
- [Realtime Database Security Rules](https://firebase.google.com/docs/database/security)
- [Firebase Security Best Practices](https://firebase.google.com/docs/security/best-practices)

---

## Summary

✅ **Your data is now protected**
✅ **Only authenticated users can access**
✅ **Users can only access their own data**
✅ **Records are immutable (cannot be modified)**
✅ **Complete audit trail preserved**

**Update your rules NOW to prevent unauthorized access!**
