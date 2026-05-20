export const MOCK_SYNTHESES = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    sentiment: 78,
    sentimentLabel: "Bullish",
    executiveSummary: "Apple is exhibiting strong underlying momentum as supply chain channels in mainland China demonstrate an inflection in premium iPhone demand, reversing early-year headwinds. Key macro indicators point to high anticipation for its upcoming iOS ecosystem updates integrating Apple Intelligence (AI). Services growth continues to compound at a high-teens rate, providing a highly profitable valuation cushion against device volume volatility.",
    portfolioActions: [
      "Accumulate on transient pullbacks; near-term support is highly solidified at the $185 level.",
      "Maintain core holding overweight: the upcoming high-margin services inflection and replacement cycle act as powerful tailwinds.",
      "Hedge regulatory risks in Europe through index options rather than liquidating high-conviction AAPL equity."
    ],
    catalysts: {
      "financials": [
        "Services segment revenue margins expanded to 74.2%, outpacing consensus buy-side projections by 110 bps.",
        "Management authorized a record-breaking $110 billion share repurchase program, yielding immediate capital returns."
      ],
      "macro": [
        "Mainland China premium smartphone market share rebounded by 4.2% month-over-month, showing resilient high-end consumer spend.",
        "Broader IT hardware replacement cycles are accelerating heading into late 2026, boosting consumer refresh rates."
      ],
      "productTech": [
        "Apple Intelligence deep integration into next-generation silicon is expected to spark a multi-year hardware upgrade cycle.",
        "Next-generation ultra-thin MacBook Pro lineup using advanced 3nm M5 architecture rumored to launch ahead of schedule."
      ],
      "regulation": [
        "US Department of Justice antitrust lawsuit remains a lingering structural overhang but is expected to drag on for years without immediate operational disruption.",
        "EU Digital Markets Act compliance continues to cause friction, resulting in minor region-specific fee concessions."
      ]
    },
    risks: [
      "Lengthening consumer upgrade cycles if Apple Intelligence features roll out incrementally rather than all at once.",
      "Increasing structural competition from localized premium brands in high-growth Asian markets."
    ],
    newsItemSentiments: [
      {
        "title": "Apple China iPhone Shipments Surge 52% in Rebound, Data Shows",
        "sentiment": "Bullish",
        "impactSummary": "Validates demand recovery in Apple's secondary geographic market, mitigating worries over regional market-share losses.",
        "usedInSynthesis": true
      },
      {
        "title": "Why the Services Segment is Apple's Secret Growth Engine",
        "sentiment": "Bullish",
        "impactSummary": "Highlights the margin expansion story which shifts Apple's valuation from pure hardware multiples to higher software multiples.",
        "usedInSynthesis": true
      },
      {
        "title": "DOJ Antitrust Fight Against Apple Could Take Years to Resolve",
        "sentiment": "Neutral",
        "impactSummary": "Reassures investors that a regulatory breakup or dramatic business model shift is highly unlikely in the near-to-medium term.",
        "usedInSynthesis": false
      }
    ],
    "performance": {
      "provider": "ollama",
      "model": "gemma",
      "promptTokens": 1420,
      "completionTokens": 512,
      "totalTokens": 1932,
      "generationTimeSec": 12.2,
      "tokensPerSecond": 42.0
    }
  },
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sentiment: 92,
    sentimentLabel: "Strong Bullish",
    executiveSummary: "NVIDIA maintains an absolute monopoly over AI computing architectures as demand for its upcoming Blackwell chip generation exceeds current supply capacity by multiple orders of magnitude. Hyperscaler capital expenditure trajectories (Meta, Microsoft, AWS, Google) remain heavily tilted toward GPU compute clusters. Operating margins hover at historically unprecedented levels, defying fears of immediate margin compression from proprietary silicon competitors.",
    portfolioActions: [
      "Maintain maximum high-conviction exposure; utilize collar options to protect gains rather than trimming active shares.",
      "Factor in supply-chain constraint bottlenecks rather than demand saturation when modelling H2 earnings multiples.",
      "Cross-verify hyperscaler CapEx filings quarterly to ensure capital allocations into GPU infrastructure remain unchecked."
    ],
    catalysts: {
      "financials": [
        "Data Center revenue surged 427% year-over-year, establishing NVDA as the primary capital gatekeeper of the AI revolution.",
        "Gross margins stabilized at an incredible 76.7%, driven by strong pricing power on high-performance packaging."
      ],
      "macro": [
        "Global sovereign states are actively subsidizing domestic AI supercomputing clusters, opening up a massive secondary sovereign demand channel.",
        "Global Tier-1 cloud service providers expanded their aggregate AI capital expenditure guidance by another 15%."
      ],
      "productTech": [
        "Blackwell B200 architectures are shipping to customers, exhibiting 30x faster inference and 25x lower energy metrics than H100.",
        "NVIDIA's proprietary CUDA programming ecosystem continues to create an insurmountable software moat that lock-in developers."
      ],
      "regulation": [
        "US government restrictions on high-end chip exports to restricted zones continue to require custom lower-spec designs (H20), marginally capping tail winds.",
        "Global antitrust probes into chip allocation practices represent a headline risk but pose no immediate existential threat."
      ]
    },
    risks: [
      "Extreme dependency on single-source foundry packaging (TSMC CoWoS packaging limitations) which governs total shipment capacity.",
      "High concentration of revenue within the top 5 cloud providers, leaving the company vulnerable to any macroeconomic enterprise software slowdown."
    ],
    newsItemSentiments: [
      {
        "title": "NVIDIA Blackwell Demand Far Exceeds Supply for the Foreseeable Future",
        "sentiment": "Bullish",
        "impactSummary": "Underpins near-term earnings visibility and cements NVDA's multi-quarter backlog, reinforcing the strong bullish thesis.",
        "usedInSynthesis": true
      },
      {
        "title": "Microsoft and Meta Increase Capital Spending on AI Hardware",
        "sentiment": "Bullish",
        "impactSummary": "Directly correlates to NVDA order books, proving that hyperscaler demand shows zero signs of fatigue.",
        "usedInSynthesis": true
      },
      {
        "title": "Foundry Constraints Could Limit NVIDIA's Blackwell Shipment Targets",
        "sentiment": "Bearish",
        "impactSummary": "Identifies the core physical bottleneck limiting near-term revenue growth, representing a minor supply-side risk.",
        "usedInSynthesis": false
      }
    ],
    "performance": {
      "provider": "ollama",
      "model": "gemma",
      "promptTokens": 1380,
      "completionTokens": 480,
      "totalTokens": 1860,
      "generationTimeSec": 10.5,
      "tokensPerSecond": 45.7
    }
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sentiment: 42,
    sentimentLabel: "Bearish",
    executiveSummary: "Tesla is grappling with a difficult structural transition, marked by deteriorating core automotive gross margins (ex-credits) driven by global EV price discounting. Consumer adoption rates in primary Western markets are plateauing, and regulatory headwinds are complicating Full Self-Driving (FSD) commercialization timelines. While the long-term energy storage and robotics thesis remains attractive, near-term capital flows are restricted by high execution risks and executive distractions.",
    portfolioActions: [
      "Underweight or hedge positions; set tight stop-losses at the psychological $150 support boundary.",
      "Shift portfolio weight from Tesla automotive to pure-play grid battery energy storage peers which face fewer near-term headwinds.",
      "Avoid pricing in robotaxi networks into 2026 earnings calculations until regulatory safety approvals are actively secured."
    ],
    catalysts: {
      "financials": [
        "Automotive gross margin excluding regulatory credits compressed to 14.6%, showing severe pressure from EV price discounting.",
        "Free cash flow generation recovered marginally, supported by reductions in operating expenditure and head-count consolidation."
      ],
      "macro": [
        "Western European and US battery EV market shares contracted by 2% aggregate as hybrid models saw elevated consumer preference.",
        "Intense pricing wars from highly-subsidized Chinese EV manufacturers are capping export potential in emerging markets."
      ],
      "productTech": [
        "Tesla's FSD Version 12.5 shows visual improvements in neural net navigation, but still requires a safety-driver oversight.",
        "Energy Storage deployments (Megapacks) hit record-high GWh milestones, emerging as a high-margin bright spot."
      ],
      "regulation": [
        "Pending regulatory investigations into Autopilot safety standards represent an ongoing risk of recall or software restrictions.",
        "Uncertainty around localized EV subsidies and tariffs creates pricing headwinds across European operations."
      ]
    },
    risks: [
      "Further dilution of brand equity if vehicle price reductions fail to spur sustained unit-volume growth.",
      "Protracted delay in launching the highly anticipated next-generation low-cost ($25k) consumer vehicle platform."
    ],
    newsItemSentiments: [
      {
        "title": "Tesla Core Profit Margins Compress Further Amid Worldwide EV Price Cuts",
        "sentiment": "Bearish",
        "impactSummary": "Negatively impacts immediate earnings multiples, pointing to structural margin degradation in the automotive core.",
        "usedInSynthesis": true
      },
      {
        "title": "Tesla Energy Storage Megapack Segment Hits Record Deployments",
        "sentiment": "Bullish",
        "impactSummary": "Provides a partial earnings cushion, validating the diversification strategy into utility-scale battery solutions.",
        "usedInSynthesis": true
      },
      {
        "title": "Regulators Probe Tesla's Full Self-Driving Software Following Highway Incidents",
        "sentiment": "Bearish",
        "impactSummary": "Elevates regulatory risks, potentially postponing autonomous licensing approvals and software monetization.",
        "usedInSynthesis": false
      }
    ],
    "performance": {
      "provider": "ollama",
      "model": "gemma",
      "promptTokens": 1510,
      "completionTokens": 530,
      "totalTokens": 2040,
      "generationTimeSec": 13.8,
      "tokensPerSecond": 38.4
    }
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sentiment: 84,
    sentimentLabel: "Bullish",
    executiveSummary: "Microsoft is capturing the largest share of enterprise AI software spend, translating early models into highly recurring commercial revenue. Azure Cloud has sustained accelerating growth rates, fueled directly by Azure OpenAI service usage and migration. While capital expenditure remains elevated to construct next-generation data centers, the immediate monetization rate of Office Copilot and commercial cloud applications validates the high investment scale.",
    portfolioActions: [
      "Overweight position; core foundation holding for any macro growth-oriented portfolio.",
      "Re-allocate tech capital from consumer-facing legacy software into MSFT to capitalize on high-margin enterprise AI adoption.",
      "Model Azure growth rates as the primary metric for valuation multiple extensions."
    ],
    catalysts: {
      "financials": [
        "Azure and other cloud services revenue grew by 31% in constant currency, beating market expectations by 120 bps.",
        "Commercial remaining performance obligations (RPO) grew 20% to $248 billion, indicating strong enterprise booking backlogs."
      ],
      "macro": [
        "Enterprises are consolidating their software expenditures, shifting towards Microsoft's unified suite to optimize operational costs.",
        "Corporate IT spending budgets for generative AI integration expanded by 22%, with Microsoft as the primary beneficiary."
      ],
      "productTech": [
        "Copilot integration across M365 reached a 24% adoption rate among Fortune 500 enterprise seats, yielding high ARPU increases.",
        "Strategic partnership with OpenAI and custom Cobalt CPU silicon deployments are lowering inference compute costs."
      ],
      "regulation": [
        "EU antitrust antitrust pressure on Teams bundling requires region-specific unbundling but has had negligible impact on overall churn.",
        "Security-related audits by federal agencies are requiring structural capital focus but do not impair commercial pipelines."
      ]
    },
    risks: [
      "Supply-side capacity constraints (datacenter space and power grid limitations) slowing down Azure's short-term growth potential.",
      "Prolonged ROI verification cycles by enterprise customers, which could slow down secondary seat licenses."
    ],
    newsItemSentiments: [
      {
        "title": "Microsoft Azure Accelerates Growth, Fuelled by Enterprise AI Demand",
        "sentiment": "Bullish",
        "impactSummary": "Confirms the commercialization phase of AI is materializing in raw cloud numbers, driving the stock higher.",
        "usedInSynthesis": true
      },
      {
        "title": "Microsoft Copilot Adoption Hits Milestone in Corporate America",
        "sentiment": "Bullish",
        "impactSummary": "Demonstrates high SaaS pricing power, boosting average revenue per user across enterprise product tiers.",
        "usedInSynthesis": true
      },
      {
        "title": "Antitrust Regulators Examine Microsoft's Multi-Billion Investment in OpenAI",
        "sentiment": "Neutral",
        "impactSummary": "Highlights structural regulatory scrutiny, but immediate operational separation is considered highly unlikely.",
        "usedInSynthesis": false
      }
    ],
    "performance": {
      "provider": "gemini",
      "model": "gemini-1.5-flash",
      "promptTokens": 1450,
      "completionTokens": 410,
      "totalTokens": 1860,
      "generationTimeSec": 1.8,
      "tokensPerSecond": 227.8
    }
  }
};
