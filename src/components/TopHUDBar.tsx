import { useMonetization } from "../context/MonetizationContext";

interface TopHUDBarProps {
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  corruptionLevel: number;
}

export function TopHUDBar({ level, hp, maxHp, mp, maxMp, corruptionLevel }: TopHUDBarProps) {
  const { lives, isPremium } = useMonetization();

  const hpPercent = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const hpBarColor =
    hpPercent > 50
      ? "#22c55e"
      : hpPercent > 25
      ? "#fbbf24"
      : "#ef4444";

  const mpPercent = maxMp > 0 ? (mp / maxMp) * 100 : 0;

  // Corruption bar: only show once it's meaningful (≥5)
  const showCorruption = corruptionLevel >= 5;
  const corruptionColor =
    corruptionLevel >= 75
      ? "#dc2626"       // Red — Devoured passive unlocked
      : corruptionLevel >= 50
      ? "#f97316"       // Orange — rare drops buffed
      : corruptionLevel >= 25
      ? "#a855f7"       // Purple — ATK +5%
      : "#6b7280";      // Gray — minimal

  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingBottom: "6px",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        borderBottom: "1px solid rgba(255,215,0,0.2)",
        minHeight: showCorruption ? "72px" : "56px",
        boxSizing: "border-box",
        zIndex: 900,
        flexDirection: "column",
      }}
    >
      {/* ── Main row: Level + HP + MP + Lives/PRO ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
        }}
      >
        {/* Level badge */}
        <div
          style={{
            flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            borderRadius: "6px",
            padding: "2px 7px",
            fontSize: "10px",
            fontWeight: "bold",
            color: "white",
            border: "1px solid rgba(167,139,250,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          Lv.{level}
        </div>

        {/* HP bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#1f2937",
              borderRadius: "5px",
              overflow: "hidden",
              border: "1px solid #374151",
            }}
          >
            <div
              style={{
                width: `${hpPercent}%`,
                height: "100%",
                background: hpBarColor,
                borderRadius: "5px",
                transition: "width 0.3s ease-out, background 0.3s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "#9ca3af",
              marginTop: "1px",
              textAlign: "right",
            }}
          >
            {hp}/{maxHp} HP
          </div>
        </div>

        {/* MP bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#1f2937",
              borderRadius: "5px",
              overflow: "hidden",
              border: "1px solid #374151",
            }}
          >
            <div
              style={{
                width: `${mpPercent}%`,
                height: "100%",
                background: "#3b82f6",
                borderRadius: "5px",
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "#9ca3af",
              marginTop: "1px",
              textAlign: "right",
            }}
          >
            {mp}/{maxMp} MP
          </div>
        </div>

        {/* Lives or PRO badge */}
        {isPremium ? (
          <div
            style={{
              flexShrink: 0,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              borderRadius: "6px",
              padding: "2px 7px",
              fontSize: "11px",
              fontWeight: "bold",
              color: "white",
              border: "1px solid rgba(251,191,36,0.4)",
              whiteSpace: "nowrap",
            }}
          >
            PRO
          </div>
        ) : (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#f87171",
              whiteSpace: "nowrap",
            }}
          >
            <span>❤️</span>
            <span>{lives}</span>
          </div>
        )}
      </div>

      {/* ── Corruption meter row (only when ≥5%) ── */}
      {showCorruption && (
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              color: corruptionColor,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            🌑 {Math.floor(corruptionLevel)}%
          </span>
          <div
            style={{
              flex: 1,
              height: "5px",
              background: "#1f2937",
              borderRadius: "3px",
              overflow: "hidden",
              border: "1px solid #374151",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, corruptionLevel)}%`,
                height: "100%",
                background: corruptionColor,
                borderRadius: "3px",
                transition: "width 0.6s ease-out, background 0.6s ease",
                boxShadow: corruptionLevel >= 75 ? `0 0 6px ${corruptionColor}` : "none",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "9px",
              color: "#6b7280",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {corruptionLevel >= 100
              ? "UNBOUND"
              : corruptionLevel >= 75
              ? "Devoured"
              : corruptionLevel >= 50
              ? "Tainted"
              : corruptionLevel >= 25
              ? "Marked"
              : "Stirring"}
          </span>
        </div>
      )}
    </div>
  );
}