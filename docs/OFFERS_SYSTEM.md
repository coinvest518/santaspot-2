# 🎁 Santa'sPot Offers System

## 📊 Overview

The offers system allows users to earn rewards by completing tasks like donations and website visits. Each offer can only be completed once per user, and completions are tracked in Firebase.

---

## 🎯 Current Offers

### **Donation Offers (High Reward)**

1. **Support Strong Offspring Initiative**
   - Link: https://www.zeffy.com/en-US/donation-form/the-strong-offspring-initiative
   - Reward: $5.00
   - Time: 3 mins
   - Requirements: Make any donation amount

2. **Support Real Estate & Land Investing**
   - Link: https://www.zeffy.com/en-US/donation-form/real-estate-and-land-investing
   - Reward: $5.00
   - Time: 3 mins
   - Requirements: Make any donation amount

### **Website Visit Offers (Quick Rewards)**

3. **Visit DisputeAI**
   - Link: https://disputeai.xyz
   - Reward: $0.50
   - Time: 2 mins

4. **Visit ConsumerAI**
   - Link: https://consumerai.info
   - Reward: $0.75
   - Time: 2 mins

5. **Visit Fortis Proles**
   - Link: https://fortisproles.com
   - Reward: $1.00
   - Time: 2 mins

6. **Visit FDWA**
   - Link: https://fdwa.site
   - Reward: $0.60
   - Time: 2 mins

7. **Support Safe Delivery Project**
   - Link: https://chuffed.org/project/158912-the-safe-delivery-project
   - Reward: $1.25
   - Time: 3 mins

**Total Possible Earnings: $14.10**

---

## 🔄 How It Works

### **User Flow:**

1. **Browse Offers**
   - User sees all available offers on Offers page
   - Completed offers show green "✓ Completed" button
   - Uncompleted offers show "Start Offer" and "Mark Complete" buttons

2. **Start Offer**
   - User clicks "Start Offer"
   - External link opens in new tab
   - Toast notification: "Opening [offer]. Click 'Mark as Complete' when done!"

3. **Complete Task**
   - User completes the task (donation/visit)
   - Returns to Santa'sPot

4. **Mark Complete**
   - User clicks "Mark Complete"
   - System records completion in Firebase
   - User's earnings updated (+reward amount)
   - User's completed_offers count incremented
   - Toast notification: "Earned $X.XX! 🎉"
   - Button changes to "✓ Completed"

### **Prevention System:**

- ✅ Each offer can only be completed once per user
- ✅ Completed offers stored in `offer_completions` collection
- ✅ Real-time sync prevents duplicate completions
- ✅ UI shows completed status immediately
- ✅ "Mark Complete" button disabled after completion

---

## 🔥 Firebase Structure

### **Collection: offer_completions**

```
offer_completions/{auto-id}
├── id: string                    // UUID v4
├── user_uuid: string             // User who completed
├── offer_id: string              // Offer identifier
├── reward: number                // Amount earned
└── completed_at: Timestamp       // When completed
```

### **Example Document:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_uuid": "66852299-04ea-4066-85e2-9405a7c1b9ab",
  "offer_id": "donate-strong-offspring",
  "reward": 5.0,
  "completed_at": "2024-11-25T15:30:00Z"
}
```

---

## 📈 Tracking & Updates

### **When User Completes Offer:**

1. **offer_completions collection**
   - New document created
   - Links user_uuid to offer_id

2. **users/{uid} document**
   - `earnings` increased by reward amount
   - `completed_offers` count incremented
   - `updated_at` timestamp updated

3. **Dashboard Updates**
   - Total Earnings card updates
   - Completed Offers stat updates
   - All changes happen in real-time

### **Real-Time Sync:**

```typescript
// Subscribe to user's completed offers
subscribeToOfferCompletions(userUUID, (completedIds) => {
  // UI updates automatically
  // Completed offers show green button
  // Prevents duplicate completions
});
```

---

## 🎨 UI States

### **Offer Card States:**

1. **Available (Not Started)**
   ```
   [Start Offer] [Mark Complete]
   ```

2. **Processing (Link Opening)**
   ```
   [Opening...] [Mark Complete]
   ```

3. **Completed**
   ```
   [✓ Completed] (disabled, green)
   ```

### **Visual Indicators:**

- **Available**: Purple buttons
- **Completed**: Green button with checkmark
- **Disabled**: Grayed out, not clickable

---

## 🔐 Security & Validation

### **Client-Side Checks:**

```typescript
// Before starting offer
if (!firebaseUser) {
  toast.error("Please sign in to start offers");
  return;
}

