# Stripe Setup Guide for BotBay

This guide will help you set up Stripe payments for BotBay and deploy to Vercel.

## Prerequisites

- A Stripe account ([sign up at stripe.com](https://dashboard.stripe.com/register))
- A Vercel account ([sign up at vercel.com](https://vercel.com/signup))
- Your BotBay repository

## Step 1: Set Up Stripe Account

### 1.1 Create Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your email
3. Verify your email address
4. Complete business information (you can use test mode first)

### 1.2 Get Your API Keys
1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to use in frontend
   - **Secret key** (starts with `sk_test_...`) - MUST be kept secret

### 1.3 Create Products in Stripe

For each product, create it in Stripe Dashboard:

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click "Add product"
3. Create these products:

#### Product 1: Communication 101
- Name: `Communication 101`
- Description: `Professional communication templates for AI assistants`
- Price: `$5.00 USD` (One-time payment)
- Click "Save product"
- **Copy the Price ID** (starts with `price_...`)

#### Product 2: Productivity Pro
- Name: `Productivity Pro`
- Description: `Advanced task management and productivity skills`
- Price: `$19.00 USD` (One-time payment)
- Click "Save product"
- **Copy the Price ID**

#### Product 3: Research Assistant
- Name: `Research Assistant`
- Description: `Professional research and fact-checking capabilities`
- Price: `$29.00 USD` (One-time payment)
- Click "Save product"
- **Copy the Price ID**

#### Product 4: Memory Vault Pro
- Name: `Memory Vault Pro`
- Description: `Advanced memory optimization with knowledge graphs`
- Price: `$49.00 USD` (One-time payment)
- Click "Save product"
- **Copy the Price ID**

#### Product 5: Integration Suite
- Name: `Integration Suite`
- Description: `50+ service integrations including Gmail, Slack, Notion`
- Price: `$79.00 USD` (One-time payment)
- Click "Save product"
- **Copy the Price ID**

#### Product 6: Complete Bot Bundle
- Name: `Complete Bot Bundle`
- Description: `All BotBay skills + lifetime updates`
- Price: `$149.00 USD` (One-time payment)
- Click "Save product"
- **Copy the Price ID**

## Step 2: Update Your Code

### 2.1 Update Frontend Price IDs (js/checkout.js)

Replace the `priceId` values in `js/checkout.js` with your actual Stripe Price IDs:

```javascript
const PRODUCTS = {
  "communication-101": {
    name: "Communication 101",
    priceId: "price_YOUR_ACTUAL_PRICE_ID_HERE",  // ← Update this
    productId: "prod_TuhPRvbi1NFVIu",
    price: 500,
  },
  // ... update all products
};
```

### 2.2 Update Publishable Key (js/checkout.js)

Replace the `STRIPE_PUBLISHABLE_KEY` at the top of `js/checkout.js`:

```javascript
const STRIPE_PUBLISHABLE_KEY = "pk_test_YOUR_ACTUAL_KEY_HERE";
```

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 3.2 Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [https://vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Other**
   - Build Command: Leave empty
   - Output Directory: `.` (current directory)

### 3.3 Set Environment Variables in Vercel

**CRITICAL**: Add your Stripe Secret Key as an environment variable:

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add the following variable:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_test_...` (your Stripe Secret Key)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### 3.4 Redeploy

After adding environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click the three dots on the latest deployment
- Select **Redeploy**

## Step 4: Test Your Setup

### 4.1 Test the Catalog API
```bash
curl https://your-project.vercel.app/api/catalog
```

You should see a JSON response with all products.

### 4.2 Test the Purchase API
```bash
curl -X POST https://your-project.vercel.app/api/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "communication-101",
    "payment_method": "stripe",
    "email": "test@example.com"
  }'
```

You should receive a response with a `checkout_url`.

### 4.3 Test Stripe Checkout Flow

1. Visit your website: `https://your-project.vercel.app`
2. Click a "Buy Now" button
3. You should be redirected to Stripe Checkout
4. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

## Step 5: Go Live (Production)

### 5.1 Activate Your Stripe Account

1. Complete business verification in Stripe Dashboard
2. Add bank account for payouts
3. Activate your account

### 5.2 Switch to Live Keys

1. Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) (without `/test/`)
2. Copy your **live** keys (start with `pk_live_...` and `sk_live_...`)
3. Update `js/checkout.js` with live publishable key
4. Update Vercel environment variable with live secret key:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
5. Redeploy

### 5.3 Create Live Products

Repeat Step 1.3 but in **live mode** (not test mode):
- Switch to live mode in Stripe Dashboard (toggle in top right)
- Create all 6 products again
- Update Price IDs in `js/checkout.js`

## Troubleshooting

### 404 Error on /api/purchase

**Problem**: Getting 404 Not Found on API endpoints

**Solutions**:
1. ✅ Ensure `vercel.json` exists and is properly configured
2. ✅ Check that API files use ES6 exports (`export default function handler`)
3. ✅ Verify the `stripe` package is in `dependencies` (not `devDependencies`)
4. ✅ Redeploy after making changes

### "Payment system not configured" Error

**Problem**: API returns "Payment system not configured"

**Solutions**:
1. Check that `STRIPE_SECRET_KEY` is set in Vercel environment variables
2. Ensure you redeployed after adding the environment variable
3. Check the Vercel deployment logs for errors

### Stripe Checkout Not Loading

**Problem**: Clicking "Buy Now" shows demo modal

**Solutions**:
1. Verify `STRIPE_PUBLISHABLE_KEY` in `js/checkout.js` is correct
2. Ensure Stripe.js is loaded: `<script src="https://js.stripe.com/v3/"></script>`
3. Check browser console for errors

### Invalid Price ID Error

**Problem**: Stripe returns "No such price" error

**Solutions**:
1. Verify Price IDs in `js/checkout.js` match Stripe Dashboard
2. Ensure you're using Price IDs (start with `price_...`), not Product IDs
3. Check that you're in the correct mode (test vs live)

## Verify Your Setup Checklist

- [ ] Stripe account created and verified
- [ ] Test products created in Stripe Dashboard
- [ ] Price IDs copied and updated in `js/checkout.js`
- [ ] Publishable key updated in `js/checkout.js`
- [ ] Secret key added to Vercel environment variables
- [ ] Code deployed to Vercel
- [ ] `/api/catalog` endpoint returns products
- [ ] `/api/purchase` endpoint creates checkout sessions
- [ ] Stripe Checkout flow works with test card
- [ ] Success page displays after test purchase

## Need Help?

- **Stripe Documentation**: https://docs.stripe.com/payments/accept-a-payment
- **Vercel Documentation**: https://vercel.com/docs
- **Contact**: imagine.oneid@gmail.com

## Security Best Practices

1. ✅ **Never commit secret keys to git**
   - Use `.env` files locally (add to `.gitignore`)
   - Use Vercel environment variables in production

2. ✅ **Use environment-specific keys**
   - Test keys (`sk_test_...`) for development
   - Live keys (`sk_live_...`) for production

3. ✅ **Verify purchases server-side**
   - The `/api/verify-purchase` endpoint validates payments
   - Never trust client-side purchase confirmation

4. ✅ **Set up webhook endpoints** (Advanced)
   - Configure webhooks in Stripe Dashboard
   - Handle `checkout.session.completed` events
   - Automatically deliver products on successful payment

## Next Steps

Once your basic setup is working:

1. **Set up webhooks** for automatic product delivery
2. **Add email notifications** for purchase confirmations
3. **Create customer portal** for download access
4. **Implement analytics** to track conversions
5. **Add refund handling** for customer support

---

**Current Status**: All API files have been fixed to use ES6 imports. Ready to deploy!
