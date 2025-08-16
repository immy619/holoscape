import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

// Mock opportunities data for risk-reward analysis
const generateMockOpportunities = async () => {
  const protocols = [
    "Aave",
    "Compound",
    "Uniswap V3",
    "Curve",
    "Convex",
    "Yearn",
    "Raydium",
    "Orca",
    "PancakeSwap",
    "Venus",
    "Trader Joe",
    "Benqi",
  ]

  const chains = ["Ethereum", "Solana", "BSC", "Avalanche", "Sui", "Aptos"]

  // Fetch risk scores for all protocols
  let riskScores: Record<string, number> = {}
  try {
    const riskResponse = await fetch(
      `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/risk-scoring`,
    )
    const riskData = await riskResponse.json()
    if (riskData.success) {
      riskScores = riskData.data.reduce((acc: Record<string, number>, item: any) => {
        acc[item.protocol] = item.riskScore
        return acc
      }, {})
    }
  } catch (error) {
    console.error("Failed to fetch risk scores:", error)
  }

  // Generate opportunities with fee-adjusted yields
  const opportunities = []

  for (let index = 0; index < protocols.length; index++) {
    const protocol = protocols[index]
    const chain = chains[Math.floor(Math.random() * chains.length)]
    const grossAPY = Math.random() * 25 + 2 // 2-27% APY
    const tvl = Math.floor(Math.random() * 1000000000) + 10000000 // 10M - 1B TVL

    // Calculate fee-adjusted yield
    let netAPY = grossAPY
    let feeImpact = 0

    try {
      const feeResponse = await fetch(
        `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/fee-calculator?protocol=${encodeURIComponent(protocol)}&chain=${encodeURIComponent(chain)}&apy=${grossAPY}&tvl=${tvl}`,
      )
      const feeData = await feeResponse.json()

      if (feeData.success) {
        netAPY = feeData.data.netAPY
        feeImpact = feeData.data.feeImpact
      }
    } catch (error) {
      console.error(`Failed to calculate fees for ${protocol}:`, error)
    }

    opportunities.push({
      id: `opp_${index + 1}`,
      protocol,
      chain,
      apy: grossAPY, // Keep original for backward compatibility
      grossAPY, // Added gross APY field
      netAPY, // Added net APY field
      feeImpact, // Added fee impact percentage
      risk: riskScores[protocol] || Math.random() * 10 + 1,
      tvl,
      category: ["Lending", "DEX", "Yield Farming", "Staking"][Math.floor(Math.random() * 4)],
      token: ["USDC", "USDT", "ETH", "BTC", "SOL", "AVAX"][Math.floor(Math.random() * 6)],
      riskScore: riskScores[protocol] || 65,
    })
  }

  return opportunities
}

export async function GET(request: NextRequest) {
  try {
    const opportunities = await generateMockOpportunities()

    return NextResponse.json({
      success: true,
      data: opportunities,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating opportunities data:", error)
    return NextResponse.json({ success: false, error: "Failed to generate opportunities data" }, { status: 500 })
  }
}
