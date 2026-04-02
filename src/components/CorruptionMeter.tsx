import React from "react";
import { getCorruptionModifiers } from "../logic/corruption";

interface CorruptionMeterProps {
  corruptionLevel: number; // 0–100
}

function getCorruptionColor(level: number): string {
  if (level < 20) return "#7c3aed";
  if (level < 40) return "#8b3cf7";
  if (level < 60) return "#9333ea";
  if (level < 80) return "#a21caf";
  return "#be123c";
}

export function CorruptionMeter({ corruptionLevel }: CorruptionMeterProps) {
  const clampedLevel = Math.max(0, Math.min(100, corruptionLevel));
  const displayLevel = Math.floor(clampedLevel);
  const color = getCorruptionColor(clampedLevel);
  const label = getCorruptionModifiers(clampedLevel).tierName;

  if (clampedLevel === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 8px",
        background: "rgba(10,0,20,0.7)",
        borderRadius: "5px",
        border: `1px solid ${color}40`,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "10px", lineHeight: 1 }}>🌑</span>
      <div style={{ flex: 1, minWidth: "40px" }}>
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "#1e1b2e",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${clampedLevel}%`,
              height: "100%",
              background: `linear-gradient(90deg, #7c3aed, ${color})`,
              borderRadius: "2px",
              transition: "width 0.6s ease-out, background 0.6s ease",
              boxShadow: clampedLevel > 50 ? `0 0 6px ${color}` : "none",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "8px",
            color: color,
            marginTop: "1px",
            textAlign: "right",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          {label} {displayLevel}%
        </div>
      </div>
    </div>
  );
}
