import React from "react";

interface QuestItemPickupData {
  chainTitle: string;
  stepTitle: string;
  itemName: string;
  itemIcon: string;
}

interface QuestStepCompleteModalProps {
  data: QuestItemPickupData | null;
  onClose: () => void;
}

export function QuestStepCompleteModal({ data, onClose }: QuestStepCompleteModalProps) {
  if (!data) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
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
          maxWidth: "380px",
          width: "100%",
          color: "white",
          boxShadow: "0 0 40px rgba(124,58,237,0.28)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{data.itemIcon}</div>
        <div
          style={{
            fontSize: "10px",
            color: "#7c3aed",
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          📜 Quest Item Found!
        </div>
        <div style={{ fontSize: "15px", fontWeight: "bold", color: "#e2d9f3", marginBottom: "4px" }}>
          {data.itemName}
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "16px" }}>
          {data.chainTitle} — {data.stepTitle}
        </div>

        <div
          style={{
            padding: "10px 14px",
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#c084fc",
            marginBottom: "16px",
            lineHeight: "1.6",
          }}
        >
          Visit the <strong>Quest Log</strong> to submit this item and discover what it means.
        </div>

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
          Got It
        </button>
      </div>
    </div>
  );
}
