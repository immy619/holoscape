import { type NextRequest, NextResponse } from "next/server"
import { getAIProvider } from "@/lib/ai-providers"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 })
    }

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

    const systemPrompt = `You are a DeFi analyst. Use the following context data to answer questions about DeFi markets, chains, and opportunities. Keep responses concise and data-driven.

Context Data:
${JSON.stringify(contextData, null, 2)}`

    const aiResponse = await aiProvider.generateText(query, systemPrompt, 500)

    return NextResponse.json({
      success: true,
      data: {
        query,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        provider: aiProvider.name,
      },
    })
  } catch (error) {
    console.error("Error processing AI query:", error)
    return NextResponse.json({ success: false, error: "Failed to process AI query" }, { status: 500 })
  }
}
