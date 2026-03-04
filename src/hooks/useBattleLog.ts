import { useState, useCallback } from "react";

const MAX_LOG_ENTRIES = 100; // Limit log entries to prevent memory issues

export function useBattleLog() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((text: string) => {
    setLogs((prev) => {
      const newLogs = [text, ...prev];
      // Keep only the most recent MAX_LOG_ENTRIES
      return newLogs.slice(0, MAX_LOG_ENTRIES);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
}