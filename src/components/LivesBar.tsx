import { useEffect, useState } from "react";
import { useMonetization } from "../context/MonetizationContext";

interface LivesBarProps {
  onWatchAd: () => void;
  onBuyCoins: () => void;
}

export function LivesBar({ onWatchAd, onBuyCoins }: LivesBarProps) {
  const { lives, maxLives, isPremium, lastLifeRegenTime, coins } = useMonetization();
  const [timeToNextLife, setTimeToNextLife] = useState("");

  const LIFE_REGEN_MS = 30 * 60 * 1000;

  useEffect(() => {
    if (lives >= maxLives) {
      setTimeToNextLife("FULL");
      return;
    }
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastLifeRegenTime;
      const remaining = LIFE_REGEN_MS - (elapsed % LIFE_REGEN_MS);
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeToNextLife(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lives, maxLives, lastLifeRegenTime]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      background: "rgba(0,0,0,0.4)",
      border: "1px solid #c0392b",
      borderRadius: "10px",
      padding: "8px 14px",
      flexWrap: "wrap",
    }}>
      {/* Hearts */}
      <div style={{ display: "flex", gap: "3px" }}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <span key={i} style={{ fontSize: "18px", opacity: i < lives ? 1 : 0.25 }}>
            ❤️
          </span>
        ))}
      </div>

      {/* Regen timer */}
      {lives < maxLives && (
        <span style={{ color: "#aaa", fontSize: "12px" }}>
          ⏱ <strong style={{ color: "#fff" }}>{timeToNextLife}</strong>
        </span>
      )}

      {/* Premium badge */}
      {isPremium && (
        <span style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold" }}>
          ⭐ Premium
        </span>
      )}

      {/* Coin balance */}
      <span style={{ fontSize: "13px", color: "#fbbf24" }}>
        🪙 {coins.toLocaleString()}
      </span>

      {/* Refill buttons — only when lives are low and not premium */}
      {lives < maxLives && !isPremium && (
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={onWatchAd}
            style={{
              padding: "4px 10px",
              background: "rgba(16,185,129,0.2)",
              color: "#10b981",
              border: "1px solid #10b981",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            📺 Watch Ad (+1 ❤️)
          </button>
          <button
            onClick={onBuyCoins}
            style={{
              padding: "4px 10px",
              background: "rgba(251,191,36,0.2)",
              color: "#fbbf24",
              border: "1px solid #fbbf24",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            🪙 Buy Lives
          </button>
        </div>
      )}
    </div>
  );
}