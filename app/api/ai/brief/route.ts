import { type NextRequest, NextResponse } from "next/server"
import { getAIProvider } from "@/lib/ai-providers"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    // Fetch context data from our APIs
    const [chainsRes, flowsRes, opportunitiesRes] = await Promise.all([
      fetch(`${request.nextUrl.origin}/api/defillama/chains`),
      fetch(`${request.nextUrl.origin}/api/flows`),
      fetch(`${request.nextUrl.origin}/api/opportunities`),
    ])

    const contextData = {
      chains: await chainsRes.json(),
      flows: await flowsRes.json(),
      opportunities: await opportunitiesRes.json(),
    }

    const aiProvider = getAIProvider()

    const systemPrompt = `Generate a concise 250-word morning brief for DeFi markets based on the provided data. Focus on key trends, notable changes, and actionable insights. Structure it with clear sections and use professional financial language.

Context Data:
${JSON.stringify(contextData, null, 2)}`

    const briefContent = await aiProvider.generateText(
      "Generate today's DeFi morning brief based on the current market data.",
      systemPrompt,
      400,
    )

    return NextResponse.json({
      success: true,
      data: {
        brief: briefContent,
        timestamp: new Date().toISOString(),
        generatedAt: new Date().toLocaleString(),
        provider: aiProvider.name,
      },
    })
  } catch (error) {
    console.error("Error generating AI brief:", error)
    return NextResponse.json({ success: false, error: "Failed to generate AI brief" }, { status: 500 })
  }
}
