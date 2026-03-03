import { useRef, useEffect, useState } from "react";
import { Log } from "../types/game";

interface BattleLogProps {
  logs: Log[];
}

type LogFilter = "all" | "combat" | "loot" | "system";

export function BattleLog({ logs }: BattleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<LogFilter>("all");
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const container = logContainerRef.current;
    if (!container || !autoScroll) return;

    // Auto-scroll to bottom when new logs arrive and auto-scroll is enabled
    container.scrollTop = container.scrollHeight;
  }, [logs, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    const container = logContainerRef.current;
    if (!container) return;

    // Increased threshold to 50px to prevent false triggers when log container is not full
    // This ensures auto-scroll stays enabled early in the game when there are few logs
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const getLogColor = (text: string): string => {
    // Loot messages (gold color)
    if (text.includes("🎁") || text.includes("💰") || text.includes("💎") || text.includes("Looted") || text.includes("Drop")) {
      return "#fbbf24";
    }
    // Damage taken (red)
    if (text.includes("💥") || text.includes("attacks!") || text.includes("take")) {
      return "#f87171";
    }
    // Healing/Potions (green)
    if (text.includes("🍖") || text.includes("🧪") || text.includes("+") && (text.includes("HP") || text.includes("MP"))) {
      return "#22c55e";
    }
    // Level up (gold)
    if (text.includes("🌟") || text.includes("LEVEL UP") || text.includes("JOB LEVEL")) {
      return "#fbbf24";
    }
    // System messages (cyan)
    if (text.includes("🏛️") || text.includes("🚀") || text.includes("Traveled") || text.includes("Escaped")) {
      return "#60a5fa";
    }
    // Combat messages (orange)
    if (text.includes("🎯") || text.includes("Hit") || text.includes("dmg")) {
      return "#fb923c";
    }
    // Boss/Challenge (purple)
    if (text.includes("⚔️") || text.includes("BOSS") || text.includes("Boss")) {
      return "#a78bfa";
    }
    // Default
    return "#d1d5db";
  };

  const getLogCategory = (text: string): LogFilter => {
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
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    return getLogCategory(log.text) === filter;
  });

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
          height: "200px",
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
