import { Achievement, AchievementCategory } from "../types/achievement";
import { ACHIEVEMENTS_DB } from "../data/achievements";
import { useState } from "react";

interface AchievementListProps {
  unlockedIds: Set<string>;
  progress: Record<string, number>;
  onClose: () => void;
}

const PER_PAGE = 6;

const RARITY_COLORS: Record<string, string> = {
  common: "#9ca3af",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  combat: "⚔️",
  progression: "📈",
  collection: "🎒",
  exploration: "🗺️",
};

const CATEGORIES: AchievementCategory[] = ["combat", "progression", "collection", "exploration"];

export function AchievementList({ unlockedIds, progress, onClose }: AchievementListProps) {
  const [category, setCategory] = useState<AchievementCategory | "all">("all");
  const [page, setPage] = useState(0);

  const filtered = ACHIEVEMENTS_DB.filter(a => category === "all" || a.category === category);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleCategoryChange = (cat: AchievementCategory | "all") => {
    setCategory(cat);
    setPage(0);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        padding: "0",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px",
            borderBottom: "1px solid #1e293b",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              minWidth: "44px",
              minHeight: "44px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              touchAction: "manipulation",
            }}
          >
            ‹
          </button>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fbbf24" }}>
              🏆 Achievements
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              {unlockedIds.size} / {ACHIEVEMENTS_DB.length} unlocked
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid #1e293b",
            flexShrink: 0,
            overflowX: "auto",
          }}
        >
          {(["all", ...CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                flex: "0 0 auto",
                padding: "10px 14px",
                background: "transparent",
                color: category === cat ? "#fbbf24" : "#64748b",
                border: "none",
                borderBottom: category === cat ? "2px solid #fbbf24" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: category === cat ? "bold" : "normal",
                whiteSpace: "nowrap",
                touchAction: "manipulation",
              }}
            >
              {cat === "all" ? "🌟 All" : `${CATEGORY_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Achievement cards — scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 14px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {pageItems.map((achievement: Achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const current = progress[achievement.requirement.type] || 0;
            const target = achievement.requirement.target;
            const percent = Math.min(100, Math.floor((current / target) * 100));
            const color = RARITY_COLORS[achievement.rarity] || "#9ca3af";

            return (
              <div
                key={achievement.id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  background: isUnlocked ? "rgba(34,197,94,0.08)" : "#0f172a",
                  border: "1px solid " + (isUnlocked ? "#22c55e" : "#1e293b"),
                  borderRadius: "10px",
                  minHeight: "44px",
                }}
              >
                {/* Achievement header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: isUnlocked ? 0 : "8px" }}>
                  <span style={{ fontSize: "22px", flexShrink: 0, marginTop: "1px" }}>
                    {isUnlocked ? "✅" : "🔒"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: isUnlocked ? color : "#64748b",
                        fontWeight: "bold",
                        fontSize: "13px",
                        marginBottom: "3px",
                      }}
                    >
                      {achievement.name}
                      <span
                        style={{
                          fontSize: "10px",
                          color: color,
                          fontWeight: "normal",
                          marginLeft: "6px",
                          textTransform: "capitalize",
                          opacity: 0.8,
                        }}
                      >
                        [{achievement.rarity}]
                      </span>
                    </div>
                    <div style={{ color: "#475569", fontSize: "11px", lineHeight: "1.4" }}>
                      {achievement.description}
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: "14px" }}>
                    {CATEGORY_ICONS[achievement.category]}
                  </span>
                </div>

                {/* Progress bar — only for locked achievements */}
                {!isUnlocked && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "10px",
                        color: "#64748b",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{percent}% complete</span>
                      <span>{Math.min(current, target).toLocaleString()} / {target.toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "#1e293b",
                        borderRadius: "4px",
                        overflow: "hidden",
                        border: "1px solid #334155",
                      }}
                    >
                      <div
                        style={{
                          width: percent + "%",
                          height: "100%",
                          background: color,
                          borderRadius: "4px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {pageItems.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#475569",
                padding: "40px 20px",
                fontSize: "14px",
              }}
            >
              No achievements in this category
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              borderTop: "1px solid #1e293b",
              flexShrink: 0,
              paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                minHeight: "44px",
                minWidth: "80px",
                padding: "8px 16px",
                background: page === 0 ? "#1e293b" : "#334155",
                color: page === 0 ? "#475569" : "white",
                border: "1px solid #334155",
                borderRadius: "8px",
                cursor: page === 0 ? "not-allowed" : "pointer",
                fontSize: "13px",
                touchAction: "manipulation",
              }}
            >
              ‹ Prev
            </button>
            <span style={{ color: "#64748b", fontSize: "12px" }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={{
                minHeight: "44px",
                minWidth: "80px",
                padding: "8px 16px",
                background: page === totalPages - 1 ? "#1e293b" : "#334155",
                color: page === totalPages - 1 ? "#475569" : "white",
                border: "1px solid #334155",
                borderRadius: "8px",
                cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                fontSize: "13px",
                touchAction: "manipulation",
              }}
            >
              Next ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
