import React, { useState } from "react";
import { QUEST_CHAINS, QuestEndingChoice, ENDING_CHOICES, isChainComplete, QUEST_CHAIN_ORDER } from "../data/questChains";
import { QUEST_ITEMS } from "../data/quests";

interface QuestLogProps {
  isOpen: boolean;
  onClose: () => void;
  completedStepIds: Record<string, boolean>;
  acceptedStepIds: Record<string, boolean>;
  heldQuestItems: Record<string, boolean>;
  questChoicesMade: Record<string, { label: string; text: string; corruptionDelta: number }>;
  questEnding: QuestEndingChoice;
  onAcceptStep: (stepId: string) => void;
  onSubmitStep: (stepId: string, choice: { label: string; text: string; corruptionDelta: number }) => void;
  onSealBloodline: () => void;
  onRemainUnbound: () => void;
}

export function QuestLog({
  isOpen,
  onClose,
  completedStepIds,
  acceptedStepIds,
  heldQuestItems,
  questChoicesMade,
  questEnding,
  onAcceptStep,
  onSubmitStep,
  onSealBloodline,
  onRemainUnbound,
}: QuestLogProps) {
  const [expandedChain, setExpandedChain] = useState<string | null>("chain_birthmark");
  const [expandedIntro, setExpandedIntro] = useState<string | null>(null); // stepId for intro dialogue shown
  const [submittingStep, setSubmittingStep] = useState<string | null>(null); // stepId showing dialogue choices

  if (!isOpen) return null;

  const chain3 = QUEST_CHAINS.find(c => c.id === "chain_rite");
  const chain3AllStepsDone = chain3 ? chain3.steps.every(s => completedStepIds[s.id]) : false;
  const showEndingChoice = chain3AllStepsDone && questEnding === null;

  function handleSeal() { onSealBloodline(); onClose(); }
  function handleUnbound() { onRemainUnbound(); onClose(); }

  function handleAccept(stepId: string) {
    onAcceptStep(stepId);
    setExpandedIntro(null);
  }

  function handleChoiceClick(stepId: string, choice: { label: string; text: string; corruptionDelta: number }) {
    onSubmitStep(stepId, choice);
    setSubmittingStep(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1200 }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "90vh",
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
                onClick={handleSeal}
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
                <div style={{ color: "#60a5fa", fontSize: "10px", marginTop: "4px" }}>Corruption {ENDING_CHOICES.seal.corruptionChange}</div>
              </button>
              <button
                onClick={handleUnbound}
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
                <div style={{ color: "#f87171", fontSize: "10px", marginTop: "4px" }}>Corruption +{ENDING_CHOICES.unbound.corruptionChange}</div>
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
          const chainDone = isChainComplete(chain.id, completedStepIds);
          const isExpanded = expandedChain === chain.id;
          const chainIdx = QUEST_CHAIN_ORDER.indexOf(chain.id);
          const isUnlocked = chainIdx === 0 || isChainComplete(QUEST_CHAIN_ORDER[chainIdx - 1], completedStepIds);

          // Count completed steps for status
          const completedCount = chain.steps.filter(s => completedStepIds[s.id]).length;
          const accentColor = chainDone ? "#22c55e" : isUnlocked ? "#a78bfa" : "#374151";
          const statusLabel = chainDone ? "✅ Complete" : !isUnlocked ? "🔒 Locked" : `${completedCount}/${chain.steps.length} Steps`;

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
                    const stepDone = !!completedStepIds[step.id];
                    const stepAccepted = !!acceptedStepIds[step.id];
                    const stepHeld = !!heldQuestItems[step.id];
                    const choiceMade = questChoicesMade[step.id];

                    // Step is available if: previous step in this chain is done (or it's idx 0) AND chain is unlocked
                    const prevStepDone = idx === 0 || !!completedStepIds[chain.steps[idx - 1].id];
                    const isAvailable = isUnlocked && prevStepDone && !stepAccepted && !stepDone;
                    const isHunting = stepAccepted && !stepHeld && !stepDone;
                    const isReadyToSubmit = stepHeld && !stepDone;

                    const questItem = QUEST_ITEMS.find(qi => qi.id === step.requiredItemId);

                    // Status icon and color
                    let stepIcon = "⬜";
                    let stepColor = "#6b7280";
                    let bgColor = "#0a0f1a";
                    let borderColor = "#1e293b";
                    if (stepDone) { stepIcon = "✅"; stepColor = "#22c55e"; bgColor = "rgba(34,197,94,0.06)"; borderColor = "#16a34a"; }
                    else if (isReadyToSubmit) { stepIcon = "🎒"; stepColor = "#f59e0b"; bgColor = "rgba(245,158,11,0.08)"; borderColor = "#b45309"; }
                    else if (isHunting) { stepIcon = "🔮"; stepColor = "#c4b5fd"; bgColor = "rgba(167,139,250,0.08)"; borderColor = "#7c3aed"; }
                    else if (isAvailable) { stepIcon = "❗"; stepColor = "#e879f9"; bgColor = "rgba(232,121,249,0.06)"; borderColor = "#a21caf"; }

                    const showIntro = expandedIntro === step.id;
                    const showChoices = submittingStep === step.id;

                    return (
                      <div
                        key={step.id}
                        style={{
                          marginBottom: "10px",
                          padding: "10px 12px",
                          background: bgColor,
                          border: `1px solid ${borderColor}`,
                          borderRadius: "8px",
                        }}
                      >
                        {/* Step title row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "16px" }}>{stepIcon}</span>
                          <div style={{ fontSize: "12px", fontWeight: "bold", color: stepColor, flex: 1 }}>
                            {step.title}
                          </div>
                          {isAvailable && (
                            <span style={{ fontSize: "9px", padding: "2px 6px", background: "rgba(232,121,249,0.2)", border: "1px solid #a21caf", borderRadius: "10px", color: "#e879f9" }}>
                              NEW
                            </span>
                          )}
                          {isReadyToSubmit && (
                            <span style={{ fontSize: "9px", padding: "2px 6px", background: "rgba(245,158,11,0.2)", border: "1px solid #b45309", borderRadius: "10px", color: "#f59e0b" }}>
                              SUBMIT
                            </span>
                          )}
                        </div>

                        {/* ── AVAILABLE: Show intro dialogue and Accept button ── */}
                        {isAvailable && (
                          <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6", marginBottom: "8px" }}>
                              {step.description}
                            </div>

                            {!showIntro ? (
                              <button
                                onClick={() => setExpandedIntro(step.id)}
                                style={{
                                  padding: "8px 12px",
                                  background: "rgba(168,85,247,0.15)",
                                  border: "1px solid rgba(168,85,247,0.5)",
                                  borderRadius: "6px",
                                  color: "#c084fc",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  width: "100%",
                                }}
                              >
                                💬 Hear more about this quest…
                              </button>
                            ) : (
                              <div>
                                <div
                                  style={{
                                    padding: "10px 12px",
                                    background: "rgba(15,23,42,0.9)",
                                    border: "1px solid rgba(168,85,247,0.3)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#e2d9f3",
                                    lineHeight: "1.7",
                                    fontStyle: "italic",
                                    marginBottom: "10px",
                                  }}
                                >
                                  "{step.introDialogue}"
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => handleAccept(step.id)}
                                    style={{
                                      flex: 1,
                                      padding: "9px",
                                      background: "linear-gradient(45deg, #7c3aed, #6d28d9)",
                                      border: "none",
                                      borderRadius: "6px",
                                      color: "white",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    ✅ Accept Quest
                                  </button>
                                  <button
                                    onClick={() => setExpandedIntro(null)}
                                    style={{
                                      padding: "9px 14px",
                                      background: "none",
                                      border: "1px solid #374151",
                                      borderRadius: "6px",
                                      color: "#6b7280",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Not now
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── HUNTING: Item not yet found ── */}
                        {isHunting && (
                          <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6", marginBottom: "8px" }}>
                              {step.description}
                            </div>
                            {questItem && (
                              <div
                                style={{
                                  padding: "6px 8px",
                                  background: "rgba(30,41,59,0.8)",
                                  border: "1px solid #1e293b",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "8px",
                                }}
                              >
                                <span style={{ fontSize: "18px", flexShrink: 0 }}>{questItem.icon}</span>
                                <div>
                                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#94a3b8" }}>
                                    {questItem.name} — Not yet found
                                  </div>
                                  <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>
                                    {questItem.drop.enemyName} · Zone {questItem.drop.zoneId}
                                    {questItem.drop.isBossOnly ? " (Boss only)" : ""}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── READY TO SUBMIT: Show Submit + dialogue choices ── */}
                        {isReadyToSubmit && (
                          <div>
                            {questItem && (
                              <div
                                style={{
                                  marginBottom: "10px",
                                  padding: "6px 8px",
                                  background: "rgba(34,197,94,0.08)",
                                  border: "1px solid #166534",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "8px",
                                }}
                              >
                                <span style={{ fontSize: "18px", flexShrink: 0 }}>{questItem.icon}</span>
                                <div>
                                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#22c55e" }}>
                                    {questItem.name} — In your possession
                                  </div>
                                  <div style={{ fontSize: "10px", color: "#64748b", fontStyle: "italic", marginTop: "2px" }}>
                                    "{questItem.description}"
                                  </div>
                                </div>
                              </div>
                            )}

                            {!showChoices ? (
                              <button
                                onClick={() => setSubmittingStep(step.id)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  background: "linear-gradient(45deg, #b45309, #92400e)",
                                  border: "none",
                                  borderRadius: "6px",
                                  color: "white",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                              >
                                📜 Submit Quest
                              </button>
                            ) : (
                              <div>
                                {/* Completion text */}
                                <div
                                  style={{
                                    padding: "10px 12px",
                                    background: "rgba(15,23,42,0.9)",
                                    border: "1px solid rgba(168,85,247,0.3)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#e2d9f3",
                                    lineHeight: "1.7",
                                    fontStyle: "italic",
                                    marginBottom: "10px",
                                  }}
                                >
                                  {step.completionText}
                                </div>
                                <div style={{ fontSize: "11px", color: "#a855f7", marginBottom: "8px", fontWeight: "bold" }}>
                                  How do you respond?
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {step.dialogueChoices.map((choice, ci) => (
                                    <button
                                      key={ci}
                                      onClick={() => handleChoiceClick(step.id, choice)}
                                      style={{
                                        padding: "10px 12px",
                                        textAlign: "left",
                                        background: choice.corruptionDelta >= 0
                                          ? "rgba(190,18,60,0.1)"
                                          : "rgba(59,130,246,0.1)",
                                        border: `1px solid ${choice.corruptionDelta >= 0 ? "rgba(190,18,60,0.4)" : "rgba(59,130,246,0.4)"}`,
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        color: "white",
                                        width: "100%",
                                      }}
                                    >
                                      <div style={{ fontSize: "12px", fontWeight: "bold", color: choice.corruptionDelta >= 0 ? "#fca5a5" : "#93c5fd", marginBottom: "4px" }}>
                                        {choice.label}
                                      </div>
                                      <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: "1.5" }}>
                                        {choice.text}
                                      </div>
                                      <div style={{ fontSize: "10px", marginTop: "5px", color: choice.corruptionDelta >= 0 ? "#f87171" : "#60a5fa" }}>
                                        {choice.corruptionDelta >= 0 ? `🩸 Corruption +${choice.corruptionDelta}` : `✨ Corruption ${choice.corruptionDelta}`}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => setSubmittingStep(null)}
                                  style={{
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "7px",
                                    background: "none",
                                    border: "1px solid #374151",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    color: "#475569",
                                    fontSize: "11px",
                                  }}
                                >
                                  Decide later
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── COMPLETED: Show completion text + chosen dialogue ── */}
                        {stepDone && (
                          <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.6", marginBottom: "8px" }}>
                              {step.description}
                            </div>
                            <div
                              style={{
                                padding: "8px 10px",
                                background: "rgba(34,197,94,0.05)",
                                border: "1px solid #14532d",
                                borderRadius: "6px",
                                fontSize: "11px",
                                color: "#86efac",
                                lineHeight: "1.7",
                                fontStyle: "italic",
                                marginBottom: choiceMade ? "8px" : "0",
                              }}
                            >
                              {step.completionText}
                            </div>
                            {choiceMade && (
                              <div
                                style={{
                                  padding: "8px 10px",
                                  background: choiceMade.corruptionDelta >= 0
                                    ? "rgba(190,18,60,0.06)"
                                    : "rgba(59,130,246,0.06)",
                                  border: `1px solid ${choiceMade.corruptionDelta >= 0 ? "#7f1d1d" : "#1e3a5f"}`,
                                  borderRadius: "6px",
                                  fontSize: "10px",
                                  color: choiceMade.corruptionDelta >= 0 ? "#fca5a5" : "#93c5fd",
                                  lineHeight: "1.6",
                                }}
                              >
                                <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
                                  You chose: {choiceMade.label} {choiceMade.corruptionDelta >= 0 ? `(🩸 +${choiceMade.corruptionDelta})` : `(✨ ${choiceMade.corruptionDelta})`}
                                </div>
                                <div style={{ fontStyle: "italic" }}>{choiceMade.text}</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Step locked (not available yet) */}
                        {!stepDone && !isAvailable && !isHunting && !isReadyToSubmit && (
                          <div style={{ fontSize: "11px", color: "#374151" }}>
                            Complete the previous step to unlock this quest.
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
