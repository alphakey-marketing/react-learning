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
  // Get all skills including Novice skills (for basic_attack)
  const jobSkills = SKILLS_DB[character.jobClass];
  const noviceSkills = character.jobClass !== "Novice" ? SKILLS_DB.Novice : [];
  const availableSkills = [...jobSkills, ...noviceSkills];

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

          return (
            <div
              key={skill.id}
              style={{
                background: isAutoAttack ? "#2a1a4a" : "#2a2a2a",
                padding: "8px",
                borderRadius: "4px",
                border: isAutoAttack ? "2px solid #7c3aed" : "1px solid #444",
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
                        color: "#fbbf24",
                        fontSize: "10px",
                        marginLeft: "6px",
                        background: "#7c3aed",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      ⭐ Auto
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
                  {isLearned && (
                    <button
                      onClick={() => onSetAutoAttack(skill.id)}
                      disabled={isAutoAttack}
                      style={{
                        padding: "4px 12px",
                        fontSize: "10px",
                        background: isAutoAttack ? "#555" : "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: isAutoAttack ? "not-allowed" : "pointer",
                      }}
                    >
                      {isAutoAttack ? "✓ Auto" : "Set Auto"}
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
                MP Cost: {mpCost} | Cooldown: {skill.cooldown}s
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
