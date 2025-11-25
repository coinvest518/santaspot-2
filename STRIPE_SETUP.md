# 🎅 Santa's Pot - Stripe Payment Integration

## Quick Setup Guide

### 1. Environment Variables
Update your `.env` file with your Stripe keys:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your **Publishable key** and **Secret key**
4. For webhooks, go to **Developers > Webhooks**
5. Create a new webhook endpoint: `https://yourdomain.com/api/webhook`
6. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
7. Copy the webhook signing secret

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/payments`
3. Enter a test amount (minimum $1.00)
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future date for expiry, any 3-digit CVC

### 4. Features Included

✅ **Secure Payment Processing** - Server-side payment intent creation
✅ **Minimum Donation** - $1.00 minimum with validation
✅ **Payment Confirmation** - Success/failure handling with redirects
✅ **Christmas Theming** - Festive UI with Santa's Pot branding
✅ **Firebase Integration** - Donation tracking in Firestore
✅ **Webhook Support** - Automatic payment status updates
✅ **Error Handling** - Comprehensive error messages and retry options

### 5. File Structure

```
api/
├── create-payment-intent.js  # Vercel serverless function
└── webhook.js                # Stripe webhook handler

src/
├── components/
│   ├── PaymentForm.tsx       # Stripe Elements payment form
│   └── DonationStats.tsx     # Dashboard statistics
├── pages/
│   ├── Payments.tsx          # Main donation page
│   └── PaymentCompletion.tsx # Success/failure page
└── lib/
    └── donations.ts          # Firebase donation tracking
```

### 6. Going Live

1. Replace test keys with live keys in production
2. Update webhook endpoint to production URL
3. Test with real payment methods
4. Monitor webhook events in Stripe Dashboard

### 7. Security Notes

- ✅ API keys are server-side only
- ✅ Payment intents created securely
- ✅ Webhook signature verification
- ✅ No sensitive data in client code
- ✅ Minimum amount validation

## Support

For issues with Stripe integration, check:
1. Stripe Dashboard logs
2. Browser console for client errors
3. Vercel function logs for server errors
4. Firebase console for database issues

Happy holidays! 🎄