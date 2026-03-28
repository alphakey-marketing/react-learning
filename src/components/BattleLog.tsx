import { useRef, useEffect, useState, useMemo } from "react";
import { Log } from "../types/game";

interface BattleLogProps {
  logs: Log[];
}

type LogFilter = "all" | "combat" | "loot" | "system";

function getLogColor(text: string): string {
  if (text.includes("🎁") || text.includes("💰") || text.includes("💎") || text.includes("Looted") || text.includes("Drop")) {
    return "#fbbf24";
  }
  if (text.includes("💥") || text.includes("attacks!") || text.includes("take")) {
    return "#f87171";
  }
  if (text.includes("🍖") || text.includes("🧪") || text.includes("+") && (text.includes("HP") || text.includes("MP"))) {
    return "#22c55e";
  }
  if (text.includes("🌟") || text.includes("LEVEL UP") || text.includes("JOB LEVEL")) {
    return "#fbbf24";
  }
  if (text.includes("🏛️") || text.includes("🚀") || text.includes("Traveled") || text.includes("Escaped")) {
    return "#60a5fa";
  }
  if (text.includes("🎯") || text.includes("Hit") || text.includes("dmg")) {
    return "#fb923c";
  }
  if (text.includes("⚔️") || text.includes("BOSS") || text.includes("Boss")) {
    return "#a78bfa";
  }
  return "#d1d5db";
}

function getLogCategory(text: string): LogFilter {
  if (text.includes("🎁") || text.includes("💰") || text.includes("💎") || text.includes("Looted") || text.includes("Drop")) {
    return "loot";
  }
  if (text.includes("🎯") || text.includes("💥") || text.includes("Hit") || text.includes("dmg") || text.includes("attacks")) {
    return "combat";
  }
  if (text.includes("🏛️") || text.includes("🚀") || text.includes("🌟") || text.includes("Traveled") || text.includes("LEVEL")) {
    return "system";
  }
  return "all";
}

export function BattleLog({ logs }: BattleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<LogFilter>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Memoize filtered logs to prevent recalculation on every render
  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter(log => getLogCategory(log.text) === filter);
  }, [logs, filter]);

  useEffect(() => {
    const container = logContainerRef.current;
    if (!container || !autoScroll) return;

    container.scrollTop = container.scrollHeight;
  }, [filteredLogs, autoScroll]);

  const handleScroll = () => {
    const container = logContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, fontSize: "14px", color: "#fbbf24" }}>
          📜 Battle Log
        </h3>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["all", "combat", "loot", "system"] as LogFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 8px",
                background: filter === f ? "#374151" : "transparent",
                color: filter === f ? "#fbbf24" : "#888",
                border: "1px solid #444",
                borderRadius: "4px",
                fontSize: "10px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        style={{
          height: isMobile ? "120px" : "200px",
          overflowY: "auto",
          overflowX: "hidden",
          background: "#111",
          border: "1px solid #444",
          borderRadius: "4px",
          padding: "10px",
          fontSize: "11px",
          fontFamily: "monospace",
          scrollBehavior: "smooth",
        }}
      >
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            style={{
              marginBottom: "6px",
              paddingBottom: "4px",
              borderBottom: "1px solid #1a1a1a",
              wordWrap: "break-word",
              color: getLogColor(log.text),
              lineHeight: "1.4",
            }}
          >
            {log.text}
          </div>
        ))}
        {filteredLogs.length === 0 && filter !== "all" && (
          <div style={{ color: "#666", textAlign: "center", marginTop: "20px" }}>
            No {filter} logs yet...
          </div>
        )}
        {logs.length === 0 && (
          <div style={{ color: "#666" }}>Battle started...</div>
        )}
        {!autoScroll && (
          <div style={{ 
            position: "sticky", 
            bottom: 0, 
            background: "rgba(17, 17, 17, 0.9)", 
            padding: "4px", 
            textAlign: "center",
            fontSize: "10px",
            color: "#fbbf24",
            borderTop: "1px solid #444",
            marginTop: "8px",
          }}>
            ⬇️ Scroll to bottom for auto-scroll
          </div>
        )}
      </div>
    </div>
  );
}
