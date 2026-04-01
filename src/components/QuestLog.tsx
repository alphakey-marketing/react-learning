import React, { useState } from "react";
import { QUEST_CHAINS, QuestEndingChoice, ENDING_CHOICES, getActiveStepIndex, isChainComplete } from "../data/questChains";
import { QUEST_ITEMS, getQuestItemsForChain } from "../data/quests";
import { Equipment } from "../types/equipment";

interface QuestLogProps {
  isOpen: boolean;
  onClose: () => void;
  completedStepIds: Record<string, boolean>;
  questEnding: QuestEndingChoice;
  inventory: Equipment[];
  onSealBloodline: () => void;
  onRemainUnbound: () => void;
}

export function QuestLog({
  isOpen,
  onClose,
  completedStepIds,
  questEnding,
  inventory,
  onSealBloodline,
  onRemainUnbound,
}: QuestLogProps) {
  const [expandedChain, setExpandedChain] = useState<string | null>("chain_birthmark");

  if (!isOpen) return null;

  const collectedQuestItemIds = inventory
    .filter(i => i.type === "quest" && i.questItemId)
    .map(i => i.questItemId!);

  // Chain 3 is complete when its last step is done and ending not yet chosen
  const chain3 = QUEST_CHAINS.find(c => c.id === "chain_rite");
  const chain3AllStepsDone = chain3
    ? chain3.steps.every(s => completedStepIds[s.id])
    : false;
  const showEndingChoice = chain3AllStepsDone && questEnding === null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 1200,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "85vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, #0a0a14 0%, #0f172a 100%)",
          borderRadius: "16px 16px 0 0",
          borderTop: "1px solid rgba(139,92,246,0.4)",
          zIndex: 1201,
          padding: "16px 12px 80px",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "bold", color: "#a78bfa" }}>📜 Quest Log</div>
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>You Are the Monster</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#6b7280", fontSize: "20px", cursor: "pointer", padding: "4px 8px" }}
          >
            ✕
          </button>
        </div>

        {/* Ending choice — shown when Chain 3 is done */}
        {showEndingChoice && (
          <div
            style={{
              marginBottom: "16px",
              padding: "14px",
              background: "linear-gradient(135deg, #1a0a2e, #0f0a1e)",
              border: "1px solid rgba(139,92,246,0.6)",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#e879f9", marginBottom: "8px" }}>
              ⚠️ The Choice
            </div>
            <div style={{ fontSize: "12px", color: "#d1d5db", lineHeight: "1.6", marginBottom: "14px" }}>
              The sage stands between you and the pass, shoulders straight. Two paths remain.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => { onSealBloodline(); onClose(); }}
                style={{
                  padding: "12px 14px",
                  background: "linear-gradient(135deg, #1e3a5f, #1e40af)",
                  border: "1px solid #3b82f6",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>🔒 {ENDING_CHOICES.seal.label}</div>
                <div style={{ color: "#93c5fd", fontSize: "11px" }}>{ENDING_CHOICES.seal.description}</div>
              </button>
              <button
                onClick={() => { onRemainUnbound(); onClose(); }}
                style={{
                  padding: "12px 14px",
                  background: "linear-gradient(135deg, #3b0a0a, #7f1d1d)",
                  border: "1px solid #ef4444",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>🌑 {ENDING_CHOICES.unbound.label}</div>
                <div style={{ color: "#fca5a5", fontSize: "11px" }}>{ENDING_CHOICES.unbound.description}</div>
              </button>
            </div>
          </div>
        )}

        {/* Epilogue — shown after ending choice */}
        {questEnding !== null && (
          <div
            style={{
              marginBottom: "16px",
              padding: "14px",
              background: questEnding === "seal"
                ? "linear-gradient(135deg, #0c1929, #1e3a5f)"
                : "linear-gradient(135deg, #1a0505, #3b0a0a)",
              border: `1px solid ${questEnding === "seal" ? "#3b82f6" : "#ef4444"}`,
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "bold", color: questEnding === "seal" ? "#93c5fd" : "#fca5a5", marginBottom: "8px" }}>
              {questEnding === "seal" ? "🔒 Bloodline Sealed" : "🌑 Unbound"}
            </div>
            <div style={{ fontSize: "11px", color: "#d1d5db", lineHeight: "1.7", fontStyle: "italic" }}>
              {ENDING_CHOICES[questEnding].epilogue}
            </div>
          </div>
        )}

        {/* Quest chains */}
        {QUEST_CHAINS.map(chain => {
          const activeStep = getActiveStepIndex(chain.id, completedStepIds);
          const chainDone = isChainComplete(chain.id, completedStepIds);
          const isExpanded = expandedChain === chain.id;
          const chainItems = getQuestItemsForChain(chain.id);

          // Determine if chain is unlocked
          // Chain 1 always unlocked; Chain 2 unlocked after Chain 1 done; Chain 3 after Chain 2
          const chainOrder = ["chain_birthmark", "chain_mountain", "chain_rite"];
          const chainIdx = chainOrder.indexOf(chain.id);
          const isUnlocked = chainIdx === 0 || isChainComplete(chainOrder[chainIdx - 1], completedStepIds);

          const accentColor = chainDone ? "#22c55e" : isUnlocked ? "#a78bfa" : "#374151";
          const statusLabel = chainDone ? "✅ Complete" : !isUnlocked ? "🔒 Locked" : `Step ${activeStep + 1}/${chain.steps.length}`;

          return (
            <div
              key={chain.id}
              style={{
                marginBottom: "10px",
                background: "#0f172a",
                border: `1px solid ${accentColor}`,
                borderRadius: "10px",
                opacity: isUnlocked ? 1 : 0.5,
              }}
            >
              {/* Chain header */}
              <button
                onClick={() => isUnlocked && setExpandedChain(isExpanded ? null : chain.id)}
                disabled={!isUnlocked}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  background: "none",
                  border: "none",
                  cursor: isUnlocked ? "pointer" : "default",
                  color: "white",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: accentColor }}>{chain.title}</div>
                  <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>{chain.subtitle}</div>
                </div>
                <div style={{ fontSize: "10px", color: accentColor, flexShrink: 0, marginLeft: "8px" }}>
                  {statusLabel} {isExpanded ? "▲" : "▼"}
                </div>
              </button>

              {/* Steps */}
              {isExpanded && isUnlocked && (
                <div style={{ padding: "0 14px 14px" }}>
                  {chain.steps.map((step, idx) => {
                    const stepDone = completedStepIds[step.id];
                    const isActive = !stepDone && idx === activeStep;
                    const questItem = chainItems.find(qi => qi.id === step.requiredItemId);
                    const itemCollected = collectedQuestItemIds.includes(step.requiredItemId);

                    return (
                      <div
                        key={step.id}
                        style={{
                          marginBottom: "10px",
                          padding: "10px 12px",
                          background: stepDone
                            ? "rgba(34,197,94,0.08)"
                            : isActive
                            ? "rgba(167,139,250,0.08)"
                            : "#0a0f1a",
                          border: `1px solid ${stepDone ? "#16a34a" : isActive ? "#7c3aed" : "#1e293b"}`,
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "16px" }}>
                            {stepDone ? "✅" : isActive ? "🔮" : "⬜"}
                          </span>
                          <div style={{ fontSize: "12px", fontWeight: "bold", color: stepDone ? "#22c55e" : isActive ? "#c4b5fd" : "#6b7280" }}>
                            {step.title}
                          </div>
                        </div>

                        {/* Task description */}
                        <div style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6", marginBottom: stepDone ? "8px" : "0" }}>
                          {step.description}
                        </div>

                        {/* Quest item required */}
                        {questItem && (
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "6px 8px",
                              background: itemCollected ? "rgba(34,197,94,0.1)" : "rgba(30,41,59,0.8)",
                              border: `1px solid ${itemCollected ? "#166534" : "#1e293b"}`,
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "8px",
                            }}
                          >
                            <span style={{ fontSize: "18px", flexShrink: 0 }}>{questItem.icon}</span>
                            <div>
                              <div style={{ fontSize: "11px", fontWeight: "bold", color: itemCollected ? "#22c55e" : "#94a3b8" }}>
                                {questItem.name} {itemCollected ? "— Collected" : "— Not yet found"}
                              </div>
                              <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.5", marginTop: "2px", fontStyle: "italic" }}>
                                "{questItem.description}"
                              </div>
                              {!itemCollected && (
                                <div style={{ fontSize: "10px", color: "#475569", marginTop: "4px" }}>
                                  Drop: {questItem.drop.enemyName} — Zone {questItem.drop.zoneId}
                                  {questItem.drop.isBossOnly ? " (Boss only)" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Completion text — only shown when step is done */}
                        {stepDone && (
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "8px 10px",
                              background: "rgba(34,197,94,0.05)",
                              border: "1px solid #14532d",
                              borderRadius: "6px",
                              fontSize: "11px",
                              color: "#86efac",
                              lineHeight: "1.7",
                              fontStyle: "italic",
                            }}
                          >
                            {step.completionText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
