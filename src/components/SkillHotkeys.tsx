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

  if (learnedSkills.length === 0) return null;

  return (
    <div
      style={{
        padding: "8px",
        background: "rgba(0, 0, 0, 0.5)",
        borderRadius: "8px",
        border: "1px solid rgba(251, 191, 36, 0.3)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#fbbf24",
          marginBottom: "6px",
          fontWeight: "bold",
        }}
      >
        ⚡ Skills
      </div>

      {/* 3-column touch grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
        }}
      >
        {learnedSkills.map((skill) => {
          const skillLevel = character.learnedSkills[skill.id];
          const now = Date.now();
          const lastUsed = skillCooldowns[skill.id] || 0;
          const timePassed = (now - lastUsed) / 1000;
          const isOnCooldown = timePassed < skill.cooldown;
          const cooldownRemaining = Math.max(0, skill.cooldown - timePassed);
          const isAutoSkill = character.autoAttackSkillId === skill.id;
          const isMagic = isMagicSkill(skill.id);

          return (
            <button
              key={skill.id}
              onClick={() => !isOnCooldown && !disabled && onUseSkill(skill.id)}
              disabled={disabled || isOnCooldown}
              style={{
                minHeight: "56px",
                padding: "6px 4px",
                background: isOnCooldown
                  ? "#1f2937"
                  : isMagic
                  ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
                  : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: isOnCooldown ? "#6b7280" : "white",
                border: isAutoSkill
                  ? "2px solid #10b981"
                  : isOnCooldown
                  ? "1px solid #374151"
                  : "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                cursor: isOnCooldown || disabled ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                position: "relative",
                overflow: "hidden",
                touchAction: "manipulation",
                transition: "opacity 0.1s",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {/* Auto-skill indicator */}
              {isAutoSkill && (
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    background: "#10b981",
                    color: "white",
                    fontSize: "8px",
                    fontWeight: "bold",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ★
                </div>
              )}

              {/* Skill name */}
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                  textAlign: "center",
                  wordBreak: "break-word",
                }}
              >
                {skill.nameZh}
              </div>

              {/* Level + MP cost */}
              <div
                style={{
                  fontSize: "9px",
                  opacity: 0.8,
                  textAlign: "center",
                  lineHeight: "1.2",
                }}
              >
                Lv.{skillLevel} · {skill.mpCost(skillLevel)}MP
              </div>

              {/* Cooldown overlay */}
              {isOnCooldown && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#fbbf24",
                    borderRadius: "8px",
                  }}
                >
                  {cooldownRemaining.toFixed(1)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
