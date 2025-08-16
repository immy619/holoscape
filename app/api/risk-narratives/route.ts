import { type NextRequest, NextResponse } from "next/server"
import { getAIProvider } from "@/lib/ai-providers"

export const runtime = "edge"

interface RiskNarrativeRequest {
  protocol: string
  riskScore: number
  riskBreakdown?: any
  apy: number
  tvl: number
  chain: string
  category: string
}

function generateRiskNarrativePrompt(data: RiskNarrativeRequest): string {
  const { protocol, riskScore, riskBreakdown, apy, tvl, chain, category } = data

  let breakdownText = ""
  if (riskBreakdown) {
    breakdownText = `
Risk Factor Breakdown:
- Exploit History: ${riskBreakdown.exploitHistory?.score}/10 (${riskBreakdown.exploitHistory?.description})
- Oracle Dependency: ${riskBreakdown.oracleDependency?.score}/10 (${riskBreakdown.oracleDependency?.description})
- TVL Concentration: ${riskBreakdown.tvlConcentration?.score}/10 (${riskBreakdown.tvlConcentration?.description})
- Code Audit: ${riskBreakdown.codeAudit?.score}/10 (${riskBreakdown.codeAudit?.description})
- Time in Market: ${riskBreakdown.timeInMarket?.score}/10 (${riskBreakdown.timeInMarket?.description})
- Governance Risk: ${riskBreakdown.governanceRisk?.score}/10 (${riskBreakdown.governanceRisk?.description})
- Liquidity Risk: ${riskBreakdown.liquidityRisk?.score}/10 (${riskBreakdown.liquidityRisk?.description})
`
  }

  return `Analyze the DeFi investment opportunity for ${protocol} and provide a clear, actionable risk narrative.

Protocol Details:
- Name: ${protocol}
- Chain: ${chain}
- Category: ${category}
- APY: ${apy.toFixed(2)}%
- TVL: $${(tvl / 1e6).toFixed(1)}M
- Overall Risk Score: ${riskScore}/100

${breakdownText}

Please provide a concise risk narrative (2-3 paragraphs) that:
1. Explains the key risk factors in simple terms
2. Provides actionable insights for investors
3. Suggests appropriate investment strategies based on risk level
4. Mentions any specific concerns or advantages

Write in a professional but accessible tone, avoiding technical jargon where possible.`
}

function generateDemoRiskNarrative(data: RiskNarrativeRequest): string {
  const { protocol, riskScore, apy, tvl, chain, category } = data

  let riskLevel = "Low"
  let riskColor = "🟢"
  let recommendation = "suitable for conservative investors"

  if (riskScore > 60) {
    riskLevel = "High"
    riskColor = "🔴"
    recommendation = "only recommended for experienced DeFi users"
  } else if (riskScore > 30) {
    riskLevel = "Medium"
    riskColor = "🟡"
    recommendation = "suitable for moderate risk tolerance"
  }

  return `${riskColor} **${riskLevel} Risk Assessment for ${protocol}**

**Risk Analysis:** ${protocol} on ${chain} presents a ${riskLevel.toLowerCase()} risk profile with a score of ${riskScore}/100. This ${category.toLowerCase()} protocol offers ${apy.toFixed(1)}% APY with $${(tvl / 1e6).toFixed(1)}M in total value locked. ${riskScore > 60 ? "The elevated risk stems from factors like recent exploits, high oracle dependency, or governance centralization." : riskScore > 30 ? "The moderate risk is balanced by established track record and reasonable security measures." : "The low risk profile is supported by strong security audits, decentralized governance, and proven stability."}

**Investment Strategy:** This opportunity is ${recommendation}. ${riskScore > 60 ? "Consider limiting exposure to <5% of portfolio and monitor closely for any protocol changes." : riskScore > 30 ? "Suitable for 10-20% allocation as part of a diversified DeFi strategy." : "Can form a core holding (20-40%) in a DeFi-focused portfolio."} Always conduct your own research and consider your risk tolerance before investing.

*This is a demo narrative. Configure a real AI provider for detailed risk analysis.*`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocol, riskScore, riskBreakdown, apy, tvl, chain, category } = body

    if (!protocol || riskScore === undefined || !apy || !tvl || !chain || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: protocol, riskScore, apy, tvl, chain, category",
        },
        { status: 400 },
      )
    }

    const aiProvider = getAIProvider()
    let narrative = ""

    if (aiProvider.name === "Demo") {
      // Use demo narrative for demo mode
      narrative = generateDemoRiskNarrative({ protocol, riskScore, riskBreakdown, apy, tvl, chain, category })
    } else {
      // Use AI provider for real narrative generation
      const prompt = generateRiskNarrativePrompt({ protocol, riskScore, riskBreakdown, apy, tvl, chain, category })
      const systemPrompt =
        "You are a DeFi risk analyst providing clear, actionable investment guidance. Focus on practical insights and avoid overly technical language."

      narrative = await aiProvider.generateText(prompt, systemPrompt, 800)
    }

    return NextResponse.json({
      success: true,
      data: {
        protocol,
        riskScore,
        narrative,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating risk narrative:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate risk narrative",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const protocol = searchParams.get("protocol")
    const riskScore = Number.parseFloat(searchParams.get("riskScore") || "0")
    const apy = Number.parseFloat(searchParams.get("apy") || "0")
    const tvl = Number.parseFloat(searchParams.get("tvl") || "0")
    const chain = searchParams.get("chain") || ""
    const category = searchParams.get("category") || ""

    if (!protocol || !riskScore || !apy || !tvl || !chain || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: protocol, riskScore, apy, tvl, chain, category",
        },
        { status: 400 },
      )
    }

    const aiProvider = getAIProvider()
    let narrative = ""

    if (aiProvider.name === "Demo") {
      narrative = generateDemoRiskNarrative({ protocol, riskScore, apy, tvl, chain, category })
    } else {
      const prompt = generateRiskNarrativePrompt({ protocol, riskScore, apy, tvl, chain, category })
      const systemPrompt =
        "You are a DeFi risk analyst providing clear, actionable investment guidance. Focus on practical insights and avoid overly technical language."

      narrative = await aiProvider.generateText(prompt, systemPrompt, 800)
    }

    return NextResponse.json({
      success: true,
      data: {
        protocol,
        riskScore,
        narrative,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating risk narrative:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate risk narrative",
      },
      { status: 500 },
    )
  }
}
