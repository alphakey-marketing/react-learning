import React from "react";
import { ENDING_CHOICES } from "../data/questChains";

interface QuestEndingModalProps {
  onSealBloodline: () => void;
  onRemainUnbound: () => void;
  onClose: () => void;
}

export function QuestEndingModal({ onSealBloodline, onRemainUnbound, onClose }: QuestEndingModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0f0d1a 0%, #1a1428 100%)",
          border: "2px solid rgba(190,18,60,0.55)",
          borderRadius: "16px",
          padding: "28px 20px",
          maxWidth: "460px",
          width: "100%",
          color: "white",
          boxShadow: "0 0 60px rgba(190,18,60,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🩸</div>
          <div
            style={{
              fontSize: "11px",
              color: "#dc2626",
              fontWeight: "bold",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            The Rite of Unmaking
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              lineHeight: "1.65",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            The sage stands before you. She is tired of waiting. You must choose.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => { onSealBloodline(); onClose(); }}
            style={{
              padding: "14px 16px",
              textAlign: "left",
              background: "rgba(59,130,246,0.1)",
              border: "2px solid rgba(59,130,246,0.4)",
              borderRadius: "10px",
              cursor: "pointer",
              color: "white",
              width: "100%",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "13px", color: "#60a5fa", marginBottom: "5px" }}>
              🔒 {ENDING_CHOICES.seal.label}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5" }}>
              {ENDING_CHOICES.seal.description}
            </div>
            <div style={{ fontSize: "11px", color: "#60a5fa", marginTop: "6px" }}>
              Corruption {ENDING_CHOICES.seal.corruptionChange} (reduces)
            </div>
          </button>

          <button
            onClick={() => { onRemainUnbound(); onClose(); }}
            style={{
              padding: "14px 16px",
              textAlign: "left",
              background: "rgba(190,18,60,0.1)",
              border: "2px solid rgba(190,18,60,0.4)",
              borderRadius: "10px",
              cursor: "pointer",
              color: "white",
              width: "100%",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "13px", color: "#f87171", marginBottom: "5px" }}>
              🌑 {ENDING_CHOICES.unbound.label}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5" }}>
              {ENDING_CHOICES.unbound.description}
            </div>
            <div style={{ fontSize: "11px", color: "#f87171", marginTop: "6px" }}>
              Corruption +{ENDING_CHOICES.unbound.corruptionChange}
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "14px",
            padding: "9px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            cursor: "pointer",
            color: "#475569",
            fontSize: "12px",
          }}
        >
          Decide Later
        </button>
      </div>
    </div>
  );
}
