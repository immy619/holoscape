"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChainData {
  name: string
  tvl: number
  change_1d: number
  change_7d: number
  topProtocols: string[]
}

export function ChainCards() {
  const [chains, setChains] = useState<ChainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChains = async () => {
      try {
        const response = await fetch("/api/defillama/chains")
        const result = await response.json()

        if (result.success) {
          setChains(result.data)
        } else {
          setError(result.error || "Failed to fetch chain data")
        }
      } catch (err) {
        setError("Network error fetching chain data")
      } finally {
        setLoading(false)
      }
    }

    fetchChains()
  }, [])

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
    return `$${tvl.toLocaleString()}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Chain Overview</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted animate-pulse rounded w-8" />
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </div>
                  <div className="h-3 bg-muted animate-pulse rounded w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Chain Overview</h2>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Chain Overview</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {chains.map((chain) => (
          <Card key={chain.name} className="bg-card border-border hover:bg-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground flex items-center justify-between">
                {chain.name}
                <span className={`text-sm font-normal ${chain.change_1d >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatChange(chain.change_1d)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">TVL</span>
                  <span className="text-lg font-bold text-foreground">{formatTVL(chain.tvl)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">7d Change</span>
                  <span className={`text-sm font-medium ${chain.change_7d >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatChange(chain.change_7d)}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Top Protocols:</div>
                  <div className="text-xs text-foreground">{chain.topProtocols.join(" • ")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
