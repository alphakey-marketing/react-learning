import { Character } from "../types/character";
import { SKILLS_DB } from "../data/skills";

interface SkillWindowProps {
  character: Character;
  onLearnSkill: (skillId: string) => void;
  onSetAutoAttack: (skillId: string) => void;
  onClose: () => void;
}

export function SkillWindow({
  character,
  onLearnSkill,
  onSetAutoAttack,
  onClose,
}: SkillWindowProps) {
  const skills = SKILLS_DB[character.jobClass] || [];

  const getSkillColor = (skillId: string, learnedLevel: number) => {
    if (learnedLevel === 0) return "#555";
    if (character.autoAttackSkillId === skillId) return "#10b981";
    return "#3b82f6";
  };

  const getSkillBadge = (skillId: string) => {
    // Highlight Jupitel Thunder for Wizards as boss DPS skill
    if (character.jobClass === "Wizard" && skillId === "jupitel_thunder") {
      return { text: "⚡ BOSS DPS", color: "#f59e0b" };
    }
    // Highlight Energy Coat as defensive passive
    if (character.jobClass === "Wizard" && skillId === "energy_coat") {
      return { text: "🛡️ PASSIVE", color: "#8b5cf6" };
    }
    return null;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
          padding: "20px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "white",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              color: "#60a5fa",
            }}
          >
            📖 Skill Window
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ✕ Close
          </button>
        </div>

        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            background: "rgba(59, 130, 246, 0.15)",
            borderRadius: "6px",
            border: "1px solid #3b82f6",
            fontSize: "13px",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            💎 Skill Points: <strong>{character.skillPoints}</strong>
          </div>
          <div style={{ fontSize: "11px", color: "#aaa" }}>
            Top Priority Skill: <strong>{character.autoAttackSkillId.replace('_', ' ').toUpperCase()}</strong>
          </div>
          <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", fontStyle: "italic" }}>
            (Smart rotation will attempt to use this skill first, then fallback to other available skills if on CD/no MP)
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {skills.map((skill) => {
            const learnedLevel = character.learnedSkills[skill.id] || 0;
            const canLearn = character.skillPoints > 0 && learnedLevel < skill.maxLevel;
            const isAutoAttack = character.autoAttackSkillId === skill.id;
            const badge = getSkillBadge(skill.id);

            return (
              <div
                key={skill.id}
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: `2px solid ${getSkillColor(skill.id, learnedLevel)}`,
                  borderRadius: "8px",
                  padding: "12px",
                  position: "relative",
                }}
              >
                {/* Badge for special skills */}
                {badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "10px",
                      background: badge.color,
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      boxShadow: `0 0 10px ${badge.color}`,
                    }}
                  >
                    {badge.text}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
                      {skill.nameZh}
                      {isAutoAttack && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: "#10b981",
                            background: "rgba(16, 185, 129, 0.2)",
                            padding: "2px 6px",
                            borderRadius: "3px",
                          }}
                        >
                          ⭐ Priority
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
                      {skill.description}
                    </div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      Level: {learnedLevel} / {skill.maxLevel} | MP: {skill.mpCost(learnedLevel || 1)} |
                      DMG: {(skill.damageMultiplier(learnedLevel || 1) * 100).toFixed(0)}%
                      {skill.cooldown > 0 && ` | CD: ${skill.cooldown}s`}
                      {skill.targetCount && skill.targetCount > 1 && (
                        <span style={{ color: "#f59e0b" }}> | AOE ({skill.targetCount} targets)</span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: getSkillColor(skill.id, learnedLevel),
                      minWidth: "40px",
                      textAlign: "center",
                    }}
                  >
                    {learnedLevel}/{skill.maxLevel}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => onLearnSkill(skill.id)}
                    disabled={!canLearn}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: canLearn
                        ? "linear-gradient(to bottom, #3b82f6, #2563eb)"
                        : "#333",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: canLearn ? "pointer" : "not-allowed",
                      fontSize: "12px",
                      fontWeight: "bold",
                      opacity: canLearn ? 1 : 0.5,
                    }}
                  >
                    {learnedLevel === 0 ? "📖 Learn" : "⬆️ Level Up"}
                  </button>
                  {skill.effect !== "buff" && skill.effect !== "passive" && skill.effect !== "debuff" && learnedLevel > 0 && (
                    <button
                      onClick={() => onSetAutoAttack(skill.id)}
                      disabled={isAutoAttack}
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: isAutoAttack
                          ? "#10b981"
                          : "linear-gradient(to bottom, #f59e0b, #d97706)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isAutoAttack ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        opacity: isAutoAttack ? 0.6 : 1,
                      }}
                    >
                      {isAutoAttack ? "✓ Priority" : "⭐ Set Priority"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
