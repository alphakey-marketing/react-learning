import { useEffect, useState } from "react";
import { useMonetization } from "../context/MonetizationContext";

interface LivesBarProps {
  onWatchAd: () => void;
  onBuyCoins: () => void;
}

export function LivesBar({ onWatchAd, onBuyCoins }: LivesBarProps) {
  const { lives, maxLives, isPremium, lastLifeRegenTime } = useMonetization();
  const [timeToNextLife, setTimeToNextLife] = useState("");

  const LIFE_REGEN_MS = 30 * 60 * 1000;
  const DISPLAY_HEARTS = 5; // always show 5 heart slots visually

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

  // For display: cap at 5 hearts visually, show number badge if premium (max 10)
  const filledHearts = Math.min(lives, DISPLAY_HEARTS);
  const extraLives = lives > DISPLAY_HEARTS ? lives - DISPLAY_HEARTS : 0;

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

      {/* 5 Heart slots */}
      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {Array.from({ length: DISPLAY_HEARTS }).map((_, i) => (
          <span key={i} style={{ fontSize: "18px", opacity: i < filledHearts ? 1 : 0.25 }}>
            ❤️
          </span>
        ))}
        {/* Extra lives badge — only shows when premium gives >5 lives */}
        {extraLives > 0 && (
          <span style={{
            marginLeft: "4px",
            background: "#fbbf24",
            color: "#000",
            fontWeight: "bold",
            fontSize: "11px",
            padding: "1px 6px",
            borderRadius: "999px",
          }}>
            +{extraLives}
          </span>
        )}
      </div>

      {/* Lives count */}
      <span style={{ color: "#aaa", fontSize: "12px" }}>
        {lives}/{maxLives}
      </span>

      {/* Regen timer — only when not full */}
      {lives < maxLives && (
        <span style={{ color: "#aaa", fontSize: "12px" }}>
          ⏱ next in <strong style={{ color: "#fff" }}>{timeToNextLife}</strong>
        </span>
      )}

      {/* Premium badge */}
      {isPremium && (
        <span style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold" }}>
          ⭐ Premium
        </span>
      )}

      {/* Refill buttons — only when lives are low AND not premium */}
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
            👑 VIP Store
          </button>
        </div>
      )}
    </div>
  );
}