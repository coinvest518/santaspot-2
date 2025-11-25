# Firebase Implementation Checklist

## Pre-Implementation
- [ ] Review FIREBASE_REDESIGN_SUMMARY.md
- [ ] Review IMPLEMENTATION_GUIDE.md
- [ ] Have Firebase project credentials ready
- [ ] Backup current Supabase data (if needed)

## Phase 1: Setup (1-2 hours)

### Dependencies
- [ ] Run `npm install firebase`
- [ ] Verify firebase package in package.json

### Environment Configuration
- [ ] Create `.env.local` file
- [ ] Copy Firebase credentials from Firebase Console
- [ ] Add all 7 Firebase environment variables
- [ ] Verify .env.local is in .gitignore
- [ ] Restart dev server

### Firebase Console Setup
- [ ] Go to Firebase Console
- [ ] Select santaspot-d86b8 project
- [ ] Create Firestore database (if not exists)
- [ ] Create collections:
  - [ ] users
  - [ ] clicks
  - [ ] referrals
  - [ ] donations
- [ ] Set Firestore security rules (copy from FIREBASE_MIGRATION.md)
- [ ] Enable Email/Password authentication

## Phase 2: Code Integration (2-3 hours)

### Core Files
- [ ] Verify `src/lib/firebase.ts` exists
- [ ] Verify `src/context/FirebaseUserContext.tsx` exists
- [ ] Verify `src/context/FirebaseUserProvider.tsx` exists
- [ ] Verify `src/hooks/useFirebaseUser.ts` exists
- [ ] Verify `src/components/FirebaseAuthForm.tsx` exists
- [ ] Verify `src/pages/FirebaseDashboard.tsx` exists

### App.tsx Updates
- [ ] Import FirebaseUserProvider
- [ ] Replace UserProvider with FirebaseUserProvider
- [ ] Remove old Supabase UserProvider import
- [ ] Test app starts without errors

### Landing Page
- [ ] Update to use FirebaseAuthForm instead of authForm
- [ ] Test signup form
- [ ] Test login form
- [ ] Verify error messages display

### Dashboard Page
- [ ] Update to use FirebaseDashboard
- [ ] Or update existing Dashboard.tsx to use useFirebaseUser
- [ ] Test dashboard loads
- [ ] Verify user stats display
- [ ] Test referral link copy
- [ ] Test donation history

### Referrals Page
- [ ] Update imports to use Firebase functions
- [ ] Replace getReferrals() calls
- [ ] Replace getClickCount() calls
- [ ] Test referral page loads
- [ ] Test referral stats display

### Other Pages
- [ ] Update Payments page (if uses user data)
- [ ] Update Withdraw page (if uses user data)
- [ ] Update Offers page (if uses user data)
- [ ] Update any other pages using user context

## Phase 3: Testing (1-2 hours)

### Authentication Flow
- [ ] Test signup with new email
  - [ ] User created in Firebase Auth
  - [ ] User profile created in Firestore
  - [ ] UUID generated
  - [ ] Referral code generated
  - [ ] Redirected to dashboard
- [ ] Test login with existing email
  - [ ] User logged in
  - [ ] Profile loaded
  - [ ] Redirected to dashboard
- [ ] Test logout
  - [ ] User logged out
  - [ ] Redirected to landing page
- [ ] Test invalid credentials
  - [ ] Error message displayed
  - [ ] User not logged in

### Click Tracking
- [ ] Copy referral link
  - [ ] Link copied to clipboard
  - [ ] Click recorded in Firestore
  - [ ] total_clicks incremented
- [ ] Verify click appears in dashboard
- [ ] Verify click count updates

### Referral Creation
- [ ] Sign up with referral code
  - [ ] Referral record created
  - [ ] Referrer's earnings increased by $50
  - [ ] Referrer's total_referrals incremented
- [ ] Verify referral appears in referrals page
- [ ] Verify referral count updates

