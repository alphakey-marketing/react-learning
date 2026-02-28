import { Character } from "../types/character";
import { SKILLS_DB } from "../data/skills";
import { isMagicSkill } from "../logic/combat";

interface SkillHotkeysProps {
  character: Character;
  skillCooldowns: Record<string, number>;
  onUseSkill: (skillId: string) => void;
  disabled?: boolean;
}

export function SkillHotkeys({
  character,
  skillCooldowns,
  onUseSkill,
  disabled = false,
}: SkillHotkeysProps) {
  const availableSkills = SKILLS_DB[character.jobClass];
  const learnedSkills = availableSkills.filter(
    (skill) => (character.learnedSkills[skill.id] || 0) > 0
  );

  return (
    <div style={{ marginBottom: "10px" }}>
      <h3 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#fbbf24" }}>
        ⚡ Hotkeys
      </h3>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {learnedSkills.map((skill) => {
          const skillLevel = character.learnedSkills[skill.id];
          const now = Date.now();
          const lastUsed = skillCooldowns[skill.id] || 0;
          const timePassed = (now - lastUsed) / 1000;
          const isOnCooldown = timePassed < skill.cooldown;

          return (
            <button
              key={skill.id}
              onClick={() => onUseSkill(skill.id)}
              disabled={disabled || isOnCooldown}
              style={{
                flex: "1 1 120px",
                padding: "8px",
                background: isOnCooldown
                  ? "#555"
                  : isMagicSkill(skill.id)
                    ? "#7c3aed"
                    : "#059669",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isOnCooldown || disabled ? "not-allowed" : "pointer",
                fontSize: "11px",
                fontWeight: "bold",
                position: "relative",
              }}
            >
              {skill.nameZh} Lv.{skillLevel}
              <div style={{ fontSize: "9px", fontWeight: "normal" }}>
                {skill.mpCost(skillLevel)} MP
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
