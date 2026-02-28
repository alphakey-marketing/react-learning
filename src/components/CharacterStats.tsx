import { Character, CharacterStats as Stats } from "../types/character";

interface CharacterStatsProps {
  character: Character;
  onAddStat: (stat: keyof Stats) => void;
  onOpenSkills: () => void;
}

export function CharacterStats({
  character,
  onAddStat,
  onOpenSkills,
}: CharacterStatsProps) {
  const expProgress = Math.floor((character.exp / character.expToNext) * 100);
  const hpPercent = Math.floor((character.hp / character.maxHp) * 100);
  const mpPercent = Math.floor((character.mp / character.maxMp) * 100);
  const jobExpPercent = Math.floor(
    (character.jobExp / character.jobExpToNext) * 100
  );

  return (
    <div>
      <div
        style={{
          marginBottom: "15px",
          background: "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #444",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2px",
          }}
        >
          <strong>
            Lv.{character.level} {character.jobClass}
          </strong>
          <span>
            HP: {character.hp}/{character.maxHp}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            fontSize: "11px",
          }}
        >
          <span>Job Lv.{character.jobLevel}</span>
          <span>
            Job EXP: {character.jobExp}/{character.jobExpToNext}
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "4px",
            background: "#555",
            borderRadius: "5px",
            overflow: "hidden",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: `${jobExpPercent}%`,
              height: "100%",
              background: "#f97316",
              transition: "width 0.2s",
            }}
          />
        </div>

        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#555",
            borderRadius: "5px",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: "100%",
              background: "#ef4444",
              transition: "width 0.2s",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px",
            fontSize: "12px",
          }}
        >
          <span>
            MP: {character.mp}/{character.maxMp}
          </span>
          <span>
            EXP: {character.exp}/{character.expToNext}
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "6px",
            background: "#555",
            borderRadius: "5px",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: `${mpPercent}%`,
              height: "100%",
              background: "#3b82f6",
              transition: "width 0.2s",
            }}
          />
        </div>

        <div
          style={{
            width: "100%",
            height: "4px",
            background: "#555",
            borderRadius: "5px",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: `${expProgress}%`,
              height: "100%",
              background: "#10b981",
              transition: "width 0.2s",
            }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            color: "#fbbf24",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          💰 Gold: {character.gold}
        </div>
      </div>

      <div
        style={{
          marginTop: "8px",
          background: "#111",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "11px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span>📊 Stats</span>
          <span>Points: {character.statPoints}</span>
        </div>
        {(["str", "agi", "vit", "int", "dex", "luk"] as const).map((key) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "2px",
              gap: "4px",
            }}
          >
            <span style={{ width: "40px", textTransform: "uppercase" }}>
              {key}
            </span>
            <span style={{ width: "24px" }}>{character.stats[key]}</span>
            <button
              onClick={() => onAddStat(key)}
              disabled={character.statPoints <= 0}
              style={{
                padding: "0 6px",
                fontSize: "10px",
                borderRadius: "3px",
                border: "none",
                background: character.statPoints > 0 ? "#22c55e" : "#444",
                color: "white",
                cursor: character.statPoints > 0 ? "pointer" : "not-allowed",
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={onOpenSkills}
          style={{
            width: "100%",
            padding: "8px",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          📖 Skills (Points: {character.skillPoints})
        </button>
      </div>
    </div>
  );
}