### Donation Recording
- [ ] Record test donation
  - [ ] Donation record created in Firestore
  - [ ] Amount, currency, network saved
  - [ ] Timestamp recorded
- [ ] Verify donation appears in dashboard
- [ ] Verify donation history displays

### Data Persistence
- [ ] Refresh page - user still logged in
- [ ] Close and reopen browser - user still logged in
- [ ] Check Firestore - all data persisted

### Error Handling
- [ ] Test with invalid email format
- [ ] Test with weak password
- [ ] Test with network error
- [ ] Verify error messages are helpful

## Phase 4: Performance & Security (30 mins)

### Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] No console errors
- [ ] No memory leaks
- [ ] Referral page loads quickly

### Security
- [ ] Verify Firestore rules are set
- [ ] Test user can't access other user's data
- [ ] Test unauthenticated user can't access protected pages
- [ ] Verify no sensitive data in localStorage

### Firestore Indexes
- [ ] Create index for clicks (user_uuid, timestamp)
- [ ] Create index for referrals (referrer_uuid, created_at)
- [ ] Create index for donations (user_uuid, created_at)

## Phase 5: Deployment (30 mins)

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] Code reviewed
- [ ] .env.local not committed

### Build
- [ ] Run `npm run build`
- [ ] Build completes without errors
- [ ] Build size reasonable

### Deployment
- [ ] Deploy to staging environment
- [ ] Test all flows in staging
- [ ] Deploy to production
- [ ] Monitor for errors

### Post-Deployment
- [ ] Verify signup works
- [ ] Verify login works
- [ ] Verify dashboard loads
- [ ] Verify referral tracking works
- [ ] Monitor Firestore usage
- [ ] Monitor Firebase Auth usage

## Phase 6: Cleanup (Optional)

### Remove Old Code
- [ ] Remove old Supabase imports (if not needed)
- [ ] Remove old UserProvider (if not needed)
- [ ] Remove old useUser hook (if not needed)
- [ ] Remove old authForm component (if not needed)
- [ ] Update imports in all files

### Documentation
- [ ] Update README.md with Firebase info
- [ ] Update API documentation
- [ ] Add Firebase setup to onboarding docs

## Verification Checklist

### User Data
- [ ] User profile has all required fields
- [ ] UUID is unique for each user
- [ ] Referral code is 8 characters
- [ ] Earnings calculated correctly
- [ ] Timestamps are accurate

### Click Data
- [ ] Click records created on link copy
- [ ] user_uuid matches user profile
- [ ] referral_code matches
- [ ] Timestamp is current
- [ ] total_clicks incremented

### Referral Data
- [ ] Referral records created on signup
- [ ] referrer_uuid matches referrer
- [ ] referred_uuid matches new user
- [ ] referral_code_used matches
- [ ] Status is 'completed'
- [ ] Referrer earnings increased
- [ ] Referrer total_referrals incremented

### Donation Data
- [ ] Donation records created
- [ ] user_uuid matches user
- [ ] Amount, currency, network saved
- [ ] Transaction hash saved (if provided)
- [ ] Timestamp is current

## Rollback Plan

If issues occur:
1. [ ] Revert to previous version
2. [ ] Keep Firestore data (for analysis)
3. [ ] Investigate issue
4. [ ] Fix and redeploy

## Success Criteria

✅ All tests passing
✅ No console errors
✅ All features working
✅ Data persisting correctly
✅ Performance acceptable
✅ Security rules in place
✅ Users can signup/login
✅ Referral tracking working
✅ Click tracking working
✅ Donation recording working

## Notes

- Keep this checklist updated as you progress
- Mark items as complete with [x]
- Note any issues encountered
- Document any customizations made
- Share progress with team

## Support

- Firebase Docs: https://firebase.google.com/docs
- Firestore Docs: https://firebase.google.com/docs/firestore
- Implementation Guide: IMPLEMENTATION_GUIDE.md
- Migration Guide: FIREBASE_MIGRATION.md
- Quick Start: QUICK_START.md
