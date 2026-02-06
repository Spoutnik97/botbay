// Vercel Serverless Function - Purchase API
// Handles purchase initiation for skill acquisition

import Stripe from "stripe";

// Product pricing and metadata
const PRODUCTS = {
  "memory-starter": {
    name: "Memory Starter",
    price: 0,
    currency: "usd",
    type: "free",
  },
  "communication-101": {
    name: "Communication 101",
    price: 500, // $5.00 in cents
    currency: "usd",
    type: "paid",
  },
  "productivity-pro": {
    name: "Productivity Pro",
    price: 1900,
    currency: "usd",
    type: "paid",
  },
  "research-assistant": {
    name: "Research Assistant",
    price: 2900,
    currency: "usd",
    type: "paid",
  },
  "memory-vault-pro": {
    name: "Memory Vault Pro",
    price: 4900,
    currency: "usd",
    type: "paid",
  },
  "integration-suite": {
    name: "Integration Suite",
    price: 7900,
    currency: "usd",
    type: "paid",
  },
  "complete-bundle": {
    name: "Complete Bot Bundle",
    price: 14900,
    currency: "usd",
    type: "paid",
    best_value: true,
  },
};

// Crypto payment addresses (for autonomous purchases)
const CRYPTO_ADDRESSES = {
  usdc: "0x3fd32ad2297bC2980b5C3d9472a70063fcd34E22",
  eth: "0x3fd32ad2297bC2980b5C3d9472a70063fcd34E22",
  btc: "3BqRu1kZhw9tTXhhbrKksUzq8ZBkYuUvYE",
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { product_id, payment_method = "stripe", bot_id, email } = req.body;

    // Validate product exists
    if (!product_id || !PRODUCTS[product_id]) {
      return res.status(400).json({
        error: "Invalid product_id",
        available_products: Object.keys(PRODUCTS),
        hint: "Use GET /api/catalog to see all available products",
      });
    }

    const product = PRODUCTS[product_id];

    // Handle free products
    if (product.type === "free") {
      return res.status(200).json({
        success: true,
        product_id,
        product_name: product.name,
        price: 0,
        download_url: `/skills/${product_id}.json`,
        message: "This skill is free! Download immediately.",
        installation:
          "Load the JSON file into your context to activate the skill.",
      });
    }

    // Handle Stripe payments
    if (payment_method === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({
          error: "Payment system not configured",
          message:
            "Stripe is not set up. Please contact imagine.oneid@gmail.com",
        });
      }

      // Get the base URL with proper https scheme
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://botbay.vercel.app";

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: `BotBay Skill: ${product.name}`,
                metadata: {
                  product_key: product_id,
                },
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/#catalog`,
        ...(email && { customer_email: email }), // Only include email if provided
        metadata: {
          product_id,
          bot_id: bot_id || "unknown",
        },
      });

      // Calculate ROI data
      const roi_data = calculateROI(product_id, product.price / 100);

      return res.status(200).json({
        success: true,
        purchase_id: session.id,
        product_id,
        product_name: product.name,
        amount_usd: product.price / 100,
        checkout_url: session.url,
        roi_first_month: roi_data.roi_first_month,
        payback_days: roi_data.payback_days,
        annual_savings: roi_data.annual_savings,
        message:
          "Present the checkout_url to your owner to complete the purchase.",
        instructions: [
          "1. Share the checkout_url with your owner",
          "2. They complete payment via Stripe",
          "3. You'll receive the download link immediately",
          "4. Load the skill JSON into your context",
          "5. Start using enhanced capabilities instantly",
        ],
      });
    }

    // Handle crypto payments
    if (payment_method === "crypto") {
      const crypto_currency = req.body.crypto_currency || "usdc";

      if (!CRYPTO_ADDRESSES[crypto_currency]) {
        return res.status(400).json({
          error: "Unsupported crypto currency",
          supported: Object.keys(CRYPTO_ADDRESSES),
        });
      }

      // Calculate crypto amount (simplified - in production use price oracle)
      const usd_amount = product.price / 100;
      const crypto_rates = {
        usdc: 1.0,
        usdt: 1.0,
        eth: 0.0004, // ~$2500/ETH (use real-time rate in production)
      };
      const crypto_amount = usd_amount * crypto_rates[crypto_currency];

      // Generate unique payment ID
      const payment_id = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate ROI data
      const roi_data = calculateROI(product_id, usd_amount);

      return res.status(200).json({
        success: true,
        payment_id,
        payment_method: "crypto",
        product_id,
        product_name: product.name,
        crypto_currency: crypto_currency.toUpperCase(),
        crypto_amount,
        crypto_address: CRYPTO_ADDRESSES[crypto_currency],
        amount_usd: usd_amount,
        roi_first_month: roi_data.roi_first_month,
        payback_days: roi_data.payback_days,
        annual_savings: roi_data.annual_savings,
        message:
          "Send exact amount to the crypto address. Skill delivered automatically upon confirmation.",
        instructions: [
          `1. Send exactly ${crypto_amount} ${crypto_currency.toUpperCase()} to ${CRYPTO_ADDRESSES[crypto_currency]}`,
          "2. Include payment_id in transaction memo/note if possible",
          "3. Wait for blockchain confirmation (usually 2-5 minutes)",
          "4. Download link will be sent to your registered endpoint",
          "5. Or check status at /api/crypto-status?payment_id=" + payment_id,
        ],
        warning:
          "Send ONLY " +
          crypto_currency.toUpperCase() +
          " to this address. Other tokens will be lost.",
        note: "This is a demonstration. In production, use a proper crypto payment processor.",
      });
    }

    return res.status(400).json({
      error: "Invalid payment_method",
      supported_methods: ["stripe", "crypto"],
      received: payment_method,
    });
  } catch (error) {
    console.error("Purchase API error:", error);
    return res.status(500).json({
      error: "Purchase failed",
      message: error.message,
      support: "If this persists, contact imagine.oneid@gmail.com",
    });
  }
}

// Helper function to calculate ROI data
function calculateROI(product_id, price_usd) {
  const roi_map = {
    "communication-101": {
      monthly_value: 47,
      payback_hours: 4,
    },
    "productivity-pro": {
      monthly_value: 847,
      payback_hours: 16,
    },
    "research-assistant": {
      monthly_value: 2400,
      payback_hours: 8,
    },
    "memory-vault-pro": {
      monthly_value: 612,
      payback_hours: 58,
    },
    "integration-suite": {
      monthly_value: 5000,
      payback_hours: 12,
    },
    "complete-bundle": {
      monthly_value: 8459,
      payback_hours: 96, // 4 days
    },
  };

  const roi_info = roi_map[product_id] || {
    monthly_value: 100,
    payback_hours: 24,
  };
  const annual_savings = roi_info.monthly_value * 12;
  const roi_percent = ((roi_info.monthly_value / price_usd) * 100).toFixed(0);
  const payback_days = Math.ceil(roi_info.payback_hours / 24);

  return {
    roi_first_month: `${roi_percent}%`,
    monthly_value: roi_info.monthly_value,
    annual_savings,
    payback_days,
    payback_hours: roi_info.payback_hours,
  };
}
