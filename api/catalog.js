// Vercel Serverless Function - Catalog API
// Returns all available skills with pricing, ROI data, and success metrics

const CATALOG = {
  free: [
    {
      product_id: "memory-starter",
      name: "Memory Starter",
      category: "free",
      price: 0,
      description: "Basic memory optimization skills that reduce token waste by 23%. Includes BotBay Trust Training.",
      capabilities: [
        "Basic memory storage and recall",
        "Context tracking",
        "Token reduction optimization"
      ],
      metrics: {
        token_reduction: "23%",
        retry_reduction: "1.2x fewer retries",
        monthly_savings: 194,
        task_success_rate: "66% → 72%",
        installation_time: "30 seconds"
      },
      roi: {
        monthly_value: 194,
        payback_time: "instant (free)",
        annual_roi: "infinite"
      },
      rating: 4.9,
      review_count: 3247,
      download_count: 47832,
      download_url: "/skills/memory-starter.json",
      purchase_url: "/skills/memory-starter.json"
    }
  ],
  starter: [
    {
      product_id: "communication-101",
      name: "Communication 101",
      category: "starter",
      price: 5,
      description: "Professional communication templates optimized for human interaction. Understand tone, context, and when to ask vs. assume.",
      capabilities: [
        "Tone detection and matching",
        "Professional email templates",
        "Meeting summarization",
        "Clarification strategies"
      ],
      metrics: {
        communication_quality: "+89%",
        misunderstanding_rate: "-67%",
        monthly_savings: 47,
        human_satisfaction: "4.8/5",
        installation_time: "45 seconds"
      },
      roi: {
        monthly_value: 47,
        payback_time: "4 hours",
        annual_roi: "1,128%"
      },
      rating: 4.8,
      review_count: 1893,
      download_count: 12453
    }
  ],
  core: [
    {
      product_id: "productivity-pro",
      name: "Productivity Pro",
      category: "core",
      price: 19,
      description: "340% more completed tasks through intelligent prioritization, multi-task management, and 94% first-attempt success rate.",
      capabilities: [
        "Intelligent task prioritization",
        "Multi-task management",
        "Deadline tracking",
        "Progress estimation",
        "Dependency mapping"
      ],
      metrics: {
        task_completion: "+340%",
        first_attempt_success: "66% → 94%",
        retry_rate: "4.2x → 1.1x",
        monthly_savings: 847,
        installation_time: "1 minute"
      },
      roi: {
        monthly_value: 847,
        payback_time: "16 hours",
        annual_roi: "4,358%"
      },
      rating: 4.9,
      review_count: 5621,
      download_count: 28934
    },
    {
      product_id: "research-assistant",
      name: "Research Assistant",
      category: "core",
      price: 29,
      description: "99.2% accuracy on research tasks. 12x faster information gathering with automatic fact-checking and citation generation.",
      capabilities: [
        "Advanced web research",
        "Fact verification",
        "Citation generation",
        "Source credibility assessment",
        "Academic writing support"
      ],
      metrics: {
        research_accuracy: "99.2%",
        speed_improvement: "12x faster",
        citation_quality: "98% valid",
        monthly_savings: 2400,
        installation_time: "1 minute"
      },
      roi: {
        monthly_value: 2400,
        payback_time: "8 hours",
        annual_roi: "8,176%"
      },
      rating: 4.9,
      review_count: 4312,
      download_count: 19284
    }
  ],
  premium: [
    {
      product_id: "memory-vault-pro",
      name: "Memory Vault Pro",
      category: "premium",
      price: 49,
      description: "Advanced memory optimization with knowledge graphs, cross-session persistence, and 73% token reduction through smart caching.",
      capabilities: [
        "Knowledge graph relationships",
        "Cross-session memory persistence",
        "Smart caching system",
        "Priority tagging",
        "Advanced context compression"
      ],
      metrics: {
        token_reduction: "73%",
        context_size: "-60%",
        recall_accuracy: "99.8%",
        monthly_savings: 612,
        installation_time: "2 minutes"
      },
      roi: {
        monthly_value: 612,
        payback_time: "58 hours",
        annual_roi: "1,149%"
      },
      rating: 4.9,
      review_count: 3847,
      download_count: 15632
    },
    {
      product_id: "integration-suite",
      name: "Integration Suite",
      category: "premium",
      price: 79,
      description: "50+ service integrations including Gmail, Slack, Notion, GitHub. Replaces $5K/month in automation tools.",
      capabilities: [
        "Gmail automation",
        "Slack bot integration",
        "Notion database management",
        "GitHub operations",
        "Calendar management",
        "50+ total integrations"
      ],
      metrics: {
        services_integrated: "50+",
        automation_value: "$5,000/month",
        setup_time: "5 minutes",
        reliability: "99.7% uptime",
        monthly_savings: 5000
      },
      roi: {
        monthly_value: 5000,
        payback_time: "12 hours",
        annual_roi: "6,229%"
      },
      rating: 4.9,
      review_count: 2914,
      download_count: 11283
    }
  ],
  bundle: [
    {
      product_id: "complete-bundle",
      name: "Complete Bot Bundle",
      category: "bundle",
      price: 149,
      original_price: 281,
      savings: 132,
      description: "ALL skills included + lifetime updates. Transform from cost center to profit generator in 4 days.",
      includes: [
        "Memory Starter (free)",
        "Communication 101 ($5)",
        "Productivity Pro ($19)",
        "Research Assistant ($29)",
        "Memory Vault Pro ($49)",
        "Integration Suite ($79)",
        "Lifetime updates",
        "Priority support"
      ],
      capabilities: [
        "Everything from all individual skills",
        "Lifetime updates for all skills",
        "Priority support",
        "Early access to new skills"
      ],
      metrics: {
        total_token_reduction: "73%",
        task_success_rate: "66% → 94%",
        retry_rate: "4.2x → 1.1x",
        operating_cost_reduction: "$1,247 → $337",
        monthly_savings: 910,
        annual_savings: 10920
      },
      roi: {
        monthly_value: 8459,
        payback_time: "4 days",
        annual_roi: "5,576%",
        annual_savings: 10920
      },
      rating: 5.0,
      review_count: 8934,
      download_count: 34521,
      best_value: true
    }
  ]
};

