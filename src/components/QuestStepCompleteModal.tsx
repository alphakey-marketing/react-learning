import React from "react";

interface QuestStepCompleteData {
  chainTitle: string;
  stepTitle: string;
  completionText: string;
  corruptionGain: number;
}

interface QuestStepCompleteModalProps {
  data: QuestStepCompleteData | null;
  onClose: () => void;
}

export function QuestStepCompleteModal({ data, onClose }: QuestStepCompleteModalProps) {
  if (!data) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0f0d1a 0%, #1a1428 100%)",
          border: "2px solid rgba(124,58,237,0.55)",
          borderRadius: "16px",
          padding: "24px 20px",
          maxWidth: "420px",
          width: "100%",
          color: "white",
          boxShadow: "0 0 40px rgba(124,58,237,0.28), inset 0 0 20px rgba(124,58,237,0.04)",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#7c3aed",
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          📜 Bloodline Memory Unlocked
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "16px" }}>
          {data.chainTitle} — {data.stepTitle}
        </div>

        <div style={{ borderTop: "1px solid rgba(124,58,237,0.3)", paddingTop: "14px", marginBottom: "16px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "#e2d9f3",
              lineHeight: "1.75",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            {data.completionText}
          </p>
        </div>

        {data.corruptionGain > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              background: "rgba(124,58,237,0.15)",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "12px",
              color: "#a855f7",
            }}
          >
            🩸 Corruption +{data.corruptionGain}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px",
            background: "linear-gradient(45deg, #7c3aed, #6d28d9)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "13px",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
