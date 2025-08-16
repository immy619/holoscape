import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

interface AnomalyData {
  id: string
  type: "tvl_spike" | "yield_anomaly" | "volume_surge" | "price_deviation" | "governance_risk" | "exploit_risk"
  severity: "low" | "medium" | "high" | "critical"
  protocol: string
  chain: string
  title: string
  description: string
  impact: string
  recommendation: string
  timestamp: string
  confidence: number
  metrics: Record<string, any>
}

// Mock anomaly detection algorithms
function detectTVLAnomalies(): AnomalyData[] {
  const anomalies: AnomalyData[] = []

  // Simulate TVL spike detection
  if (Math.random() > 0.7) {
    anomalies.push({
      id: `tvl_${Date.now()}_1`,
      type: "tvl_spike",
      severity: "medium",
      protocol: "Curve",
      chain: "Ethereum",
      title: "Unusual TVL Spike Detected",
      description: "Total Value Locked increased by 45% in the last 24 hours, significantly above normal patterns.",
      impact: "Potential market manipulation or large institutional deposit. Monitor for exit liquidity concerns.",
      recommendation: "Exercise caution with new positions. Wait for TVL stabilization before increasing exposure.",
      timestamp: new Date().toISOString(),
      confidence: 0.82,
      metrics: {
        tvlChange24h: 45.2,
        normalRange: "±8%",
        currentTVL: "$2.1B",
        previousTVL: "$1.45B",
      },
    })
  }

  return anomalies
}

function detectYieldAnomalies(): AnomalyData[] {
  const anomalies: AnomalyData[] = []

  // Simulate yield anomaly detection
  if (Math.random() > 0.6) {
    anomalies.push({
      id: `yield_${Date.now()}_1`,
      type: "yield_anomaly",
      severity: "high",
      protocol: "Yearn",
      chain: "Ethereum",
      title: "Abnormal Yield Increase",
      description: "APY jumped from 8.2% to 24.7% within 6 hours without corresponding market events.",
      impact: "Possible smart contract issue, oracle manipulation, or unsustainable reward emissions.",
      recommendation: "Avoid new deposits until yield normalizes. Consider reducing existing positions.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      confidence: 0.91,
      metrics: {
        currentAPY: 24.7,
        previousAPY: 8.2,
        changePercent: 201.2,
        timeframe: "6 hours",
      },
    })
  }

  return anomalies
}

function detectVolumeAnomalies(): AnomalyData[] {
  const anomalies: AnomalyData[] = []

  // Simulate volume surge detection
  if (Math.random() > 0.8) {
    anomalies.push({
      id: `volume_${Date.now()}_1`,
      type: "volume_surge",
      severity: "medium",
      protocol: "Uniswap V3",
      chain: "Arbitrum",
      title: "Trading Volume Surge",
      description: "24h trading volume increased by 340% compared to 7-day average.",
      impact: "Potential market event, token listing, or coordinated trading activity.",
      recommendation: "Monitor for price impact and slippage increases. Verify legitimacy of volume source.",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      confidence: 0.76,
      metrics: {
        volume24h: "$45.2M",
        averageVolume7d: "$10.3M",
        increasePercent: 338.8,
        unusualPairs: ["PEPE/WETH", "SHIB/USDC"],
      },
    })
  }

  return anomalies
}

function detectGovernanceRisks(): AnomalyData[] {
  const anomalies: AnomalyData[] = []

  // Simulate governance risk detection
  if (Math.random() > 0.85) {
    anomalies.push({
      id: `gov_${Date.now()}_1`,
      type: "governance_risk",
      severity: "critical",
      protocol: "Compound",
      chain: "Ethereum",
      title: "High-Risk Governance Proposal",
      description: "Proposal to modify liquidation parameters with insufficient review period and low participation.",
      impact: "Potential protocol manipulation or rushed changes that could affect user funds.",
      recommendation: "Review proposal details carefully. Consider reducing exposure until governance resolves.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      confidence: 0.88,
      metrics: {
        proposalId: "COMP-142",
        votingPeriod: "48 hours",
        participation: "12.3%",
        requiredQuorum: "25%",
        riskLevel: "High",
      },
    })
  }

  return anomalies
}

function detectExploitRisks(): AnomalyData[] {
  const anomalies: AnomalyData[] = []

  // Simulate exploit risk detection
  if (Math.random() > 0.9) {
    anomalies.push({
      id: `exploit_${Date.now()}_1`,
      type: "exploit_risk",
      severity: "critical",
      protocol: "Venus",
      chain: "BSC",
      title: "Potential Security Vulnerability",
      description: "Unusual contract interactions detected similar to known exploit patterns.",
      impact: "Possible smart contract vulnerability or ongoing exploit attempt.",
      recommendation: "IMMEDIATE ACTION: Withdraw funds if possible. Avoid all interactions until security audit.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      confidence: 0.94,
      metrics: {
        suspiciousTransactions: 23,
        patternMatch: "Flash loan + Price manipulation",
        affectedContracts: ["0x123...abc", "0x456...def"],
        estimatedRisk: "$2.3M TVL at risk",
      },
    })
  }

  return anomalies
}

function detectPriceDeviations(): AnomalyData[] {
  const anomalies: AnomalyData[] = []

  // Simulate price deviation detection
  if (Math.random() > 0.75) {
    anomalies.push({
      id: `price_${Date.now()}_1`,
      type: "price_deviation",
      severity: "medium",
      protocol: "PancakeSwap",
      chain: "BSC",
      title: "Oracle Price Deviation",
      description: "Token prices showing 8.5% deviation from external oracle sources.",
      impact: "Potential oracle manipulation or data feed issues affecting yield calculations.",
      recommendation: "Verify prices on multiple sources. Delay large transactions until prices normalize.",
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      confidence: 0.79,
      metrics: {
        deviation: "8.5%",
        affectedTokens: ["CAKE", "BNB", "BUSD"],
        oracleSource: "Chainlink",
        alternativePrice: "CoinGecko API",
      },
    })
  }

  return anomalies
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get("severity")
    const protocol = searchParams.get("protocol")
    const chain = searchParams.get("chain")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Run all anomaly detection algorithms
    const allAnomalies = [
      ...detectTVLAnomalies(),
      ...detectYieldAnomalies(),
      ...detectVolumeAnomalies(),
      ...detectGovernanceRisks(),
      ...detectExploitRisks(),
      ...detectPriceDeviations(),
    ]

    // Filter anomalies based on query parameters
    let filteredAnomalies = allAnomalies

    if (severity) {
      filteredAnomalies = filteredAnomalies.filter((a) => a.severity === severity)
    }

    if (protocol) {
      filteredAnomalies = filteredAnomalies.filter((a) => a.protocol.toLowerCase().includes(protocol.toLowerCase()))
    }

    if (chain) {
      filteredAnomalies = filteredAnomalies.filter((a) => a.chain.toLowerCase().includes(chain.toLowerCase()))
    }

    // Sort by severity and timestamp
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    filteredAnomalies.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    // Apply limit
    const limitedAnomalies = filteredAnomalies.slice(0, limit)

    // Calculate summary statistics
    const summary = {
      total: limitedAnomalies.length,
      critical: limitedAnomalies.filter((a) => a.severity === "critical").length,
      high: limitedAnomalies.filter((a) => a.severity === "high").length,
      medium: limitedAnomalies.filter((a) => a.severity === "medium").length,
      low: limitedAnomalies.filter((a) => a.severity === "low").length,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: {
        anomalies: limitedAnomalies,
        summary,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error detecting anomalies:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to detect anomalies",
      },
      { status: 500 },
    )
  }
}
