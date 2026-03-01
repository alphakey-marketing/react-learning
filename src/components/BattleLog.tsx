import { useRef, useEffect } from "react";
import { Log } from "../types/game";

interface BattleLogProps {
  logs: Log[];
}

export function BattleLog({ logs }: BattleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = logContainerRef.current;
    if (!container) return;

    // Always scroll to bottom when new logs arrive
    container.scrollTop = container.scrollHeight;
  }, [logs]);

  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#fbbf24" }}>
        📜 Battle Log
      </h3>
      <div
        ref={logContainerRef}
        style={{
          height: "150px",
          overflowY: "auto",
          overflowX: "hidden",
          background: "#111",
          border: "1px solid #444",
          borderRadius: "4px",
          padding: "8px",
          fontSize: "11px",
          fontFamily: "monospace",
          scrollBehavior: "smooth",
        }}
      >
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              marginBottom: "3px",
              borderBottom: "1px solid #222",
              paddingBottom: "2px",
              wordWrap: "break-word",
            }}
          >
            {log.text}
          </div>
        ))}
        {logs.length === 0 && (
          <div style={{ color: "#666" }}>Battle started...</div>
        )}
      </div>
    </div>
  );
}
