import React, { useState, useEffect } from "react";
import { QUEST_CHAINS, isChainComplete, QuestEndingChoice } from "../data/questChains";

interface QuestPulseBannerProps {
  completedStepIds: Record<string, boolean>;
  questEnding: QuestEndingChoice;
  onOpenQuestLog: () => void;
}

const CHAIN_ORDER = ["chain_birthmark", "chain_mountain", "chain_rite"];

export function QuestPulseBanner({ completedStepIds, questEnding, onOpenQuestLog }: QuestPulseBannerProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // Pulse briefly whenever a step is completed
  const completedCount = Object.keys(completedStepIds).length;
  useEffect(() => {
    if (completedCount === 0) return;
    setIsPulsing(true);
    const t = setTimeout(() => setIsPulsing(false), 2000);
    return () => clearTimeout(t);
  }, [completedCount]);

  // Find the active chain and step
  let activeChainIndex = -1;
  let activeStepIndex = -1;

  for (let i = 0; i < CHAIN_ORDER.length; i++) {
    const isUnlocked = i === 0 || isChainComplete(CHAIN_ORDER[i - 1], completedStepIds);
    if (!isUnlocked) break;

    const chain = QUEST_CHAINS.find(c => c.id === CHAIN_ORDER[i]);
    if (!chain) continue;

    const stepIdx = chain.steps.findIndex(s => !completedStepIds[s.id]);
    if (stepIdx !== -1) {
      activeChainIndex = i;
      activeStepIndex = stepIdx;
      break;
    }
  }

  const activeChain = activeChainIndex !== -1 ? QUEST_CHAINS.find(c => c.id === CHAIN_ORDER[activeChainIndex]) : null;
  const activeStep = activeChain ? activeChain.steps[activeStepIndex] : null;

  const bannerStyle: React.CSSProperties = {
    padding: "6px 10px",
    background: isPulsing ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.12)",
    border: `1px solid rgba(124,58,237,${isPulsing ? 0.65 : 0.3})`,
    borderRadius: "6px",
    marginBottom: "6px",
    transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
    boxShadow: isPulsing ? "0 0 10px rgba(124,58,237,0.4)" : "none",
    flexShrink: 0,
  };

  // Quest line complete
  if (questEnding !== null) {
    return (
      <div style={bannerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", flexShrink: 0 }}>📜</span>
          <span style={{ fontSize: "11px", color: "#c084fc", flex: 1, fontStyle: "italic" }}>
            {questEnding === "seal"
              ? "The bloodline is sealed. You chose peace."
              : "You walked through the pass. You are still writing."}
          </span>
          <button
            onClick={onOpenQuestLog}
            style={{ background: "none", border: "none", color: "#a855f7", fontSize: "10px", cursor: "pointer", flexShrink: 0, padding: "2px 4px" }}
          >
            Story ▶
          </button>
        </div>
      </div>
    );
  }

  if (!activeChain || !activeStep) return null;

  return (
    <div style={bannerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "12px", flexShrink: 0 }}>📖</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "9px", color: "#a855f7", fontWeight: "bold", letterSpacing: "0.3px", marginBottom: "1px" }}>
            Chain {activeChainIndex + 1} · Step {activeStepIndex + 1} — {activeChain.title}
          </div>
          <div style={{ fontSize: "11px", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeStep.title}
          </div>
        </div>
        <button
          onClick={onOpenQuestLog}
          style={{
            padding: "3px 8px",
            background: "rgba(124,58,237,0.3)",
            border: "1px solid rgba(124,58,237,0.5)",
            borderRadius: "4px",
            color: "#c084fc",
            fontSize: "10px",
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          View ▶
        </button>
      </div>
    </div>
  );
}
