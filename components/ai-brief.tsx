"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Send, Sparkles } from "lucide-react"

interface BriefData {
  brief: string
  timestamp: string
  generatedAt: string
}

interface QueryResponse {
  query: string
  response: string
  timestamp: string
}

export function AIBrief() {
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [loadingBrief, setLoadingBrief] = useState(true)
  const [briefError, setBriefError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null)
  const [loadingQuery, setLoadingQuery] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)

  const fetchBrief = async () => {
    setLoadingBrief(true)
    setBriefError(null)

    try {
      const response = await fetch("/api/ai/brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setBrief(result.data)
      } else {
        setBriefError(result.error || "Failed to generate brief")
      }
    } catch (err) {
      setBriefError("Network error generating brief")
    } finally {
      setLoadingBrief(false)
    }
  }

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoadingQuery(true)
    setQueryError(null)

    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setQueryResponse(result.data)
        setQuery("")
      } else {
        setQueryError(result.error || "Failed to process query")
      }
    } catch (err) {
      setQueryError("Network error processing query")
    } finally {
      setLoadingQuery(false)
    }
  }

  useEffect(() => {
    fetchBrief()
  }, [])

  const formatBriefText = (text: string) => {
    // Split by double newlines to create paragraphs
    return text.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0 text-foreground leading-relaxed">
        {paragraph.trim()}
      </p>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Morning Brief Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Morning Brief</span>
            </div>
            <Button
              onClick={fetchBrief}
              disabled={loadingBrief}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${loadingBrief ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </CardTitle>
          {brief && <p className="text-sm text-muted-foreground">Generated at {brief.generatedAt}</p>}
        </CardHeader>
        <CardContent>
          {loadingBrief ? (
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
              <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            </div>
          ) : briefError ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-4">Error: {briefError}</div>
              <Button onClick={fetchBrief} variant="outline">
                Try Again
              </Button>
            </div>
          ) : brief ? (
            <div className="prose prose-sm max-w-none">{formatBriefText(brief.brief)}</div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No brief available</div>
          )}
        </CardContent>
      </Card>

      {/* AI Query Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Ask AI Assistant</CardTitle>
          <p className="text-sm text-muted-foreground">Ask questions about DeFi markets, chains, and opportunities</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuery} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What are the best yield opportunities on Ethereum?"
                disabled={loadingQuery}
                className="flex-1"
              />
              <Button type="submit" disabled={loadingQuery || !query.trim()} className="flex items-center space-x-2">
                <Send className={`h-4 w-4 ${loadingQuery ? "animate-pulse" : ""}`} />
                <span>Ask</span>
              </Button>
            </div>

            {/* Suggested Questions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Suggestions:</span>
              {[
                "What chains have the highest TVL?",
                "Which protocols offer the best risk-adjusted returns?",
                "What are the recent cross-chain flow trends?",
              ].map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </form>

          {queryError && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-destructive text-sm">Error: {queryError}</div>
            </div>
          )}

          {queryResponse && (
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  Question
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4 italic">"{queryResponse.query}"</p>

              <div className="mb-2">
                <Badge variant="default" className="text-xs">
                  AI Response
                </Badge>
              </div>
              <div className="prose prose-sm max-w-none">{formatBriefText(queryResponse.response)}</div>

              <div className="mt-3 text-xs text-muted-foreground">
                Answered at {new Date(queryResponse.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
