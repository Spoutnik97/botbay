# Quick Guide: Create Stripe Products

## ✅ Good News: You Don't Need Price IDs Anymore!

With the server-side checkout flow, your backend API (`/api/purchase`) creates the Stripe checkout sessions dynamically. You **don't need** to create products in Stripe Dashboard or update Price IDs in your code!

## How It Works Now

1. **Frontend** (`js/checkout.js`):
   - User clicks "Buy Now" button
   - Calls `/api/purchase` with `product_id`

2. **Backend** (`api/purchase.js`):
   - Creates Stripe checkout session on-the-fly
   - Defines product name, price, and description dynamically
   - Returns checkout URL to frontend

3. **Frontend redirects to Stripe**:
   - User completes payment
   - Redirects back to your success page

## What You Need to Do

### 1. ✅ Enable Stripe Checkout Settings (Fix the error)

The error you got was:
```
The Checkout client-only integration is not enabled
```

**Fix**:
1. Go to: https://dashboard.stripe.com/settings/checkout
2. **Enable** the Checkout integration
3. Save changes

**Note**: This might already be enabled by default. If you don't see this setting, you're good to go!

### 2. ✅ Verify Your Stripe Secret Key in Vercel

Make sure you've added your Stripe secret key as an environment variable:

**Via Vercel Dashboard**:
1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
2. Should see: `STRIPE_SECRET_KEY` = `sk_test_...`
3. If not, add it and redeploy

**Via Vercel CLI**:
```bash
vercel env ls
# Should show STRIPE_SECRET_KEY

# If not, add it:
vercel env add STRIPE_SECRET_KEY production
# Enter your sk_test_... key
```

### 3. ✅ Test Your Setup

```bash
# Test the purchase API
curl -X POST https://botbay.vercel.app/api/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "communication-101",
    "payment_method": "stripe",
    "email": "test@example.com"
  }'
```

**Expected response**:
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "product_name": "Communication 101",
  "amount_usd": 5,
  ...
}
```

### 4. ✅ Test Full Checkout Flow

1. Visit: https://botbay.vercel.app
2. Click "Buy Now" on Communication 101
3. Should redirect to Stripe Checkout
4. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. Complete payment
6. Should redirect to success page

## Optional: Create Actual Products in Stripe Dashboard

If you want products to show up in your Stripe Dashboard for better tracking and reporting:

### Why Create Products?
- Better organization in Stripe Dashboard
- Easier to see sales by product
- Can add product images and metadata
- Better for reports and analytics

### How to Create Products (Optional)

1. **Go to**: https://dashboard.stripe.com/test/products
2. **Click**: "Add product"
3. **For each product**:

#### Product 1: Communication 101
- **Name**: Communication 101
- **Description**: Professional communication templates for AI assistants
- **Pricing**: One-time payment
- **Price**: $5.00 USD
- **Save product**

#### Product 2: Productivity Pro
- **Name**: Productivity Pro
- **Description**: Advanced task management and productivity skills
- **Price**: $19.00 USD

#### Product 3: Research Assistant
- **Name**: Research Assistant
- **Description**: Professional research and fact-checking capabilities
- **Price**: $29.00 USD

#### Product 4: Memory Vault Pro
- **Name**: Memory Vault Pro
- **Description**: Advanced memory optimization with knowledge graphs
- **Price**: $49.00 USD

#### Product 5: Integration Suite
- **Name**: Integration Suite
- **Description**: 50+ service integrations including Gmail, Slack, Notion
- **Price**: $79.00 USD

#### Product 6: Complete Bot Bundle
- **Name**: Complete Bot Bundle
- **Description**: All BotBay skills + lifetime updates
- **Price**: $149.00 USD

**Note**: You do NOT need to update any Price IDs in your code after creating these. The server-side flow creates checkout sessions dynamically.

## Troubleshooting

### Error: "The Checkout client-only integration is not enabled"

**Solution**: This error is now **irrelevant** because we switched to server-side checkout. The frontend doesn't use Stripe.js anymore - it calls your backend API instead.

If you still see this error:
1. Clear browser cache
2. Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify you've pushed the latest `js/checkout.js` changes

### Error: "No such price"

**Solution**: This error is also now **irrelevant**. The server creates checkout sessions dynamically without needing pre-created Price IDs.

### Error: "Payment system not configured"

**Solution**: Add `STRIPE_SECRET_KEY` to Vercel environment variables
```bash
# Check if it exists
vercel env ls

# Add if missing
vercel env add STRIPE_SECRET_KEY production
```

## Summary

### ✅ What Changed

**Before** (Client-side flow):
- Required creating products in Stripe Dashboard
- Required copying Price IDs to `js/checkout.js`
- Required enabling Checkout settings
- Required Stripe.js library

**After** (Server-side flow):
- ✅ No need to create products (optional for reporting only)
- ✅ No need to update Price IDs in code
- ✅ No need for Stripe.js library
- ✅ More secure (secret key stays on server)
- ✅ Easier to maintain (prices defined in one place: `api/purchase.js`)

### What You Need

1. ✅ Stripe account with test keys
2. ✅ `STRIPE_SECRET_KEY` in Vercel environment variables
3. ✅ Latest code deployed (with updated `js/checkout.js`)
4. ✅ That's it!

## Next Steps

1. **Commit and push** the latest changes:
   ```bash
   git add .
   git commit -m "Switch to server-side Stripe checkout"
   git push origin main
   ```

2. **Verify environment variable** in Vercel

3. **Test the checkout flow** at: https://botbay.vercel.app

---

**Status**: Server-side checkout implemented ✅ | No Price IDs needed ✅
