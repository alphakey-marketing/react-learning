import { useState } from "react";
import { Log } from "../types/game";
import { MAX_LOGS } from "../data/constants";

export function useBattleLog() {
  const [logs, setLogs] = useState<Log[]>([]);

  const addLog = (text: string) => {
    setLogs((prev) => {
      const newLog = { id: Date.now() + Math.random(), text };
      const next = [...prev, newLog];
      if (next.length > MAX_LOGS) next.shift();
      return next;
    });
  };

  return { logs, addLog };
}
