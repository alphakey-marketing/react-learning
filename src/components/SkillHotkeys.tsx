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
    <div 
      style={{ 
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.85)",
        padding: "10px 15px",
        borderRadius: "8px",
        border: "2px solid #fbbf24",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {learnedSkills.map((skill, index) => {
          const skillLevel = character.learnedSkills[skill.id];
          const now = Date.now();
          const lastUsed = skillCooldowns[skill.id] || 0;
          const timePassed = (now - lastUsed) / 1000;
          const isOnCooldown = timePassed < skill.cooldown;
          const cooldownRemaining = Math.max(0, skill.cooldown - timePassed);
          const isAutoSkill = character.autoAttackSkillId === skill.id;

          return (
            <div
              key={skill.id}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Hotkey number */}
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "-8px",
                  background: "#000",
                  color: "#fbbf24",
                  fontSize: "10px",
                  fontWeight: "bold",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #fbbf24",
                  zIndex: 2,
                }}
              >
                {index + 1}
              </div>

              {/* Auto skill indicator */}
              {isAutoSkill && (
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#10b981",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "bold",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid white",
                    zIndex: 2,
                  }}
                  title="Auto-Attack Skill"
                >
                  ★
                </div>
              )}

              <button
                onClick={() => onUseSkill(skill.id)}
                disabled={disabled || isOnCooldown}
                style={{
                  width: "60px",
                  height: "60px",
                  padding: "5px",
                  background: isOnCooldown
                    ? "#333"
                    : isMagicSkill(skill.id)
                      ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
                      : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: "white",
                  border: isOnCooldown ? "2px solid #555" : "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  cursor: isOnCooldown || disabled ? "not-allowed" : "pointer",
                  fontSize: "10px",
                  fontWeight: "bold",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: isOnCooldown ? "none" : "0 2px 8px rgba(0,0,0,0.4)",
                  transition: "all 0.1s",
                  opacity: disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isOnCooldown && !disabled) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = isOnCooldown ? "none" : "0 2px 8px rgba(0,0,0,0.4)";
                }}
              >
                <div style={{ fontSize: "11px", lineHeight: "1.2", marginBottom: "2px" }}>
                  {skill.nameZh}
                </div>
                <div style={{ fontSize: "9px", fontWeight: "normal", opacity: 0.8 }}>
                  Lv.{skillLevel}
                </div>
                <div style={{ fontSize: "8px", fontWeight: "normal", opacity: 0.7, marginTop: "2px" }}>
                  {skill.mpCost(skillLevel)} MP
                </div>

                {/* Cooldown overlay */}
                {isOnCooldown && (
                  <div
                    style={
                      {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#fbbf24",
                      }
                    }
                  >
                    {cooldownRemaining.toFixed(1)}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
