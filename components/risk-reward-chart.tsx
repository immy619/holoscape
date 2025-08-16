"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, TrendingUp, Shield, DollarSign, Target, Calculator, FileText, Loader2 } from "lucide-react"

interface OpportunityData {
  id: string
  protocol: string
  chain: string
  apy: number
  grossAPY?: number
  netAPY?: number
  feeImpact?: number
  risk: number
  tvl: number
  category: string
  token: string
  riskScore?: number
}

interface RiskNarrative {
  protocol: string
  riskScore: number
  narrative: string
  timestamp: string
}

export function RiskRewardChart() {
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityData | null>(null)
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null)
  const [showNetYield, setShowNetYield] = useState(true)
  const [riskNarrative, setRiskNarrative] = useState<RiskNarrative | null>(null)
  const [narrativeLoading, setNarrativeLoading] = useState(false)

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch("/api/opportunities")
        const result = await response.json()

        if (result.success) {
          setOpportunities(result.data)
        } else {
          setError(result.error || "Failed to fetch opportunities data")
        }
      } catch (err) {
        setError("Network error fetching opportunities data")
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  const fetchRiskNarrative = async (opportunity: OpportunityData) => {
    if (!opportunity) return

    setNarrativeLoading(true)
    try {
      const response = await fetch("/api/risk-narratives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          protocol: opportunity.protocol,
          riskScore: opportunity.riskScore || opportunity.risk,
          apy: opportunity.grossAPY || opportunity.apy,
          tvl: opportunity.tvl,
          chain: opportunity.chain,
          category: opportunity.category,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setRiskNarrative(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch risk narrative:", error)
    } finally {
      setNarrativeLoading(false)
    }
  }

  const handleOpportunitySelect = (opportunity: OpportunityData) => {
    setSelectedOpportunity(opportunity)
    setRiskNarrative(null)
    fetchRiskNarrative(opportunity)
  }

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`
    return `$${tvl.toLocaleString()}`
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Lending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      DEX: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "Yield Farming": "bg-amber-500/20 text-amber-400 border-amber-500/30",
      Staking: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    }
    return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      Ethereum: "from-blue-500 to-blue-600",
      Solana: "from-purple-500 to-purple-600",
      BSC: "from-yellow-500 to-yellow-600",
      Avalanche: "from-red-500 to-red-600",
      Sui: "from-cyan-500 to-cyan-600",
      Aptos: "from-teal-500 to-teal-600",
    }
    return colors[chain] || "from-gray-500 to-gray-600"
  }

  const getRiskLevel = (risk: number) => {
    if (risk <= 30) return { label: "Low Risk", color: "text-green-400", icon: Shield }
    if (risk <= 60) return { label: "Medium Risk", color: "text-yellow-400", icon: Target }
    return { label: "High Risk", color: "text-red-400", icon: TrendingUp }
  }

  const categorizeOpportunities = () => {
    const apyValues = opportunities.map((o) => (showNetYield && o.netAPY ? o.netAPY : o.grossAPY || o.apy))
    const maxAPY = Math.max(...apyValues)
    const maxRisk = Math.max(...opportunities.map((o) => o.riskScore || o.risk))

    return opportunities.map((opp) => {
      const currentAPY = showNetYield && opp.netAPY ? opp.netAPY : opp.grossAPY || opp.apy
      const normalizedAPY = currentAPY / maxAPY
      const normalizedRisk = (opp.riskScore || opp.risk) / maxRisk

      let quadrant = ""
      if (normalizedRisk <= 0.5 && normalizedAPY >= 0.5) quadrant = "sweet-spot"
      else if (normalizedRisk > 0.5 && normalizedAPY >= 0.5) quadrant = "high-risk"
      else if (normalizedRisk <= 0.5 && normalizedAPY < 0.5) quadrant = "safe-haven"
      else quadrant = "avoid"

      return { ...opp, quadrant, currentAPY }
    })
  }

  const categorizedOpportunities = opportunities.length ? categorizeOpportunities() : []

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Risk vs Reward Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500/30 border-t-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Risk vs Reward Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-red-400">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Risk vs Reward Analysis
          </CardTitle>

          <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <Calculator className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-slate-300">Yield Display:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNetYield(false)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  !showNetYield
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Gross APY
              </button>
              <button
                onClick={() => setShowNetYield(true)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  showNetYield
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Net APY (After Fees)
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-100">
              <p className="font-medium mb-1">How to read this chart:</p>
              <p className="text-blue-200/80">
                Each bubble represents a DeFi opportunity. Higher positions = better returns. Further right = higher
                risk. Bigger bubbles = more money invested (TVL).{" "}
                {showNetYield
                  ? "Net APY accounts for gas fees, bridge costs, slippage, and protocol fees."
                  : "Gross APY shows raw yields before fees."}{" "}
                Click any opportunity for detailed AI-powered risk analysis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-100">
              <p className="font-medium mb-1">⚠️ Important Disclaimer:</p>
              <p className="text-amber-200/80 mb-2">
                This information is for educational purposes only and does not constitute financial advice. All data
                presented is based on statistical analysis of various market data points, historical performance
                metrics, and algorithmic risk assessments. Past performance does not guarantee future results.
              </p>
              <p className="text-amber-200/80">
                All investments carry risk of loss, including potential total loss of principal. Market conditions,
                protocol changes, and external factors can significantly impact returns and risk profiles. Please
                conduct your own research and consult with a qualified financial advisor before making any investment
                decisions.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sweet Spot Quadrant */}
        <Card
          className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-500/30 backdrop-blur-sm hover:border-emerald-400/50 transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredQuadrant("sweet-spot")}
          onMouseLeave={() => setHoveredQuadrant(null)}
        >
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sweet Spot
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Recommended</Badge>
            </CardTitle>
            <p className="text-sm text-emerald-200/80">High rewards with manageable risk</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedOpportunities
                .filter((opp) => opp.quadrant === "sweet-spot")
                .slice(0, 3)
                .map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer"
                    onClick={() => handleOpportunitySelect(opp)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{opp.protocol}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getChainColor(opp.chain)}`}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-emerald-400 font-medium">{opp.currentAPY.toFixed(1)}% APY</span>
                        {showNetYield && opp.feeImpact && opp.feeImpact > 0 && (
                          <span className="text-slate-500 text-xs">-{opp.feeImpact.toFixed(1)}% fees</span>
                        )}
                      </div>
                      <span className="text-slate-400">Risk: {(opp.riskScore || opp.risk).toFixed(0)}/100</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* High Risk Quadrant */}
        <Card
          className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 backdrop-blur-sm hover:border-red-400/50 transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredQuadrant("high-risk")}
          onMouseLeave={() => setHoveredQuadrant(null)}
        >
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              High Risk Zone
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Expert Only</Badge>
            </CardTitle>
            <p className="text-sm text-red-200/80">Maximum rewards but significant risk</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedOpportunities
                .filter((opp) => opp.quadrant === "high-risk")
                .slice(0, 3)
                .map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                    onClick={() => handleOpportunitySelect(opp)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{opp.protocol}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getChainColor(opp.chain)}`}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-red-400 font-medium">{opp.currentAPY.toFixed(1)}% APY</span>
                        {showNetYield && opp.feeImpact && opp.feeImpact > 0 && (
                          <span className="text-slate-500 text-xs">-{opp.feeImpact.toFixed(1)}% fees</span>
                        )}
                      </div>
                      <span className="text-slate-400">Risk: {(opp.riskScore || opp.risk).toFixed(0)}/100</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Safe Haven Quadrant */}
        <Card
          className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredQuadrant("safe-haven")}
          onMouseLeave={() => setHoveredQuadrant(null)}
        >
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Safe Haven
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Conservative</Badge>
            </CardTitle>
            <p className="text-sm text-blue-200/80">Lower returns but very stable</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedOpportunities
                .filter((opp) => opp.quadrant === "safe-haven")
                .slice(0, 3)
                .map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
                    onClick={() => handleOpportunitySelect(opp)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{opp.protocol}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getChainColor(opp.chain)}`}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-blue-400 font-medium">{opp.currentAPY.toFixed(1)}% APY</span>
                        {showNetYield && opp.feeImpact && opp.feeImpact > 0 && (
                          <span className="text-slate-500 text-xs">-{opp.feeImpact.toFixed(1)}% fees</span>
                        )}
                      </div>
                      <span className="text-slate-400">Risk: {(opp.riskScore || opp.risk).toFixed(0)}/100</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Avoid Zone Quadrant */}
        <Card
          className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30 backdrop-blur-sm hover:border-orange-400/50 transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredQuadrant("avoid")}
          onMouseLeave={() => setHoveredQuadrant(null)}
        >
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Avoid Zone
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Not Recommended</Badge>
            </CardTitle>
            <p className="text-sm text-orange-200/80">High risk with low rewards</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedOpportunities
                .filter((opp) => opp.quadrant === "avoid")
                .slice(0, 3)
                .map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-orange-500/30 transition-all duration-200 cursor-pointer opacity-60"
                    onClick={() => handleOpportunitySelect(opp)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{opp.protocol}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getChainColor(opp.chain)}`}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-orange-400 font-medium">{opp.currentAPY.toFixed(1)}% APY</span>
                        {showNetYield && opp.feeImpact && opp.feeImpact > 0 && (
                          <span className="text-slate-500 text-xs">-{opp.feeImpact.toFixed(1)}% fees</span>
                        )}
                      </div>
                      <span className="text-slate-400">Risk: {(opp.riskScore || opp.risk).toFixed(0)}/100</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedOpportunity && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${getChainColor(selectedOpportunity.chain)}`}
                  ></div>
                  {selectedOpportunity.protocol}
                </div>
                <Badge className={`${getCategoryColor(selectedOpportunity.category)} border`}>
                  {selectedOpportunity.category}
                </Badge>
              </CardTitle>
              <p className="text-slate-400">Detailed opportunity analysis</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-400">Annual Yield</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {showNetYield && selectedOpportunity.netAPY
                      ? selectedOpportunity.netAPY.toFixed(2)
                      : (selectedOpportunity.grossAPY || selectedOpportunity.apy).toFixed(2)}
                    %
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{showNetYield ? "After Fees" : "Before Fees"}</div>
                  {selectedOpportunity.feeImpact && selectedOpportunity.feeImpact > 0 && (
                    <div className="text-xs text-slate-400 mt-1">
                      Fee Impact: -{selectedOpportunity.feeImpact.toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const riskInfo = getRiskLevel(selectedOpportunity.riskScore || selectedOpportunity.risk)
                      const Icon = riskInfo.icon
                      return (
                        <>
                          <Icon className={`w-4 h-4 ${riskInfo.color}`} />
                          <span className="text-sm text-slate-400">Risk Level</span>
                        </>
                      )
                    })()}
                  </div>
                  <div
                    className={`text-2xl font-bold ${getRiskLevel(selectedOpportunity.riskScore || selectedOpportunity.risk).color}`}
                  >
                    {(selectedOpportunity.riskScore || selectedOpportunity.risk).toFixed(0)}/100
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {getRiskLevel(selectedOpportunity.riskScore || selectedOpportunity.risk).label}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Total Value Locked</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">{formatTVL(selectedOpportunity.tvl)}</div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-400">Asset Token</span>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-lg px-3 py-1">
                    {selectedOpportunity.token}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                AI Risk Analysis
              </CardTitle>
              <p className="text-slate-400">Comprehensive risk assessment and investment guidance</p>
            </CardHeader>
            <CardContent>
              {narrativeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-2" />
                  <span className="text-slate-400">Generating risk analysis...</span>
                </div>
              ) : riskNarrative ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-slate-200 leading-relaxed whitespace-pre-line">{riskNarrative.narrative}</div>
                  <div className="mt-4 text-xs text-slate-500">
                    Analysis generated: {new Date(riskNarrative.timestamp).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 py-4">
                  Click on an opportunity above to generate AI-powered risk analysis.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
