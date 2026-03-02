import { useEffect, useState } from "react";
import { Achievement } from "../types/achievement";
import { getRarityColor } from "../types/equipment";

interface AchievementPopupProps {
  achievement: Achievement;
  onComplete: () => void;
}

export function AchievementPopup({ achievement, onComplete }: AchievementPopupProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setVisible(true), 50);

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 5000);

    return () => clearTimeout(hideTimer);
  }, [onComplete]);

  const rarityColorMap = {
    common: "#9ca3af",
    rare: "#3b82f6",
    epic: "#a855f7",
    legendary: "#f59e0b",
  };

  const rarityColor = rarityColorMap[achievement.rarity];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: visible && !exiting ? "20px" : "-400px",
        zIndex: 9999,
        transition: "right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: `3px solid ${rarityColor}`,
          borderRadius: "12px",
          padding: "16px",
          minWidth: "320px",
          boxShadow: `0 10px 40px ${rarityColor}66, 0 0 20px ${rarityColor}33`,
          animation: exiting ? "none" : "achievement-glow 2s ease-in-out infinite",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              filter: `drop-shadow(0 0 8px ${rarityColor})`,
            }}
          >
            {achievement.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "10px",
                color: rarityColor,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}
            >
              🏆 Achievement Unlocked!
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: rarityColor,
                marginBottom: "2px",
              }}
            >
              {achievement.name}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                textTransform: "capitalize",
              }}
            >
              {achievement.rarity} • {achievement.category}
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "12px",
            color: "#d1d5db",
            marginBottom: "10px",
            paddingLeft: "52px",
          }}
        >
          {achievement.description}
        </div>

        {/* Reward */}
        {achievement.rewardTitle && (
          <div
            style={{
              fontSize: "11px",
              color: "#fbbf24",
              paddingLeft: "52px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🎁</span>
            <span>Title Unlocked: "{achievement.rewardTitle}"</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes achievement-glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px ${rarityColor}66);
          }
          50% {
            filter: drop-shadow(0 0 20px ${rarityColor}99);
          }
        }
      `}</style>
    </div>
  );
}
