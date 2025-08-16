import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

// Risk scoring factors and weights
const RISK_FACTORS = {
  exploitHistory: 0.25, // 25% weight - protocol exploit history
  oracleDependency: 0.2, // 20% weight - oracle reliability
  tvlConcentration: 0.15, // 15% weight - TVL distribution
  codeAudit: 0.15, // 15% weight - audit quality
  timeInMarket: 0.1, // 10% weight - protocol maturity
  governanceRisk: 0.1, // 10% weight - decentralization
  liquidityRisk: 0.05, // 5% weight - liquidity depth
}

// Mock risk data for protocols
const protocolRiskData = {
  Aave: {
    exploitHistory: 1, // 0-10 scale (0 = no exploits, 10 = multiple major exploits)
    oracleDependency: 2, // 0-10 scale (0 = no oracle risk, 10 = high oracle risk)
    tvlConcentration: 2, // 0-10 scale (0 = well distributed, 10 = highly concentrated)
    codeAudit: 1, // 0-10 scale (0 = multiple audits, 10 = no audits)
    timeInMarket: 1, // 0-10 scale (0 = >3 years, 10 = <6 months)
    governanceRisk: 3, // 0-10 scale (0 = fully decentralized, 10 = centralized)
    liquidityRisk: 2, // 0-10 scale (0 = deep liquidity, 10 = shallow liquidity)
  },
  Compound: {
    exploitHistory: 2,
    oracleDependency: 3,
    tvlConcentration: 3,
    codeAudit: 1,
    timeInMarket: 1,
    governanceRisk: 2,
    liquidityRisk: 2,
  },
  "Uniswap V3": {
    exploitHistory: 1,
    oracleDependency: 4,
    tvlConcentration: 2,
    codeAudit: 1,
    timeInMarket: 2,
    governanceRisk: 3,
    liquidityRisk: 1,
  },
  Curve: {
    exploitHistory: 3,
    oracleDependency: 5,
    tvlConcentration: 4,
    codeAudit: 2,
    timeInMarket: 1,
    governanceRisk: 4,
    liquidityRisk: 3,
  },
  Convex: {
    exploitHistory: 2,
    oracleDependency: 6,
    tvlConcentration: 5,
    codeAudit: 3,
    timeInMarket: 3,
    governanceRisk: 5,
    liquidityRisk: 4,
  },
  Yearn: {
    exploitHistory: 4,
    oracleDependency: 6,
    tvlConcentration: 6,
    codeAudit: 2,
    timeInMarket: 2,
    governanceRisk: 4,
    liquidityRisk: 5,
  },
  Raydium: {
    exploitHistory: 2,
    oracleDependency: 4,
    tvlConcentration: 5,
    codeAudit: 4,
    timeInMarket: 4,
    governanceRisk: 6,
    liquidityRisk: 3,
  },
  Orca: {
    exploitHistory: 1,
    oracleDependency: 3,
    tvlConcentration: 4,
    codeAudit: 3,
    timeInMarket: 4,
    governanceRisk: 5,
    liquidityRisk: 3,
  },
  PancakeSwap: {
    exploitHistory: 3,
    oracleDependency: 5,
    tvlConcentration: 6,
    codeAudit: 4,
    timeInMarket: 3,
    governanceRisk: 6,
    liquidityRisk: 4,
  },
  Venus: {
    exploitHistory: 5,
    oracleDependency: 7,
    tvlConcentration: 7,
    codeAudit: 5,
    timeInMarket: 3,
    governanceRisk: 7,
    liquidityRisk: 6,
  },
  "Trader Joe": {
    exploitHistory: 2,
    oracleDependency: 4,
    tvlConcentration: 5,
    codeAudit: 3,
    timeInMarket: 4,
    governanceRisk: 5,
    liquidityRisk: 4,
  },
  Benqi: {
    exploitHistory: 1,
    oracleDependency: 3,
    tvlConcentration: 4,
    codeAudit: 3,
    timeInMarket: 4,
    governanceRisk: 4,
    liquidityRisk: 3,
  },
}

function calculateRiskScore(protocol: string): number {
  const riskData = protocolRiskData[protocol as keyof typeof protocolRiskData]

  if (!riskData) {
    // Default risk score for unknown protocols
    return 65 // Medium-high risk
  }

  let weightedScore = 0

  // Calculate weighted risk score
  weightedScore += riskData.exploitHistory * RISK_FACTORS.exploitHistory
  weightedScore += riskData.oracleDependency * RISK_FACTORS.oracleDependency
  weightedScore += riskData.tvlConcentration * RISK_FACTORS.tvlConcentration
  weightedScore += riskData.codeAudit * RISK_FACTORS.codeAudit
  weightedScore += riskData.timeInMarket * RISK_FACTORS.timeInMarket
  weightedScore += riskData.governanceRisk * RISK_FACTORS.governanceRisk
  weightedScore += riskData.liquidityRisk * RISK_FACTORS.liquidityRisk

  // Convert to 0-100 scale (multiply by 10)
  const riskScore = Math.round(weightedScore * 10)

  return Math.max(0, Math.min(100, riskScore))
}

function getRiskBreakdown(protocol: string) {
  const riskData = protocolRiskData[protocol as keyof typeof protocolRiskData]

  if (!riskData) {
    return null
  }

  return {
    exploitHistory: {
      score: riskData.exploitHistory,
      weight: RISK_FACTORS.exploitHistory,
      description: "Historical security incidents and exploits",
    },
    oracleDependency: {
      score: riskData.oracleDependency,
      weight: RISK_FACTORS.oracleDependency,
      description: "Reliance on external price oracles",
    },
    tvlConcentration: {
      score: riskData.tvlConcentration,
      weight: RISK_FACTORS.tvlConcentration,
      description: "Concentration of total value locked",
    },
    codeAudit: {
      score: riskData.codeAudit,
      weight: RISK_FACTORS.codeAudit,
      description: "Code audit quality and coverage",
    },
    timeInMarket: {
      score: riskData.timeInMarket,
      weight: RISK_FACTORS.timeInMarket,
      description: "Protocol maturity and track record",
    },
    governanceRisk: {
      score: riskData.governanceRisk,
      weight: RISK_FACTORS.governanceRisk,
      description: "Decentralization and governance structure",
    },
    liquidityRisk: {
      score: riskData.liquidityRisk,
      weight: RISK_FACTORS.liquidityRisk,
      description: "Market liquidity and depth",
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const protocol = searchParams.get("protocol")

    if (protocol) {
      // Return risk score for specific protocol
      const riskScore = calculateRiskScore(protocol)
      const breakdown = getRiskBreakdown(protocol)

      return NextResponse.json({
        success: true,
        data: {
          protocol,
          riskScore,
          breakdown,
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Return risk scores for all protocols
    const allRiskScores = Object.keys(protocolRiskData).map((protocol) => ({
      protocol,
      riskScore: calculateRiskScore(protocol),
      breakdown: getRiskBreakdown(protocol),
    }))

    return NextResponse.json({
      success: true,
      data: allRiskScores,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error calculating risk scores:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate risk scores",
      },
      { status: 500 },
    )
  }
}
