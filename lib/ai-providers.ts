export interface AIProvider {
  name: string
  generateText(prompt: string, systemPrompt?: string, maxTokens?: number): Promise<string>
}

// Hugging Face provider (free tier - 1000 requests/day)
export class HuggingFaceProvider implements AIProvider {
  name = "HuggingFace"
  private apiKey: string
  private model: string

  constructor(apiKey?: string, model = "microsoft/DialoGPT-large") {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || ""
    this.model = model
  }

  async generateText(prompt: string, systemPrompt?: string, maxTokens = 500): Promise<string> {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt

    const response = await fetch(`https://api-inference.huggingface.co/models/${this.model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`)
    }

    const result = await response.json()
    return result[0]?.generated_text || "No response generated"
  }
}

// OpenAI provider (fallback option)
export class OpenAIProvider implements AIProvider {
  name = "OpenAI"
  private apiKey: string
  private model: string

  constructor(apiKey?: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ""
    this.model = model
  }

  async generateText(prompt: string, systemPrompt?: string, maxTokens = 500): Promise<string> {
    const messages = []
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt })
    }
    messages.push({ role: "user", content: prompt })

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    return result.choices[0]?.message?.content || "No response generated"
  }
}

// Cohere provider (100k tokens/month free)
export class CohereProvider implements AIProvider {
  name = "Cohere"
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.COHERE_API_KEY || ""
  }

  async generateText(prompt: string, systemPrompt?: string, maxTokens = 500): Promise<string> {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: fullPrompt,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`)
    }

    const result = await response.json()
    return result.generations[0]?.text || "No response generated"
  }
}

// Demo provider that works without API keys
export class DemoProvider implements AIProvider {
  name = "Demo"

  async generateText(prompt: string, systemPrompt?: string, maxTokens = 500): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate contextual demo responses based on prompt content
    if (prompt.toLowerCase().includes("brief") || prompt.toLowerCase().includes("morning")) {
      return `🌅 **DeFi Morning Brief - Demo Mode**

**Market Overview:**
- Total DeFi TVL: $45.2B (+2.3% 24h)
- Ethereum dominance: 65.4%
- Top gainers: Arbitrum (+8.2%), Polygon (+5.1%)

**Key Developments:**
- New liquidity mining program launched on Uniswap V4
- Aave governance proposal for risk parameter updates
- Cross-chain bridge volumes up 15% this week

**Opportunities:**
- High yield farming on Compound: 12.5% APY
- Arbitrage opportunities between DEXs detected
- New staking rewards available on Lido

*This is a demo response. Configure a real AI provider for live analysis.*`
    }

    if (prompt.toLowerCase().includes("risk") || prompt.toLowerCase().includes("opportunity")) {
      return `Based on current market conditions, here are the key insights:

**High Yield Opportunities:**
- Curve Finance: 15.2% APY (Medium risk)
- Yearn Vaults: 8.7% APY (Low risk)
- Compound: 12.1% APY (Medium risk)

**Risk Assessment:**
- Market volatility: Moderate
- Smart contract risk: Low for established protocols
- Impermanent loss risk: High for volatile pairs

**Recommendation:**
Consider diversifying across multiple protocols to optimize risk-adjusted returns.

*This is a demo response showcasing the AI functionality.*`
    }

    // Default response for other queries
    return `I understand you're asking about: "${prompt.slice(0, 100)}..."

In demo mode, I can provide sample responses for DeFi analysis, market insights, and investment opportunities. 

**To get real AI-powered responses:**
1. Get a free API key from one of these providers:
   - Hugging Face: https://huggingface.co/settings/tokens
   - Cohere: https://dashboard.cohere.ai/api-keys
   - OpenAI: https://platform.openai.com/api-keys

2. Set your environment variables and restart the app.

*This is a demo response showcasing the AI functionality.*`
  }
}

// Factory function to get the configured AI provider
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "demo"

  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAIProvider()
    case "cohere":
      return new CohereProvider()
    case "huggingface":
      return new HuggingFaceProvider()
    case "demo":
    default:
      return new DemoProvider()
  }
}
