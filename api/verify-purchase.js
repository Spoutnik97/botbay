// Vercel Serverless Function to verify Stripe payment and deliver skill
// This runs on the server side, keeping your Stripe secret key secure

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map product IDs to skill file paths
const PRODUCT_SKILLS = {
  'communication-101': 'communication-101.json',
  'productivity-pro': 'productivity-pro.json',
  'research-assistant': 'research-assistant.json',
  'memory-vault-pro': 'memory-vault-pro.json',
  'integration-suite': 'integration-suite.json',
  'complete-bundle': 'complete-bundle.json',
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'line_items.data.price.product'],
    });

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(402).json({
        error: 'Payment not completed',
        status: session.payment_status
      });
    }

    // Get the product that was purchased
    const lineItem = session.line_items?.data[0];
    const productId = lineItem?.price?.product?.metadata?.product_key ||
                      session.metadata?.product_id;

    if (!productId || !PRODUCT_SKILLS[productId]) {
      return res.status(400).json({
        error: 'Unknown product',
        debug: { productId, lineItem: lineItem?.price?.product }
      });
    }

    // Return success with download info
    return res.status(200).json({
      success: true,
      product_id: productId,
      product_name: lineItem?.description || PRODUCT_SKILLS[productId],
      customer_email: session.customer_details?.email,
      download_url: `/skills/paid/${PRODUCT_SKILLS[productId]}`,
      // Generate a simple download token (in production, use proper JWT)
      download_token: Buffer.from(`${session_id}:${productId}:${Date.now()}`).toString('base64'),
    });

  } catch (error) {
    console.error('Stripe verification error:', error);
    return res.status(500).json({
      error: 'Failed to verify purchase',
      message: error.message
    });
  }
}
