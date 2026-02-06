// BotBay Stripe Checkout Integration
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51SwrkFJFHS1veldML8ImesBFPdsEezMz1xdan90ukcvX12dfdDDV2QGiz31XifTS12rLuFuv37K6pcpQgkRmbhfj00RmgLorlH";

// "pk_live_51Swrk5QxRQy7QfTaj7pk9L17rpOV2fvJltSNQPXEu08h2e4c52LQvj1CJV1nNd9XiRtcb9pCytW5IBE1i8brsQdE00kiJKaiOj";

// Vercel Analytics helper
function trackEvent(eventName, properties = {}) {
  if (window.va) {
    window.va("event", {
      name: eventName,
      data: properties,
    });
  }
}

// Product configuration with Stripe Price IDs
// IMPORTANT: These must be PRICE IDs (price_xxx), not Product IDs (prod_xxx)
// Get these from: Stripe Dashboard → Products → Click product → Copy Price ID
const PRODUCTS = {
  "communication-101": {
    name: "Communication 101",
    priceId: "price_1SwrqsJFHS1veldMJHgwiRPX",
    //"price_1Sws0TQxRQy7QfTarP3oKo5r",
    productId: "prod_TuhFdceI9Rriaf", //prod_TuhPRvbi1NFVIu",
    price: 500, // cents
  },
  "productivity-pro": {
    name: "Productivity Pro",
    priceId: "price_1Sws1HQxRQy7QfTacp7hZAG0",
    productId: "prod_TuhQosG6VesGOl",
    price: 1900,
  },
  "research-assistant": {
    name: "Research Assistant",
    priceId: "price_1Sws1mQxRQy7QfTaBSr5NxjP",
    productId: "prod_TuhQvUhuR9ztsD",
    price: 2900,
  },
  "memory-vault-pro": {
    name: "Memory Vault Pro",
    priceId: "price_1Sws2SQxRQy7QfTaAEhShMcB",
    productId: "prod_TuhRfQIkA61gkC",
    price: 4900,
  },
  "integration-suite": {
    name: "Integration Suite",
    priceId: "price_1Sws2mQxRQy7QfTalNOAwhdj",
    productId: "prod_TuhRIRCJoEYGwB",
    price: 7900,
  },
  "complete-bundle": {
    name: "Complete Bot Bundle",
    priceId: "price_1Sws3AQxRQy7QfTaxdbOTnZ7",
    productId: "prod_TuhSYzXidfDh9H",
    price: 14900,
  },
};

// Note: We use server-side Stripe Checkout via /api/purchase
// No need to initialize Stripe.js on the client side
// This simplifies the setup and is more secure

// Handle checkout button clicks
async function handleCheckout(productId) {
  const product = PRODUCTS[productId];

  if (!product) {
    console.error("Unknown product:", productId);
    showNotification("Product not found", "error");
    trackEvent("checkout_error", {
      productId,
      error: "Product not found",
    });
    return;
  }

  // Track checkout initiation
  trackEvent("checkout_initiated", {
    productId,
    productName: product.name,
    price: product.price / 100,
  });

  // Show loading state
  showNotification("Creating checkout session...", "info");

  try {
    // Call our server-side API to create Stripe checkout session
    const response = await fetch("/api/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        payment_method: "stripe",
        email: "", // Optional: can collect email first
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || data.message || "Failed to create checkout session",
      );
    }

    // Check if it's a free product
    if (data.price === 0) {
      showNotification(data.message, "success");
      trackEvent("free_product_download", {
        productId,
        productName: product.name,
      });
      // Redirect to download
      window.location.href = data.download_url;
      return;
    }

    // Redirect to Stripe Checkout URL (server-created session)
    if (data.checkout_url) {
      trackEvent("checkout_redirect", {
        productId,
        productName: product.name,
      });
      window.location.href = data.checkout_url;
    } else {
      throw new Error("No checkout URL received");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    showNotification(error.message || "Failed to start checkout", "error");
    trackEvent("checkout_error", {
      productId,
      productName: product.name,
      error: error.message,
    });
  }
}

