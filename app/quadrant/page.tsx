import { RiskRewardChart } from "@/components/risk-reward-chart"

export default function QuadrantPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Risk-Reward Quadrant</h1>
        <p className="text-muted-foreground">Analyze yield opportunities across different risk profiles</p>
      </div>

      <RiskRewardChart />
    </div>
  )
}
