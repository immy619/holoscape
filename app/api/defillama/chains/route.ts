import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const TRACKED_CHAINS = [
  "Ethereum",
  "Solana",
  "BSC",
  "Hyperliquid",
  "Avalanche",
  "Sui",
  "Cardano",
  "Aptos",
  "Base",
  "Arbitrum",
  "Bitcoin",
  "Polygon",
  "Bitlayer",
]

// Mock top protocols data
const mockTopProtocols = {
  Ethereum: ["Uniswap", "Aave", "Compound"],
  Solana: ["Raydium", "Orca", "Marinade"],
  BSC: ["PancakeSwap", "Venus", "Alpaca"],
  Hyperliquid: ["Hyperliquid DEX", "HLP", "Vaults"],
  Avalanche: ["Trader Joe", "Aave", "Benqi"],
  Sui: ["Cetus", "Kriya", "Turbos"],
  Cardano: ["Minswap", "SundaeSwap", "WingRiders"],
  Aptos: ["PancakeSwap", "Thala", "Aries"],
  Base: ["Uniswap", "Aerodrome", "Compound"],
  Arbitrum: ["GMX", "Camelot", "Radiant"],
  Bitcoin: ["Lightning Network", "Stacks", "RSK"],
  Polygon: ["QuickSwap", "Aave", "Curve"],
  Bitlayer: ["BitSwap", "LayerFi", "BitVault"],
  // Removed BNB Chain protocols since "BSC" is BNB Chain
}

export async function GET(request: NextRequest) {
  try {
    // Fetch data from DefiLlama
    const response = await fetch("https://api.llama.fi/chains", {
      headers: {
        "User-Agent": "Holoscape-MVP/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`DefiLlama API error: ${response.status}`)
    }

    const allChains = await response.json()

    console.log("[v0] Available chains from DefiLlama:", allChains.map((c: any) => c.name).sort())
    console.log(
      "[v0] Looking for Binance in chains:",
      allChains.find((c: any) => c.name.toLowerCase().includes("binance") || c.name.toLowerCase().includes("bnb")),
    )

    const chainNameMapping: Record<string, string> = {
      BSC: "Binance",
    }

    // Filter and enhance with mock protocol data
    const trackedChains = allChains
      .filter((chain: any) => {
        const mappedName = chainNameMapping[chain.name] || chain.name
        return TRACKED_CHAINS.includes(chain.name) || TRACKED_CHAINS.includes(mappedName)
      })
      .map((chain: any) => {
        // Map Binance back to BSC for display consistency
        const displayName = chain.name === "Binance" ? "BSC" : chain.name
        return {
          name: displayName,
          tvl: chain.tvl,
          change_1d: chain.change_1d || 0,
          change_7d: chain.change_7d || 0,
          topProtocols: mockTopProtocols[displayName as keyof typeof mockTopProtocols] || [],
        }
      })
      .sort((a: any, b: any) => b.tvl - a.tvl)

    console.log(
      "[v0] Filtered tracked chains:",
      trackedChains.map((c: any) => c.name),
    )

    return NextResponse.json({
      success: true,
      data: trackedChains,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching chain data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch chain data" }, { status: 500 })
  }
}
