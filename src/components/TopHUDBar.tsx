import { useMonetization } from "../context/MonetizationContext";

interface TopHUDBarProps {
  level: number;
  hp: number;
  maxHp: number;
}

export function TopHUDBar({ level, hp, maxHp }: TopHUDBarProps) {
  const { coins, lives, isPremium } = useMonetization();

  const hpPercent = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const hpBarColor =
    hpPercent > 50
      ? "#22c55e"
      : hpPercent > 25
      ? "#fbbf24"
      : "#ef4444";

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
        height: "56px",
        boxSizing: "border-box",
        zIndex: 900,
      }}
    >
      {/* Level badge */}
      <div
        style={{
          flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          borderRadius: "6px",
          padding: "2px 7px",
          fontSize: "11px",
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

      {/* Coin count */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "3px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#fbbf24",
          whiteSpace: "nowrap",
        }}
      >
        <span>🪙</span>
        <span>{coins.toLocaleString()}</span>
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
  );
}
