"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, TrendingUp, Activity, DollarSign, Gavel, RefreshCw, Clock, Target } from "lucide-react"

interface AnomalyData {
  id: string
  type: "tvl_spike" | "yield_anomaly" | "volume_surge" | "price_deviation" | "governance_risk" | "exploit_risk"
  severity: "low" | "medium" | "high" | "critical"
  protocol: string
  chain: string
  title: string
  description: string
  impact: string
  recommendation: string
  timestamp: string
  confidence: number
  metrics: Record<string, any>
}

interface AnomalySummary {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  lastUpdated: string
}

export function AnomalyAlerts() {
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([])
  const [summary, setSummary] = useState<AnomalySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchAnomalies = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedSeverity) params.append("severity", selectedSeverity)

      const response = await fetch(`/api/anomaly-detection?${params}`)
      const result = await response.json()

      if (result.success) {
        setAnomalies(result.data.anomalies)
        setSummary(result.data.summary)
        setError(null)
      } else {
        setError(result.error || "Failed to fetch anomalies")
      }
    } catch (err) {
      setError("Network error fetching anomalies")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnomalies()
  }, [selectedSeverity])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAnomalies, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh, selectedSeverity])

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    }
    return colors[severity as keyof typeof colors] || colors.medium
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      tvl_spike: DollarSign,
      yield_anomaly: TrendingUp,
      volume_surge: Activity,
      price_deviation: Target,
      governance_risk: Gavel,
      exploit_risk: Shield,
    }
    return icons[type as keyof typeof icons] || AlertTriangle
  }

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      Ethereum: "from-blue-500 to-blue-600",
      Solana: "from-purple-500 to-purple-600",
      BSC: "from-yellow-500 to-yellow-600",
      Avalanche: "from-red-500 to-red-600",
      Sui: "from-cyan-500 to-cyan-600",
      Aptos: "from-teal-500 to-teal-600",
      Arbitrum: "from-blue-400 to-blue-500",
      Base: "from-blue-600 to-blue-700",
      Polygon: "from-purple-600 to-purple-700",
    }
    return colors[chain] || "from-gray-500 to-gray-600"
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-500/30 border-t-red-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-red-400">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Alerts</p>
                  <p className="text-2xl font-bold text-white">{summary.total}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-300">Critical</p>
                  <p className="text-2xl font-bold text-red-400">{summary.critical}</p>
                </div>
                <Shield className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-300">High</p>
                  <p className="text-2xl font-bold text-orange-400">{summary.high}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300">Medium</p>
                  <p className="text-2xl font-bold text-yellow-400">{summary.medium}</p>
                </div>
                <Activity className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Low</p>
                  <p className="text-2xl font-bold text-blue-400">{summary.low}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anomaly Detection System
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">Filter by severity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSeverity(null)}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    !selectedSeverity
                      ? "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  All
                </button>
                {["critical", "high", "medium", "low"].map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setSelectedSeverity(severity)}
                    className={`px-3 py-1 rounded text-sm transition-all capitalize ${
                      selectedSeverity === severity
                        ? getSeverityColor(severity).replace("bg-", "bg-").replace("/20", "/30")
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-all ${
                  autoRefresh
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
                Auto Refresh
              </button>
              <button
                onClick={fetchAnomalies}
                className="flex items-center gap-2 px-3 py-1 rounded text-sm text-slate-400 hover:text-slate-300 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Anomaly List */}
      <div className="space-y-4">
        {anomalies.length === 0 ? (
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-400 mb-2">All Clear!</h3>
              <p className="text-slate-400">No anomalies detected at this time. System is monitoring continuously.</p>
            </CardContent>
          </Card>
        ) : (
          anomalies.map((anomaly) => {
            const Icon = getTypeIcon(anomaly.type)
            return (
              <Card
                key={anomaly.id}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getSeverityColor(anomaly.severity).replace("text-", "bg-").replace("border-", "").split(" ")[0]}/10`}
                      >
                        <Icon className={`w-5 h-5 ${getSeverityColor(anomaly.severity).split(" ")[1]}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{anomaly.title}</h3>
                          <Badge className={`${getSeverityColor(anomaly.severity)} border capitalize`}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>{anomaly.protocol}</span>
                          <div
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${getChainColor(anomaly.chain)}`}
                          ></div>
                          <span>{anomaly.chain}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{formatTimestamp(anomaly.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Confidence</div>
                      <div className="text-lg font-semibold text-white">{(anomaly.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Description</h4>
                      <p className="text-slate-200">{anomaly.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Impact</h4>
                      <p className="text-slate-200">{anomaly.impact}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Recommendation</h4>
                      <p
                        className={`font-medium ${
                          anomaly.severity === "critical"
                            ? "text-red-400"
                            : anomaly.severity === "high"
                              ? "text-orange-400"
                              : "text-slate-200"
                        }`}
                      >
                        {anomaly.recommendation}
                      </p>
                    </div>

                    {Object.keys(anomaly.metrics).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(anomaly.metrics).map(([key, value]) => (
                            <div key={key} className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="text-xs text-slate-400 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div className="text-sm font-medium text-white">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
