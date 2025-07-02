"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, AlertTriangle, Info, Bug, Zap, Search, Trash2 } from "lucide-react"
import { consoleLogger, type ConsoleMessage } from "@/lib/console-logger"

interface ConsolePanelProps {
  className?: string
}

export function ConsolePanel({ className }: ConsolePanelProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([])
  const [filter, setFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    // Subscribe to console messages
    const unsubscribe = consoleLogger.subscribe(setMessages)
    return unsubscribe
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive if autoScroll is enabled
    if (scrollRef.current && autoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  const filteredMessages = messages.filter((message) => {
    const matchesFilter = filter === "" || message.message.toLowerCase().includes(filter.toLowerCase())
    const matchesLevel = levelFilter === "all" || message.level === levelFilter
    return matchesFilter && matchesLevel
  })

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertTriangle className="h-3 w-3" />
      case "warn":
        return <Zap className="h-3 w-3" />
      case "info":
        return <Info className="h-3 w-3" />
      case "debug":
        return <Bug className="h-3 w-3" />
      default:
        return <Terminal className="h-3 w-3" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      case "debug":
        return "text-purple-400"
      default:
        return "text-green-400"
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warn":
        return "default"
      case "info":
        return "secondary"
      case "debug":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    })
  }

  const generateTestMessage = (level: ConsoleMessage["level"]) => {
    consoleLogger.generateTestMessage(level)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Console Output
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{filteredMessages.length} messages</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => consoleLogger.clear()}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter messages..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Levels</option>
            <option value="log">Log</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={() => generateTestMessage("log")}>
            <Terminal className="h-3 w-3 mr-1" /> Log
          </Button>
          <Button size="sm" variant="outline" onClick={() => generateTestMessage("info")}>
            <Info className="h-3 w-3 mr-1" /> Info
          </Button>
          <Button size="sm" variant="outline" onClick={() => generateTestMessage("warn")}>
            <Zap className="h-3 w-3 mr-1" /> Warn
          </Button>
          <Button size="sm" variant="outline" onClick={() => generateTestMessage("error")}>
            <AlertTriangle className="h-3 w-3 mr-1" /> Error
          </Button>
          <Button size="sm" variant="outline" onClick={() => generateTestMessage("debug")}>
            <Bug className="h-3 w-3 mr-1" /> Debug
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border-t border-border">
          <ScrollArea className="h-96" ref={scrollRef}>
            <div className="p-4 space-y-2">
              {filteredMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {filter || levelFilter !== "all" ? "No messages match your filters" : "No console messages yet"}
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors font-mono text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                      <span className="text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                      <Badge variant={getLevelBadgeVariant(message.level) as any} className="text-xs px-1 py-0">
                        <span className="flex items-center gap-1">
                          {getLevelIcon(message.level)}
                          {message.level.toUpperCase()}
                        </span>
                      </Badge>
                    </div>

                    <div className={`flex-1 min-w-0 ${getLevelColor(message.level)}`}>
                      <pre className="whitespace-pre-wrap break-words">{message.message}</pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