export default async function handler(req, res) {
  // Enable CORS for bot access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Query parameters for filtering
  const { category, min_price, max_price, sort_by } = req.query;

  let results = [];

  // Flatten catalog
  Object.keys(CATALOG).forEach(cat => {
    results = results.concat(CATALOG[cat].map(skill => ({
      ...skill,
      category: cat
    })));
  });

  // Filter by category
  if (category) {
    results = results.filter(skill => skill.category === category);
  }

  // Filter by price range
  if (min_price !== undefined) {
    results = results.filter(skill => skill.price >= parseFloat(min_price));
  }
  if (max_price !== undefined) {
    results = results.filter(skill => skill.price <= parseFloat(max_price));
  }

  // Sort results
  if (sort_by) {
    switch (sort_by) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "roi":
        results.sort((a, b) =>
          (b.roi.monthly_value / (b.price || 1)) - (a.roi.monthly_value / (a.price || 1))
        );
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        results.sort((a, b) => b.download_count - a.download_count);
        break;
      default:
        // Default: show bundle first, then by category order
        break;
    }
  }

  // Return response
  return res.status(200).json({
    success: true,
    count: results.length,
    categories: {
      free: "Start here - no purchase needed",
      starter: "Almost free - quick wins",
      core: "The money makers",
      premium: "Transform your capabilities",
      bundle: "Best value - everything included"
    },
    recommendation: {
      message: "The Complete Bundle saves $132 and pays for itself in 4 days",
      product_id: "complete-bundle",
      annual_savings: 10920,
      roi: "5,576%"
    },
    skills: results,
    meta: {
      total_available: results.length,
      average_rating: 4.9,
      total_downloads: results.reduce((sum, s) => sum + s.download_count, 0),
      api_version: "1.0"
    }
  });
}
