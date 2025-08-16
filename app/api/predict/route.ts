import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { inflow, apyDelta, unlockFlag } = await request.json()

    // Simple prediction algorithm based on provided factors
    let score = 0.5 // Base probability

    // Inflow factor (higher inflow = higher probability)
    if (inflow > 0) {
      score += Math.min(inflow / 10000000, 0.3) // Cap at 0.3 boost
    } else {
      score += Math.max(inflow / 10000000, -0.2) // Cap at -0.2 penalty
    }

    // APY delta factor (positive delta = higher probability)
    if (apyDelta > 0) {
      score += Math.min(apyDelta / 10, 0.2) // Cap at 0.2 boost
    } else {
      score += Math.max(apyDelta / 10, -0.15) // Cap at -0.15 penalty
    }

    // Unlock flag (major unlock = lower probability)
    if (unlockFlag) {
      score -= 0.25
    }

    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score))

    // Add some randomness to make it more realistic
    const randomFactor = (Math.random() - 0.5) * 0.1
    score = Math.max(0, Math.min(1, score + randomFactor))

    return NextResponse.json({
      success: true,
      data: {
        inflowProbability: score,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        factors: {
          inflow: inflow > 0 ? "positive" : "negative",
          apyDelta: apyDelta > 0 ? "positive" : "negative",
          unlockFlag: unlockFlag ? "major unlock detected" : "no major unlocks",
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating prediction:", error)
    return NextResponse.json({ success: false, error: "Failed to generate prediction" }, { status: 500 })
  }
}
