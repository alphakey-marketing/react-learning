import { useEffect, useState } from "react";
import { Character } from "../types/character";
import { SKILLS_DB } from "../data/skills";

interface ActiveDebuff {
  id: string;
  expiresAt: number;
  skillLevel: number;
}

interface ActiveSelfBuff {
  id: string;
  expiresAt: number;
  skillLevel: number;
}

interface CombatStatusDisplayProps {
  character: Character;
  skillCooldowns: Record<string, number>;
  activeDebuffs: ActiveDebuff[];
  activeSelfBuffs: ActiveSelfBuff[];
  inTown: boolean;
}

export function CombatStatusDisplay({
  character,
  skillCooldowns,
  activeDebuffs,
  activeSelfBuffs,
  inTown,
}: CombatStatusDisplayProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (inTown) return null;

  // Get skills that have cooldowns and are learned
  const skills = SKILLS_DB[character.jobClass] || [];
  const cooldownSkills = skills.filter(
    (s) => s.cooldown > 0 && (character.learnedSkills[s.id] || 0) > 0
  );

  // Calculate cooldown progress for each skill
  const skillCooldownProgress = cooldownSkills.map((skill) => {
    const lastUsed = skillCooldowns[skill.id] || 0;
    const elapsed = (now - lastUsed) / 1000;
    const progress = Math.min(100, (elapsed / skill.cooldown) * 100);
    const isReady = elapsed >= skill.cooldown;
    const remaining = Math.max(0, skill.cooldown - elapsed);

    return {
      skill,
      progress,
      isReady,
      remaining,
    };
  });

  // Calculate remaining time for debuffs
  const activeDebuffsWithTime = activeDebuffs.map((debuff) => {
    const skill = skills.find((s) => s.id === debuff.id);
    const remaining = Math.max(0, (debuff.expiresAt - now) / 1000);
    const isActive = remaining > 0;

    return {
      ...debuff,
      skill,
      remaining,
      isActive,
    };
  }).filter((d) => d.isActive && d.skill);

  // Calculate remaining time for self-buffs
  const activeSelfBuffsWithTime = activeSelfBuffs.map((buff) => {
    const skill = skills.find((s) => s.id === buff.id);
    const remaining = Math.max(0, (buff.expiresAt - now) / 1000);
    const isActive = remaining > 0;

    return {
      ...buff,
      skill,
      remaining,
      isActive,
    };
  }).filter((b) => b.isActive && b.skill);

  const hasAnything = skillCooldownProgress.length > 0 || activeDebuffsWithTime.length > 0 || activeSelfBuffsWithTime.length > 0;

  if (!hasAnything) return null;

  return (
    <div
      style={{
        marginTop: "10px",
        background: "rgba(0, 0, 0, 0.6)",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        fontSize: "11px",
      }}
    >
      {/* Skill Cooldowns Section */}
      {skillCooldownProgress.length > 0 && (
        <div style={{ marginBottom: activeSelfBuffsWithTime.length > 0 || activeDebuffsWithTime.length > 0 ? "10px" : "0" }}>
          <div
            style={{
              fontSize: "10px",
              color: "#fbbf24",
              fontWeight: "bold",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>⏱️</span>
            <span>Skill Cooldowns</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {skillCooldownProgress.map(({ skill, progress, isReady, remaining }) => (
              <div
                key={skill.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    minWidth: "80px",
                    color: isReady ? "#22c55e" : "#94a3b8",
                    fontWeight: isReady ? "bold" : "normal",
                  }}
                >
                  {skill.nameZh}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    background: "#1a1a1a",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid #333",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: isReady
                        ? "linear-gradient(to right, #22c55e, #16a34a)"
                        : "linear-gradient(to right, #64748b, #475569)",
                      transition: "width 0.1s linear",
                    }}
                  />
                </div>
                <span
                  style={{
                    minWidth: "40px",
                    textAlign: "right",
                    color: isReady ? "#22c55e" : "#94a3b8",
                    fontWeight: "bold",
                  }}
                >
                  {isReady ? "✓ Ready" : `${remaining.toFixed(1)}s`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Self-Buffs Section */}
      {activeSelfBuffsWithTime.length > 0 && (
        <div style={{ marginBottom: activeDebuffsWithTime.length > 0 ? "10px" : "0" }}>
          <div
            style={{
              fontSize: "10px",
              color: "#22c55e",
              fontWeight: "bold",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>🛡️</span>
            <span>Active Buffs</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {activeSelfBuffsWithTime.map((buff) => (
              <div
                key={buff.id}
                style={{
                  background: "rgba(34, 197, 94, 0.2)",
                  border: "1px solid #22c55e",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#22c55e" }}>
                  {buff.skill?.nameZh}
                </span>
                <span style={{ color: "#86efac" }}>
                  {buff.remaining.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enemy Debuffs Section */}
      {activeDebuffsWithTime.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "10px",
              color: "#f87171",
              fontWeight: "bold",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>💀</span>
            <span>Enemy Debuffs</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {activeDebuffsWithTime.map((debuff) => (
              <div
                key={debuff.id}
                style={{
                  background: "rgba(248, 113, 113, 0.2)",
                  border: "1px solid #f87171",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#f87171" }}>
                  {debuff.skill?.nameZh}
                </span>
                <span style={{ color: "#fca5a5" }}>
                  {debuff.remaining.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
