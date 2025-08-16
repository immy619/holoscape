import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

// Mock cross-chain flow data
const generateMockFlows = () => {
  const chains = ["Ethereum", "Solana", "BSC", "Avalanche", "Sui", "Aptos"]
  const flows = []

  for (let i = 0; i < 20; i++) {
    const fromChain = chains[Math.floor(Math.random() * chains.length)]
    let toChain = chains[Math.floor(Math.random() * chains.length)]
    while (toChain === fromChain) {
      toChain = chains[Math.floor(Math.random() * chains.length)]
    }

    flows.push({
      id: `flow_${i + 1}`,
      fromChain,
      toChain,
      amount: Math.floor(Math.random() * 10000000) + 100000,
      token: ["USDC", "USDT", "ETH", "BTC", "SOL"][Math.floor(Math.random() * 5)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      protocol: ["Wormhole", "LayerZero", "Axelar", "Multichain"][Math.floor(Math.random() * 4)],
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    })
  }

  return flows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const flows = generateMockFlows()

    return NextResponse.json({
      success: true,
      data: flows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating flow data:", error)
    return NextResponse.json({ success: false, error: "Failed to generate flow data" }, { status: 500 })
  }
}
