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
  // Only get skills for current job (basic_attack is already included in each job's SKILLS_DB)
  const availableSkills = SKILLS_DB[character.jobClass];

  return (
    <div
      style={{
        marginBottom: "15px",
        background: "#1a1a1a",
        padding: "12px",
        borderRadius: "6px",
        border: "2px solid #7c3aed",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "14px", color: "#fbbf24" }}>
          📖 Skill Tree ({character.jobClass})
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "#444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ fontSize: "11px", marginBottom: "8px", color: "#aaa" }}>
        Skill Points: {character.skillPoints}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {availableSkills.map((skill) => {
          const currentLevel = character.learnedSkills[skill.id] || 0;
          const isLearned = currentLevel > 0;
          const isMaxed = currentLevel >= skill.maxLevel;
          const isAutoAttack = character.autoAttackSkillId === skill.id;
          const mpCost = currentLevel > 0 ? skill.mpCost(currentLevel) : skill.mpCost(1);
          
          // Check if skill can be used as auto-attack (only offensive skills with damage > 0)
          const damageCheck = currentLevel > 0 ? skill.damageMultiplier(currentLevel) : skill.damageMultiplier(1);
          const canBeAutoAttack = isLearned && damageCheck > 0;
          const isUtility = damageCheck === 0;

          return (
            <div
              key={skill.id}
              style={{
                background: isAutoAttack ? "#2a1a4a" : "#2a2a2a",
                padding: "8px",
                borderRadius: "4px",
                border: isAutoAttack ? "2px solid #7c3aed" : "1px solid #444",
                boxShadow: isAutoAttack ? "0 0 10px rgba(124, 58, 237, 0.5)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ color: "#fbbf24" }}>{skill.nameZh}</strong>
                  <span
                    style={{
                      color: "#aaa",
                      fontSize: "10px",
                      marginLeft: "6px",
                    }}
                  >
                    Lv.{currentLevel}/{skill.maxLevel}
                  </span>
                  {isAutoAttack && (
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "10px",
                        marginLeft: "6px",
                        background: "linear-gradient(45deg, #7c3aed, #a855f7)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 5px rgba(124, 58, 237, 0.4)",
                      }}
                    >
                      ⚡ AUTO ATTACK
                    </span>
                  )}
                  {isUtility && (
                    <span
                      style={{
                        color: "#10b981",
                        fontSize: "9px",
                        marginLeft: "6px",
                        background: "rgba(16, 185, 129, 0.2)",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        border: "1px solid #10b981",
                      }}
                    >
                      🛡️ UTILITY
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => onLearnSkill(skill.id)}
                    disabled={isMaxed || character.skillPoints <= 0}
                    style={{
                      padding: "4px 12px",
                      fontSize: "10px",
                      background:
                        isMaxed || character.skillPoints <= 0 ? "#555" : "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor:
                        isMaxed || character.skillPoints <= 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {isMaxed ? "MAX" : "Learn"}
                  </button>
                  {canBeAutoAttack && (
                    <button
                      onClick={() => onSetAutoAttack(skill.id)}
                      disabled={isAutoAttack}
                      style={{
                        padding: "4px 12px",
                        fontSize: "10px",
                        background: isAutoAttack ? "#555" : "linear-gradient(45deg, #3b82f6, #2563eb)",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: isAutoAttack ? "not-allowed" : "pointer",
                        fontWeight: isAutoAttack ? "normal" : "bold",
                      }}
                    >
                      {isAutoAttack ? "✓ Active" : "Set Auto"}
                    </button>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#bbb",
                  marginBottom: "4px",
                }}
              >
                {skill.description}
              </div>
              <div style={{ fontSize: "9px", color: "#888" }}>
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
  );
}
