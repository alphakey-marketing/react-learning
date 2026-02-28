import { Character } from "../types/character";
import { SKILLS_DB } from "../data/skills";

interface SkillWindowProps {
  character: Character;
  onLearnSkill: (skillId: string) => void;
  onClose: () => void;
}

export function SkillWindow({
  character,
  onLearnSkill,
  onClose,
}: SkillWindowProps) {
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
          const isMaxed = currentLevel >= skill.maxLevel;
          const mpCost =
            currentLevel > 0 ? skill.mpCost(currentLevel) : skill.mpCost(1);

          return (
            <div
              key={skill.id}
              style={{
                background: "#2a2a2a",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #444",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
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
                </div>
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
