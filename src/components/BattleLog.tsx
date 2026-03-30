import { useRef, useEffect, useState, useMemo, useCallback } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const prevLogsLenRef = useRef(logs.length);
  const [unread, setUnread] = useState(0);

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter(log => getLogCategory(log.text) === filter);
  }, [logs, filter]);

  useEffect(() => {
    const container = logContainerRef.current;
    if (!container || !autoScroll || !isOpen) return;
    container.scrollTop = container.scrollHeight;
  }, [filteredLogs, autoScroll, isOpen]);

  // Track new logs arriving while panel is closed
  useEffect(() => {
    if (!isOpen && logs.length > prevLogsLenRef.current) {
      setUnread(prev => prev + (logs.length - prevLogsLenRef.current));
    }
    prevLogsLenRef.current = logs.length;
  }, [logs.length, isOpen]);

  const handleScroll = () => {
    const container = logContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div style={{ marginBottom: "8px" }}>
      {/* Toggle button — always visible */}
      <button
        onClick={() => { setIsOpen(prev => !prev); setUnread(0); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "100%",
          padding: "8px 10px",
          background: isOpen ? "#1f2937" : "rgba(31,41,55,0.7)",
          color: "#fbbf24",
          border: "1px solid #374151",
          borderRadius: isOpen ? "6px 6px 0 0" : "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          touchAction: "manipulation",
        }}
      >
        <span>📜 Log</span>
        {logs.length > 0 && (
          <span
            style={{
              background: "#374151",
              borderRadius: "10px",
              fontSize: "9px",
              padding: "1px 6px",
              color: "#9ca3af",
            }}
          >
            {logs.length}
          </span>
        )}
        {!isOpen && unread > 0 && (
          <span
            style={{
              background: "#ef4444",
              borderRadius: "10px",
              fontSize: "9px",
              padding: "1px 6px",
              color: "white",
              fontWeight: "bold",
              animation: "pulse 1s infinite",
            }}
          >
            +{unread} new
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9ca3af" }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded log panel */}
      {isOpen && (
        <div
          style={{
            border: "1px solid #374151",
            borderTop: "none",
            borderRadius: "0 0 6px 6px",
            background: "#111",
            overflow: "hidden",
          }}
        >
          {/* Filter row */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              padding: "6px 8px",
              borderBottom: "1px solid #1f2937",
              background: "#0f172a",
            }}
          >
            {(["all", "combat", "loot", "system"] as LogFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flex: 1,
                  padding: "4px",
                  background: filter === f ? "#374151" : "transparent",
                  color: filter === f ? "#fbbf24" : "#6b7280",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                  fontSize: "10px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  touchAction: "manipulation",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Log entries */}
          <div
            ref={logContainerRef}
            onScroll={handleScroll}
            style={{
              height: "160px",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "8px",
              fontSize: "11px",
              fontFamily: "monospace",
              scrollBehavior: "smooth",
            }}
          >
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  marginBottom: "4px",
                  paddingBottom: "3px",
                  borderBottom: "1px solid #1a1a1a",
                  wordWrap: "break-word",
                  color: getLogColor(log.text),
                  lineHeight: "1.3",
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
              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  background: "rgba(17,17,17,0.9)",
                  padding: "4px",
                  textAlign: "center",
                  fontSize: "9px",
                  color: "#fbbf24",
                  borderTop: "1px solid #444",
                }}
              >
                ⬇️ Scroll to bottom
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
