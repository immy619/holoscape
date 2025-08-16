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

interface ChainNode {
  name: string
  x: number
  y: number
  color: string
  totalIn: number
  totalOut: number
}

export function FlowsVisual() {
  const [flows, setFlows] = useState<FlowData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animatingFlows, setAnimatingFlows] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch("/api/flows")
        const result = await response.json()

        if (result.success) {
          setFlows(result.data)
          // Trigger flow animations
          const newAnimatingFlows = new Set(result.data.map((flow: FlowData) => flow.id))
          setAnimatingFlows(newAnimatingFlows)

          // Clear animations after 3 seconds
          setTimeout(() => setAnimatingFlows(new Set()), 3000)
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
    const interval = setInterval(fetchFlows, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatAmount = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`
    return `$${amount.toLocaleString()}`
  }

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      Ethereum: "#3B82F6",
      Solana: "#9333EA",
      BSC: "#F59E0B",
      Avalanche: "#EF4444",
      Sui: "#06B6D4",
      Aptos: "#10B981",
      Bitcoin: "#F97316",
      Polygon: "#8B5CF6",
      Base: "#0EA5E9",
      Arbitrum: "#2563EB",
    }
    return colors[chain] || "#6B7280"
  }

  // Create chain nodes with calculated positions
  const createChainNodes = (): ChainNode[] => {
    const uniqueChains = Array.from(new Set([...flows.map((f) => f.fromChain), ...flows.map((f) => f.toChain)]))

    const radius = 180
    const centerX = 250
    const centerY = 200

    return uniqueChains.map((chain, index) => {
      const angle = (index / uniqueChains.length) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      const totalOut = flows.filter((f) => f.fromChain === chain).reduce((sum, f) => sum + f.amount, 0)

      const totalIn = flows.filter((f) => f.toChain === chain).reduce((sum, f) => sum + f.amount, 0)

      return {
        name: chain,
        x,
        y,
        color: getChainColor(chain),
        totalIn,
        totalOut,
      }
    })
  }

  const chainNodes = createChainNodes()

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Capital Flow Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            Capital Flow Network
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-between">
          Capital Flow Network
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
            {flows.length} active flows
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 overflow-hidden rounded-lg bg-gradient-to-br from-background/50 to-muted/20 border border-border/30">
          <svg width="500" height="400" className="absolute inset-0">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              </pattern>

              {/* Flow animation gradient */}
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Flow connections */}
            {flows.map((flow) => {
              const fromNode = chainNodes.find((n) => n.name === flow.fromChain)
              const toNode = chainNodes.find((n) => n.name === flow.toChain)

              if (!fromNode || !toNode) return null

              const isAnimating = animatingFlows.has(flow.id)
              const strokeWidth = Math.max(2, Math.min(8, flow.amount / 1000000))

              return (
                <g key={flow.id}>
                  {/* Base connection line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    opacity="0.3"
                  />

                  {/* Animated flow line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={fromNode.color}
                    strokeWidth={strokeWidth}
                    opacity={isAnimating ? "0.8" : "0.4"}
                    strokeDasharray={isAnimating ? "10,5" : "none"}
                    style={
                      isAnimating
                        ? {
                            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          }
                        : undefined
                    }
                  />

                  {/* Flow direction arrow */}
                  <circle
                    cx={fromNode.x + (toNode.x - fromNode.x) * 0.7}
                    cy={fromNode.y + (toNode.y - fromNode.y) * 0.7}
                    r="3"
                    fill={fromNode.color}
                    opacity={isAnimating ? "1" : "0.6"}
                    style={
                      isAnimating
                        ? {
                            animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                          }
                        : undefined
                    }
                  />
                </g>
              )
            })}

            {/* Chain nodes */}
            {chainNodes.map((node) => {
              const nodeSize = Math.max(20, Math.min(40, (node.totalIn + node.totalOut) / 10000000))

              return (
                <g key={node.name}>
                  {/* Node glow effect */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize + 5}
                    fill={node.color}
                    opacity="0.2"
                    style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                  />

                  {/* Main node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize}
                    fill={node.color}
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y - nodeSize - 10}
                    textAnchor="middle"
                    className="fill-foreground text-xs font-medium"
                  >
                    {node.name}
                  </text>

                  {/* Volume indicator */}
                  <text
                    x={node.x}
                    y={node.y + nodeSize + 15}
                    textAnchor="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    {formatAmount(node.totalIn + node.totalOut)}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Flow details overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap gap-2">
              {flows.slice(0, 3).map((flow) => (
                <div
                  key={flow.id}
                  className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 border border-border/50"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getChainColor(flow.fromChain) }} />
                  <span className="text-xs font-medium">
                    {formatAmount(flow.amount)} {flow.token}
                  </span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getChainColor(flow.toChain) }} />
                </div>
              ))}
              {flows.length > 3 && (
                <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 border border-border/50">
                  <span className="text-xs text-muted-foreground">+{flows.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
