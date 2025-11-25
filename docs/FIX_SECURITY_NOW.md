# 🔒 Fix Security in 2 Minutes

## The Problem
Your Firebase rules have errors because of markdown formatting. You need to paste **raw rules only**.

## The Solution

### Step 1: Open the Clean Rules File
Open: `FIRESTORE_RULES_CLEAN.txt`

### Step 2: Copy ALL Content
Select all text and copy (Ctrl+A, Ctrl+C)

### Step 3: Go to Firebase Console
1. Open https://console.firebase.google.com
2. Select project: `santaspot-d86b8`
3. Go to **Firestore Database**
4. Click **Rules** tab

### Step 4: Clear Existing Rules
- Select all text in the editor (Ctrl+A)
- Delete it

### Step 5: Paste New Rules
- Paste the clean rules (Ctrl+V)
- You should see NO errors

### Step 6: Publish
- Click **Publish** button
- Wait for confirmation

**Done! Your database is now secure.**

---

## What You're Pasting

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    match /clicks/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    match /referrals/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    match /donations/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

---

## Verification

After publishing, test:

1. **Unauthenticated access** - Should be DENIED
2. **Authenticated access to own profile** - Should be ALLOWED
3. **Authenticated access to other profile** - Should be DENIED
4. **Creating click record** - Should be ALLOWED

---

## If You Get Errors

**Error**: "Unexpected token"
- Solution: Make sure you copied from `FIRESTORE_RULES_CLEAN.txt` (not the markdown file)

**Error**: "Line X: token recognition error"
- Solution: Clear everything and paste again from `FIRESTORE_RULES_CLEAN.txt`

**Error**: "Unexpected '--'"
- Solution: You copied markdown. Use `FIRESTORE_RULES_CLEAN.txt` instead

---

## Files to Use

✅ **FIRESTORE_RULES_CLEAN.txt** - Use this for copy-paste
❌ **FIREBASE_SECURITY_RULES.md** - Don't use this (has markdown)

---

## Timeline

- **NOW**: Update rules (2 minutes)
- **Dec 24, 2025**: Deadline
- **After Dec 24**: Database becomes read-only

**Do it now!**
