import { AIBrief } from "@/components/ai-brief"

export default function BriefPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Brief</h1>
        <p className="text-muted-foreground">AI-generated insights and market analysis</p>
      </div>

      <AIBrief />
    </div>
  )
}
