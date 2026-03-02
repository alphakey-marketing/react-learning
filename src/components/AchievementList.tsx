import { Achievement, AchievementCategory } from "../types/achievement";
import { ACHIEVEMENTS_DB } from "../data/achievements";

interface AchievementListProps {
  unlockedIds: Set<string>;
  progress: Record<string, number>;
  onClose: () => void;
}

export function AchievementList({ unlockedIds, progress, onClose }: AchievementListProps) {
  const categories: AchievementCategory[] = ["combat", "progression", "collection", "exploration"];

  const rarityColorMap = {
    common: "#9ca3af",
    rare: "#3b82f6",
    epic: "#a855f7",
    legendary: "#f59e0b",
  };

  const categoryIcons = {
    combat: "⚔️",
    progression: "📈",
    collection: "🎒",
    exploration: "🗺️",
  };

  const getProgress = (achievement: Achievement): { current: number; target: number; percent: number } => {
    const current = progress[achievement.requirement.type] || 0;
    const target = achievement.requirement.target;
    const percent = Math.min(100, Math.floor((current / target) * 100));
    return { current, target, percent };
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.9)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "3px solid #fbbf24",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              color: "#fbbf24",
              fontWeight: "bold",
            }}
          >
            🏆 Achievements
          </h2>
          <div style={{ fontSize: "14px", color: "#9ca3af" }}>
            {unlockedIds.size} / {ACHIEVEMENTS_DB.length} Unlocked
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#444",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ✖ Close
          </button>
        </div>

        {/* Categories */}
        {categories.map((category) => {
          const categoryAchievements = ACHIEVEMENTS_DB.filter((a) => a.category === category);
          const unlockedCount = categoryAchievements.filter((a) => unlockedIds.has(a.id)).length;

          return (
            <div key={category} style={{ marginBottom: "24px" }}>
              {/* Category Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid #444",
                }}
              >
                <span style={{ fontSize: "20px" }}>{categoryIcons[category]}</span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "#fbbf24",
                    textTransform: "capitalize",
                    fontWeight: "bold",
                  }}
                >
                  {category}
                </h3>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  ({unlockedCount}/{categoryAchievements.length})
                </span>
              </div>

              {/* Achievement Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "12px",
                }}
              >
                {categoryAchievements.map((achievement) => {
                  const unlocked = unlockedIds.has(achievement.id);
                  const { current, target, percent } = getProgress(achievement);
                  const rarityColor = rarityColorMap[achievement.rarity];

                  return (
                    <div
                      key={achievement.id}
                      style={{
                        background: unlocked ? "#2a2a2a" : "#1a1a1a",
                        border: `2px solid ${unlocked ? rarityColor : "#333"}`,
                        borderRadius: "8px",
                        padding: "12px",
                        opacity: unlocked ? 1 : 0.6,
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Progress Bar Background */}
                      {!unlocked && percent > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: `${percent}%`,
                            background: `linear-gradient(90deg, transparent, ${rarityColor}22)`,
                            transition: "width 0.5s ease",
                          }}
                        />
                      )}

                      <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Icon & Title */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                          <div
                            style={{
                              fontSize: "32px",
                              filter: unlocked ? `drop-shadow(0 0 6px ${rarityColor})` : "grayscale(100%)",
                            }}
                          >
                            {achievement.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: unlocked ? rarityColor : "#666",
                                marginBottom: "2px",
                              }}
                            >
                              {unlocked ? achievement.name : "???"}
                            </div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#666",
                                textTransform: "capitalize",
                              }}
                            >
                              {achievement.rarity}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div
                          style={{
                            fontSize: "11px",
                            color: unlocked ? "#9ca3af" : "#555",
                            marginBottom: "8px",
                          }}
                        >
                          {unlocked ? achievement.description : "Locked"}
                        </div>

                        {/* Progress */}
                        {!unlocked && (
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#666",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>
                              {current} / {target}
                            </span>
                            <span>{percent}%</span>
                          </div>
                        )}

                        {/* Reward */}
                        {unlocked && achievement.rewardTitle && (
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#fbbf24",
                              marginTop: "6px",
                              padding: "4px 8px",
                              background: "#3a2f0a",
                              borderRadius: "4px",
                            }}
                          >
                            🎁 {achievement.rewardTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
