import React, { useState } from "react";
import { getCorruptionModifiers } from "../logic/corruption";

interface CorruptionMeterProps {
  corruptionLevel: number; // 0–100
}

const TIER_COLORS: Record<string, string> = {
  Untouched: "#7c3aed",
  Stirring: "#8b3cf7",
  Marked: "#9333ea",
  Bleeding: "#a21caf",
  Unravelling: "#b91c5c",
  Devoured: "#be123c",
};

export function CorruptionMeter({ corruptionLevel }: CorruptionMeterProps) {
  const [showEffects, setShowEffects] = useState(false);
  const clampedLevel = Math.max(0, Math.min(100, corruptionLevel));
  const displayLevel = Math.floor(clampedLevel);
  const mods = getCorruptionModifiers(clampedLevel);
  const label = mods.tierName;
  const color = TIER_COLORS[label] ?? "#be123c";

  if (clampedLevel === 0) return null;

  const hasRarityBias = Object.keys(mods.rarityBias).length > 0;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowEffects(v => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 8px",
          background: "rgba(10,0,20,0.7)",
          borderRadius: "5px",
          border: `1px solid ${color}40`,
          flexShrink: 0,
          cursor: "pointer",
          outline: "none",
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
            {label} {displayLevel}% ▾
          </div>
        </div>
      </button>

      {/* Effects tooltip panel */}
      {showEffects && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            zIndex: 200,
            background: "linear-gradient(135deg, #0f0d1a, #1a1428)",
            border: `1px solid ${color}60`,
            borderRadius: "10px",
            padding: "10px 12px",
            minWidth: "200px",
            boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 12px ${color}20`,
            color: "white",
            fontSize: "11px",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontWeight: "bold", color: color, marginBottom: "8px", fontSize: "12px" }}>
            🩸 {label} — Current Effects
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <EffectRow label="Enemy HP" mult={mods.enemyHpMult} color={color} />
            <EffectRow label="Enemy ATK" mult={mods.enemyAtkMult} color={color} />
            <EffectRow label="Enemy DEF" mult={mods.enemyDefMult} color={color} />
            {hasRarityBias && (
              <div style={{ marginTop: "4px", paddingTop: "6px", borderTop: `1px solid ${color}30` }}>
                <div style={{ color: "#a855f7", fontWeight: "bold", marginBottom: "4px" }}>✨ Drop Rarity Bonus</div>
                {mods.rarityBias.uncommon && (
                  <div style={{ color: "#86efac", fontSize: "10px" }}>+{mods.rarityBias.uncommon}% Uncommon chance</div>
                )}
                {mods.rarityBias.rare && (
                  <div style={{ color: "#60a5fa", fontSize: "10px" }}>+{mods.rarityBias.rare}% Rare chance</div>
                )}
                {mods.rarityBias.epic && (
                  <div style={{ color: "#c084fc", fontSize: "10px" }}>+{mods.rarityBias.epic}% Epic chance</div>
                )}
                {mods.rarityBias.legendary && (
                  <div style={{ color: "#fbbf24", fontSize: "10px" }}>+{mods.rarityBias.legendary}% Legendary chance</div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowEffects(false)}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "4px",
              background: "none",
              border: `1px solid ${color}40`,
              borderRadius: "5px",
              color: "#6b7280",
              fontSize: "10px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function EffectRow({ label, mult, color }: { label: string; mult: number; color: string }) {
  const pct = Math.round((mult - 1) * 100);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ color: pct > 0 ? color : "#6b7280", fontWeight: "bold" }}>
        ×{mult.toFixed(2)}{pct > 0 ? ` (+${pct}%)` : ""}
      </span>
    </div>
  );
}
