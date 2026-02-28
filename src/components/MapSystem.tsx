import { ZONES } from "../data/zones";

interface MapSystemProps {
  currentZoneId: number;
  unlockedZoneIds: number[];
  onTravel: (zoneId: number) => void;
}

export function MapSystem({
  currentZoneId,
  unlockedZoneIds,
  onTravel,
}: MapSystemProps) {
  const currentZone = ZONES.find((z) => z.id === currentZoneId);

  return (
    <div
      style={{
        background: "#2a2a2a",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "15px",
        border: "1px solid #444",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "14px",
          color: "#fbbf24",
        }}
      >
        📍 {currentZone?.name || "Unknown"}
      </h3>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {ZONES.map((zone) => {
          const isUnlocked = unlockedZoneIds.includes(zone.id);
          const isCurrent = currentZoneId === zone.id;
          if (isCurrent) return null;

          return (
            <button
              key={zone.id}
              onClick={() => onTravel(zone.id)}
              disabled={!isUnlocked}
              style={{
                flex: "1 1 auto",
                padding: "6px 8px",
                fontSize: "10px",
                background: isUnlocked ? "#2563eb" : "#444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isUnlocked ? "pointer" : "not-allowed",
                opacity: isUnlocked ? 1 : 0.5,
              }}
            >
              {isUnlocked ? `➡️ ${zone.name}` : `🔒 Lv.${zone.minLevel}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
