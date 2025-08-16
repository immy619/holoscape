import { ChainCards } from "@/components/chain-cards"
import { AnomalyAlerts } from "@/components/anomaly-alerts"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Real-time DeFi analytics across major blockchain networks</p>
      </div>

      <div className="grid gap-6">
        <ChainCards />
      </div>

      <div>
        <AnomalyAlerts />
      </div>
    </div>
  )
}
