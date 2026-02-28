import { Enemy } from "../types/enemy";

interface EnemyDisplayProps {
  enemy: Enemy;
}

export function EnemyDisplay({ enemy }: EnemyDisplayProps) {
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;

  return (
    <div
      style={{
        marginTop: "15px",
        marginBottom: "15px",
        background: "#333",
        padding: "10px",
        borderRadius: "6px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          margin: "0 0 5px 0",
          fontSize: "16px",
          color: "#fbbf24",
        }}
      >
        {enemy.name}{" "}
        <span style={{ fontSize: "12px", color: "#aaa" }}>
          (Lv.{enemy.level})
        </span>
      </h2>
      <div style={{ fontSize: "12px", marginBottom: "5px" }}>
        HP: {enemy.hp}/{enemy.maxHp}
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "#555",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${hpPercent}%`,
            height: "100%",
            background: "#f59e0b",
            transition: "width 0.2s",
          }}
        />
      </div>
    </div>
  );
}
