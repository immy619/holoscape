"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FlowData {
  id: string
  fromChain: string
  toChain: string
  amount: number
  token: string
  timestamp: string
  protocol: string
  txHash: string
}

export function FlowsTable() {
  const [flows, setFlows] = useState<FlowData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch("/api/flows")
        const result = await response.json()

        if (result.success) {
          setFlows(result.data)
        } else {
          setError(result.error || "Failed to fetch flow data")
        }
      } catch (err) {
        setError("Network error fetching flow data")
      } finally {
        setLoading(false)
      }
    }

    fetchFlows()

    // Refresh every 60 seconds
    const interval = setInterval(fetchFlows, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatAmount = (amount: number) => {
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`
    return `$${amount.toLocaleString()}`
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m ago`
    return `${diffMinutes}m ago`
  }

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      Ethereum: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Solana: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      BSC: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Avalanche: "bg-red-500/20 text-red-400 border-red-500/30",
      Sui: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      Aptos: "bg-green-500/20 text-green-400 border-green-500/30",
    }
    return colors[chain] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const getProtocolColor = (protocol: string) => {
    const colors: Record<string, string> = {
      Wormhole: "bg-indigo-500/20 text-indigo-400",
      LayerZero: "bg-pink-500/20 text-pink-400",
      Axelar: "bg-orange-500/20 text-orange-400",
      Multichain: "bg-teal-500/20 text-teal-400",
    }
    return colors[protocol] || "bg-gray-500/20 text-gray-400"
  }

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cross-Chain Capital Flows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10 border border-border/30"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                </div>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cross-Chain Capital Flows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-between">
          Cross-Chain Capital Flows
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
            {flows.length} live flows
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {flows.map((flow, index) => (
            <div
              key={flow.id}
              className="group flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10 border border-border/30 hover:from-muted/30 hover:to-muted/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              <div className="flex items-center space-x-4">
                <Badge
                  className={`${getChainColor(flow.fromChain)} font-medium px-3 py-1 rounded-full`}
                  variant="outline"
                >
                  {flow.fromChain}
                </Badge>
                <div className="text-primary font-bold text-lg">→</div>
                <Badge
                  className={`${getChainColor(flow.toChain)} font-medium px-3 py-1 rounded-full`}
                  variant="outline"
                >
                  {flow.toChain}
                </Badge>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-lg font-bold text-foreground">{formatAmount(flow.amount)}</span>
                  <Badge variant="secondary" className="text-xs bg-secondary/50 text-secondary-foreground font-medium">
                    {flow.token}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-right">
                <Badge className={`${getProtocolColor(flow.protocol)} font-medium px-3 py-1`} variant="secondary">
                  {flow.protocol}
                </Badge>
                <div className="text-sm text-muted-foreground font-medium">{formatTime(flow.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>

        {flows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg font-medium">No recent cross-chain flows</div>
            <div className="text-sm mt-2">Waiting for new transactions...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
