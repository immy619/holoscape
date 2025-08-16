import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

// Fee structures by chain (in USD)
const CHAIN_FEES = {
  Ethereum: {
    gasPerTx: 25, // Average gas cost per transaction
    bridgeFee: 15, // Bridge fee to/from Ethereum
    slippage: 0.003, // 0.3% average slippage
    withdrawalFee: 30, // Withdrawal gas cost
  },
  Solana: {
    gasPerTx: 0.01,
    bridgeFee: 5,
    slippage: 0.002,
    withdrawalFee: 0.02,
  },
  BSC: {
    gasPerTx: 0.5,
    bridgeFee: 3,
    slippage: 0.005,
    withdrawalFee: 1,
  },
  Avalanche: {
    gasPerTx: 2,
    bridgeFee: 8,
    slippage: 0.003,
    withdrawalFee: 3,
  },
  Sui: {
    gasPerTx: 0.1,
    bridgeFee: 4,
    slippage: 0.004,
    withdrawalFee: 0.2,
  },
  Aptos: {
    gasPerTx: 0.05,
    bridgeFee: 4,
    slippage: 0.004,
    withdrawalFee: 0.1,
  },
  Base: {
    gasPerTx: 0.8,
    bridgeFee: 2,
    slippage: 0.002,
    withdrawalFee: 1.5,
  },
  Arbitrum: {
    gasPerTx: 1.2,
    bridgeFee: 5,
    slippage: 0.002,
    withdrawalFee: 2,
  },
  Polygon: {
    gasPerTx: 0.3,
    bridgeFee: 3,
    slippage: 0.003,
    withdrawalFee: 0.5,
  },
}

// Protocol-specific fees
const PROTOCOL_FEES = {
  Aave: {
    depositFee: 0,
    withdrawalFee: 0,
    performanceFee: 0,
    managementFee: 0,
  },
  Compound: {
    depositFee: 0,
    withdrawalFee: 0,
    performanceFee: 0,
    managementFee: 0,
  },
  "Uniswap V3": {
    depositFee: 0.003, // 0.3% swap fee
    withdrawalFee: 0.003,
    performanceFee: 0,
    managementFee: 0,
  },
  Curve: {
    depositFee: 0.0004, // 0.04% swap fee
    withdrawalFee: 0.0004,
    performanceFee: 0,
    managementFee: 0,
  },
  Convex: {
    depositFee: 0,
    withdrawalFee: 0,
    performanceFee: 0.17, // 17% performance fee
    managementFee: 0,
  },
  Yearn: {
    depositFee: 0,
    withdrawalFee: 0,
    performanceFee: 0.2, // 20% performance fee
    managementFee: 0.02, // 2% management fee
  },
  Raydium: {
    depositFee: 0.0025, // 0.25% swap fee
    withdrawalFee: 0.0025,
    performanceFee: 0,
    managementFee: 0,
  },
  Orca: {
    depositFee: 0.003,
    withdrawalFee: 0.003,
    performanceFee: 0,
    managementFee: 0,
  },
  PancakeSwap: {
    depositFee: 0.0025,
    withdrawalFee: 0.0025,
    performanceFee: 0,
    managementFee: 0,
  },
  Venus: {
    depositFee: 0,
    withdrawalFee: 0,
    performanceFee: 0,
    managementFee: 0,
  },
  "Trader Joe": {
    depositFee: 0.003,
    withdrawalFee: 0.003,
    performanceFee: 0,
    managementFee: 0,
  },
  Benqi: {
    depositFee: 0,
    withdrawalFee: 0,
    performanceFee: 0,
    managementFee: 0,
  },
}

interface FeeCalculationParams {
  protocol: string
  chain: string
  apy: number
  tvl: number
  investmentAmount: number
  holdingPeriod: number // in days
}

function calculateFeeAdjustedYield(params: FeeCalculationParams) {
  const { protocol, chain, apy, tvl, investmentAmount, holdingPeriod } = params

  const chainFees = CHAIN_FEES[chain as keyof typeof CHAIN_FEES] || CHAIN_FEES.Ethereum
  const protocolFees = PROTOCOL_FEES[protocol as keyof typeof PROTOCOL_FEES] || PROTOCOL_FEES.Aave

  // Calculate gross yield
  const grossYield = ((investmentAmount * apy) / 100) * (holdingPeriod / 365)

  // Calculate fixed fees
  const depositGasFee = chainFees.gasPerTx
  const withdrawalGasFee = chainFees.withdrawalFee
  const bridgeFees = chainFees.bridgeFee * 2 // Assume round trip

  // Calculate percentage-based fees
  const depositSlippage = investmentAmount * chainFees.slippage
  const withdrawalSlippage = (investmentAmount + grossYield) * chainFees.slippage
  const protocolDepositFee = investmentAmount * protocolFees.depositFee
  const protocolWithdrawalFee = (investmentAmount + grossYield) * protocolFees.withdrawalFee

  // Calculate performance and management fees
  const performanceFee = grossYield * protocolFees.performanceFee
  const managementFee = investmentAmount * protocolFees.managementFee * (holdingPeriod / 365)

  // Total fees
  const totalFees =
    depositGasFee +
    withdrawalGasFee +
    bridgeFees +
    depositSlippage +
    withdrawalSlippage +
    protocolDepositFee +
    protocolWithdrawalFee +
    performanceFee +
    managementFee

  // Net yield
  const netYield = grossYield - totalFees
  const netAPY = (netYield / investmentAmount) * (365 / holdingPeriod) * 100

  // Fee breakdown
  const feeBreakdown = {
    gasFees: depositGasFee + withdrawalGasFee,
    bridgeFees,
    slippageFees: depositSlippage + withdrawalSlippage,
    protocolFees: protocolDepositFee + protocolWithdrawalFee,
    performanceFee,
    managementFee,
    totalFees,
  }

  return {
    grossAPY: apy,
    netAPY: Math.max(0, netAPY), // Ensure non-negative
    grossYield,
    netYield: Math.max(0, netYield),
    feeBreakdown,
    feeImpact: ((apy - netAPY) / apy) * 100, // Percentage impact of fees
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      protocol,
      chain,
      apy,
      tvl,
      investmentAmount = 10000, // Default $10k investment
      holdingPeriod = 365, // Default 1 year
    } = body

    if (!protocol || !chain || !apy) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: protocol, chain, apy",
        },
        { status: 400 },
      )
    }

    const calculation = calculateFeeAdjustedYield({
      protocol,
      chain,
      apy,
      tvl,
      investmentAmount,
      holdingPeriod,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...calculation,
        parameters: {
          protocol,
          chain,
          investmentAmount,
          holdingPeriod,
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error calculating fee-adjusted yield:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate fee-adjusted yield",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const protocol = searchParams.get("protocol")
    const chain = searchParams.get("chain")
    const apy = Number.parseFloat(searchParams.get("apy") || "0")
    const tvl = Number.parseFloat(searchParams.get("tvl") || "0")
    const investmentAmount = Number.parseFloat(searchParams.get("amount") || "10000")
    const holdingPeriod = Number.parseFloat(searchParams.get("period") || "365")

    if (!protocol || !chain || !apy) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: protocol, chain, apy",
        },
        { status: 400 },
      )
    }

    const calculation = calculateFeeAdjustedYield({
      protocol,
      chain,
      apy,
      tvl,
      investmentAmount,
      holdingPeriod,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...calculation,
        parameters: {
          protocol,
          chain,
          investmentAmount,
          holdingPeriod,
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error calculating fee-adjusted yield:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate fee-adjusted yield",
      },
      { status: 500 },
    )
  }
}
