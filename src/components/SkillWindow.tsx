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
  const availableSkills = SKILLS_DB[character.jobClass];

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
        zIndex: 999,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "2px solid #7c3aed",
          borderRadius: "12px",
          padding: "20px",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 0 40px rgba(124, 58, 237, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", color: "#fbbf24" }}>
            📖 Skill Tree ({character.jobClass})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ✕ Close
          </button>
        </div>

        <div style={{ fontSize: "13px", marginBottom: "15px", color: "#aaa", background: "#111", padding: "10px", borderRadius: "6px" }}>
          <strong style={{ color: "#fbbf24" }}>Skill Points Available: {character.skillPoints}</strong>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {availableSkills.map((skill) => {
            const currentLevel = character.learnedSkills[skill.id] || 0;
            const isLearned = currentLevel > 0;
            const isMaxed = currentLevel >= skill.maxLevel;
            const isAutoAttack = character.autoAttackSkillId === skill.id;
            const mpCost = currentLevel > 0 ? skill.mpCost(currentLevel) : skill.mpCost(1);
            
            const damageCheck = currentLevel > 0 ? skill.damageMultiplier(currentLevel) : skill.damageMultiplier(1);
            const canBeAutoAttack = isLearned && damageCheck > 0;
            const isUtility = damageCheck === 0;

            return (
              <div
                key={skill.id}
                style={{
                  background: isAutoAttack ? "#2a1a4a" : "#2a2a2a",
                  padding: "12px",
                  borderRadius: "8px",
                  border: isAutoAttack ? "2px solid #7c3aed" : "1px solid #444",
                  boxShadow: isAutoAttack ? "0 0 15px rgba(124, 58, 237, 0.5)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ color: "#fbbf24", fontSize: "15px" }}>{skill.nameZh}</strong>
                    <span
                      style={{
                        color: "#aaa",
                        fontSize: "12px",
                        marginLeft: "8px",
                      }}
                    >
                      Lv.{currentLevel}/{skill.maxLevel}
                    </span>
                    {isAutoAttack && (
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "11px",
                          marginLeft: "10px",
                          background: "linear-gradient(45deg, #7c3aed, #a855f7)",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.5)",
                        }}
                      >
                        ⚡ AUTO ATTACK
                      </span>
                    )}
                    {isUtility && (
                      <span
                        style={{
                          color: "#10b981",
                          fontSize: "10px",
                          marginLeft: "8px",
                          background: "rgba(16, 185, 129, 0.2)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "1px solid #10b981",
                        }}
                      >
                        🛡️ UTILITY
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => onLearnSkill(skill.id)}
                      disabled={isMaxed || character.skillPoints <= 0}
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        background:
                          isMaxed || character.skillPoints <= 0 ? "#555" : "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor:
                          isMaxed || character.skillPoints <= 0
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      {isMaxed ? "MAX" : "Learn"}
                    </button>
                    {canBeAutoAttack && (
                      <button
                        onClick={() => onSetAutoAttack(skill.id)}
                        disabled={isAutoAttack}
                        style={{
                          padding: "8px 16px",
                          fontSize: "12px",
                          background: isAutoAttack ? "#555" : "linear-gradient(45deg, #3b82f6, #2563eb)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: isAutoAttack ? "not-allowed" : "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        {isAutoAttack ? "✓ Active" : "Set Auto"}
                      </button>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#ccc",
                    marginBottom: "6px",
                    lineHeight: "1.5",
                  }}
                >
                  {skill.description}
                </div>
                <div style={{ fontSize: "11px", color: "#999" }}>
                  {isUtility ? (
                    <span>Passive/Buff Skill - Cannot auto-attack</span>
                  ) : (
                    <span>MP Cost: {mpCost} | Cooldown: {skill.cooldown}s | Dmg: {(damageCheck * 100).toFixed(0)}%</span>
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