// Before marking complete
if (completedOffers.includes(offer.id)) {
  toast.error("You've already completed this offer!");
  return;
}
```

### **Firebase Queries:**

```typescript
// Check if user completed specific offer
const hasCompleted = await hasCompletedOffer(userUUID, offerId);

// Get all completed offers for user
const completedIds = await getUserCompletedOffers(userUUID);
```

### **Firestore Rules Needed:**

```javascript
// Allow users to read their own completions
match /offer_completions/{completionId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null 
    && request.resource.data.user_uuid == request.auth.uid;
  allow update, delete: if false;
}
```

---

## 💰 Earnings Breakdown

### **Example User Journey:**

**Starting Balance:** $100 (signup bonus)

1. Complete "Visit DisputeAI" → +$0.50 = $100.50
2. Complete "Visit ConsumerAI" → +$0.75 = $101.25
3. Complete "Visit Fortis Proles" → +$1.00 = $102.25
4. Complete "Support Strong Offspring" → +$5.00 = $107.25
5. Complete all remaining offers → +$6.85 = $114.10

**Final Balance:** $114.10

**Completed Offers:** 7

---

## 🚀 Functions Reference

### **firebase.ts Functions:**

```typescript
// Complete an offer
completeOffer(userUUID, offerId, reward)
  → Creates completion record
  → Updates user earnings
  → Updates completed_offers count

// Get user's completed offers
getUserCompletedOffers(userUUID)
  → Returns array of offer IDs

// Check if specific offer completed
hasCompletedOffer(userUUID, offerId)
  → Returns boolean

// Subscribe to completions (real-time)
subscribeToOfferCompletions(userUUID, callback)
  → Calls callback with updated offer IDs
  → Unsubscribe when component unmounts
```

---

## 📊 Offer Categories

### **Current Categories:**

- **tasks** - All current offers (donations + visits)
- **games** - Placeholder for future game offers
- **surveys** - Placeholder for future survey offers

### **Filter System:**

Users can filter by:
- All (default)
- Games
- Surveys
- Tasks

Search functionality searches:
- Offer title
- Offer description

---

## 🎯 Best Practices

### **For Users:**

1. Click "Start Offer" to open link
2. Complete the task on external site
3. Return to Santa'sPot
4. Click "Mark Complete" to claim reward
5. Each offer can only be completed once

### **For Developers:**

1. Always check if user is authenticated
2. Always check if offer already completed
3. Use real-time subscriptions for completions
4. Update UI immediately on completion
5. Show clear visual feedback (toasts, button states)

---

## 🔄 Adding New Offers

### **Template:**

```typescript
{
  id: 'unique-offer-id',
  title: 'Offer Title',
  description: 'Brief description of what to do',
  category: 'tasks', // or 'games', 'surveys'
  image_file: '/images/try2.png',
  reward: 1.50, // Dollar amount
  is_active: true,
  estimated_time: '5 mins',
  link: 'https://external-site.com',
  created_at: new Date().toISOString(),
  requirements: ['Requirement 1', 'Requirement 2']
}
```

### **Steps:**

1. Add offer to `sampleOffers` array in Offers.tsx
2. Ensure unique `id` (use kebab-case)
3. Set appropriate `reward` amount
4. Set realistic `estimated_time`
5. Add valid external `link`
6. Test completion flow

---

## 📝 Summary

**Offers System Features:**
- ✅ Real external links (donations + websites)
- ✅ One-time completion per user
- ✅ Real-time tracking with Firebase
- ✅ Automatic earnings updates
- ✅ Visual completion indicators
- ✅ Duplicate prevention
- ✅ User-friendly UI with clear states

**Total Rewards Available:** $14.10

**User Experience:**
1. Browse offers
2. Start offer (opens link)
3. Complete task
4. Mark complete
5. Earn reward instantly
6. See updated earnings