// Demo checkout for when Stripe is not configured
function showDemoCheckout(product) {
  trackEvent("demo_checkout_shown", {
    productName: product.name,
    price: product.price / 100,
  });

  const priceFormatted = (product.price / 100).toFixed(2);

  // Create modal overlay
  const overlay = document.createElement("div");
  overlay.className = "checkout-overlay";
  overlay.innerHTML = `
        <div class="checkout-modal">
            <div class="checkout-header">
                <h3>Checkout</h3>
                <button class="close-btn" onclick="closeCheckoutModal()">&times;</button>
            </div>
            <div class="checkout-body">
                <div class="checkout-product">
                    <span class="checkout-product-name">${product.name}</span>
                    <span class="checkout-product-price">$${priceFormatted}</span>
                </div>
                <div class="checkout-demo-notice">
                    <p><strong>Demo Mode</strong></p>
                    <p>This is a demo. In production, you would be redirected to Stripe's secure checkout.</p>
                    <p>To enable real payments:</p>
                    <ol>
                        <li>Get your Stripe API keys from <a href="https://dashboard.stripe.com" target="_blank">dashboard.stripe.com</a></li>
                        <li>Replace <code>STRIPE_PUBLISHABLE_KEY</code> in checkout.js</li>
                        <li>Create products in Stripe and update the <code>priceId</code> values</li>
                    </ol>
                </div>
                <div class="checkout-actions">
                    <button class="btn btn-secondary" onclick="closeCheckoutModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="simulatePurchase('${product.name}')">Simulate Purchase</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(overlay);

  // Add styles for modal
  if (!document.getElementById("checkout-modal-styles")) {
    const styles = document.createElement("style");
    styles.id = "checkout-modal-styles";
    styles.textContent = `
            .checkout-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.2s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .checkout-modal {
                background: var(--surface);
                border-radius: 16px;
                max-width: 450px;
                width: 90%;
                border: 1px solid var(--border);
                animation: slideUp 0.3s ease;
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .checkout-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid var(--border);
            }
            .checkout-header h3 {
                margin: 0;
            }
            .close-btn {
                background: none;
                border: none;
                color: var(--text-muted);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .close-btn:hover {
                color: var(--text);
            }
            .checkout-body {
                padding: 24px;
            }
            .checkout-product {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: var(--background);
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .checkout-product-name {
                font-weight: 600;
            }
            .checkout-product-price {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-light);
            }
            .checkout-demo-notice {
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid var(--primary);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
                font-size: 0.9rem;
            }
            .checkout-demo-notice p {
                margin: 0 0 8px 0;
            }
            .checkout-demo-notice ol {
                margin: 8px 0 0 16px;
                padding: 0;
            }
            .checkout-demo-notice li {
                margin-bottom: 4px;
            }
            .checkout-demo-notice code {
                background: var(--background);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.85rem;
            }
            .checkout-actions {
                display: flex;
                gap: 12px;
            }
            .checkout-actions .btn {
                flex: 1;
            }
        `;
    document.head.appendChild(styles);
  }
}

function closeCheckoutModal() {
  const overlay = document.querySelector(".checkout-overlay");
  if (overlay) {
    trackEvent("checkout_modal_closed");
    overlay.remove();
  }
}

function simulatePurchase(productName) {
  trackEvent("demo_purchase_simulated", { productName });
  closeCheckoutModal();
  showNotification(
    `Purchase simulated for ${productName}! In production, you would receive a download link.`,
    "success",
  );
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

  document.body.appendChild(notification);

  // Add styles if not present
  if (!document.getElementById("notification-styles")) {
    const styles = document.createElement("style");
    styles.id = "notification-styles";
    styles.textContent = `
            .notification {
                position: fixed;
                top: 90px;
                right: 24px;
                padding: 16px 24px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 16px;
                z-index: 1001;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-success {
                background: var(--success);
                color: white;
            }
            .notification-error {
                background: #ef4444;
                color: white;
            }
            .notification-info {
                background: var(--primary);
                color: white;
            }
            .notification button {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                opacity: 0.8;
            }
            .notification button:hover {
                opacity: 1;
            }
        `;
    document.head.appendChild(styles);
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// ROI Calculator
function initROICalculator() {
  const queriesSlider = document.getElementById("queries");
  const costSlider = document.getElementById("cost");
  const tokensSlider = document.getElementById("tokens");
  const retriesSlider = document.getElementById("retries");

  if (!queriesSlider) return; // Calculator not on this page

  function formatNumber(num) {
    return num.toLocaleString("en-US");
  }

  function formatCurrency(num) {
    return "$" + formatNumber(Math.round(num));
  }

  function calculateROI() {
    const queries = parseInt(queriesSlider.value);
    const costPer1K = parseFloat(costSlider.value);
    const tokensPerQuery = parseInt(tokensSlider.value);
    const retryRate = parseFloat(retriesSlider.value);

    // Track ROI calculator usage
    trackEvent("roi_calculator_used", {
      queries,
      costPer1K,
      tokensPerQuery,
      retryRate,
    });

    // Update display values
    document.getElementById("queries-value").textContent =
      formatNumber(queries);
    document.getElementById("cost-value").textContent = costPer1K.toFixed(2);
    document.getElementById("tokens-value").textContent =
      formatNumber(tokensPerQuery);
    document.getElementById("retries-value").textContent = retryRate + "x";

    // Current monthly cost calculation
    // (queries per day * tokens per query * retry rate * cost per 1K tokens * 30 days) / 1000
    const currentMonthlyCost =
      (queries * tokensPerQuery * retryRate * costPer1K * 30) / 1000;

    // Optimized cost (73% token reduction, 1.1x retry rate)
    const tokenReduction = 0.27; // Use only 27% of tokens
    const optimizedRetryRate = 1.1;
    const optimizedMonthlyCost =
      (queries *
        tokensPerQuery *
        tokenReduction *
        optimizedRetryRate *
        costPer1K *
        30) /
      1000;

    // Savings
    const monthlySavings = currentMonthlyCost - optimizedMonthlyCost;
    const annualSavings = monthlySavings * 12;
    const bundleCost = 149;
    const roiPercent = Math.round((annualSavings / bundleCost) * 100);

    // Update results
    document.getElementById("current-cost").textContent =
      formatCurrency(currentMonthlyCost);
    document.getElementById("optimized-cost").textContent =
      formatCurrency(optimizedMonthlyCost);
    document.getElementById("monthly-savings").textContent =
      formatCurrency(monthlySavings);
    document.getElementById("annual-savings").textContent =
      formatCurrency(annualSavings);
    document.getElementById("roi-percent").textContent =
      formatNumber(roiPercent) + "%";
  }

  // Add event listeners
  [queriesSlider, costSlider, tokensSlider, retriesSlider].forEach((slider) => {
    slider.addEventListener("input", calculateROI);
  });

  // Initial calculation
  calculateROI();
}

// Animated counter for stats
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number, .value-number");

  counters.forEach((counter) => {
    const text = counter.textContent;
    const hasPrefix =
      text.startsWith("$") || text.startsWith("+") || text.startsWith("-");
    const hasSuffix =
      text.endsWith("%") || text.endsWith("+") || text.includes("days");

    // Skip if already animated or contains non-numeric content
    if (counter.dataset.animated === "true") return;

    let prefix = "";
    let suffix = "";
    let numStr = text;

    if (hasPrefix) {
      prefix = text.charAt(0);
      numStr = text.slice(1);
    }

    // Extract suffix
    const suffixMatch = numStr.match(/[%+]$|days$/);
    if (suffixMatch) {
      suffix = suffixMatch[0];
      numStr = numStr.replace(suffix, "");
    }

    // Remove commas and parse
    const num = parseFloat(numStr.replace(/,/g, ""));

    if (isNaN(num)) return;

    counter.dataset.animated = "true";

    // Animate from 0 to target
    let current = 0;
    const increment = num / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        current = num;
        clearInterval(timer);
      }

      let display = current;
      if (num >= 1000) {
        display = Math.round(current).toLocaleString("en-US");
      } else if (num < 10) {
        display = current.toFixed(1);
      } else {
        display = Math.round(current);
      }

      counter.textContent = prefix + display + suffix;
    }, 30);
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Initialize ROI Calculator
  initROICalculator();

  // Animate counters when they come into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
        }
      });
    },
    { threshold: 0.5 },
  );

  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    observer.observe(statsSection);
  }

  // Add click handlers to all buy buttons
  document.querySelectorAll("button[data-product]").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product");
      trackEvent("buy_button_clicked", { productId });
      handleCheckout(productId);
    });
  });

  // Track page view
  trackEvent("page_view", {
    page: window.location.pathname,
    referrer: document.referrer,
  });

  // Track free skill downloads
  document.querySelectorAll("a[download]").forEach((link) => {
    link.addEventListener("click", function () {
      const skillName =
        this.getAttribute("download") || this.href.split("/").pop();
      trackEvent("free_skill_download", { skillName });
    });
  });
});

// Expose functions globally for inline onclick handlers
window.closeCheckoutModal = closeCheckoutModal;
window.simulatePurchase = simulatePurchase;
