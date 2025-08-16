import { FlowsTable } from "@/components/flows-table"
import { FlowsVisual } from "@/components/flows-visual"

export default function FlowsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Capital Flows</h1>
        <p className="text-muted-foreground">Cross-chain capital movements in the last 24 hours</p>
      </div>

      <FlowsVisual />

      <FlowsTable />
    </div>
  )
}
