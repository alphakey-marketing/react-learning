import { ElementType, getElementColor } from "../types/element";

interface ElementGuideModalProps {
  onClose: () => void;
}

export function ElementGuideModal({ onClose }: ElementGuideModalProps) {
  const elementMatchups: { element: ElementType; strongAgainst: ElementType[] }[] = [
    { element: "Fire", strongAgainst: ["Earth", "Undead"] },
    { element: "Water", strongAgainst: ["Fire"] },
    { element: "Wind", strongAgainst: ["Water"] },
    { element: "Earth", strongAgainst: ["Wind", "Poison"] },
    { element: "Holy", strongAgainst: ["Shadow", "Undead"] },
    { element: "Shadow", strongAgainst: ["Holy"] },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1f2937",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "24px",
          position: "relative",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "#9ca3af",
            fontSize: "20px",
            cursor: "pointer",
            padding: "4px",
          }}
          title="Close"
        >
          ✕
        </button>

        <h2 style={{ margin: "0 0 20px 0", color: "white", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span>💪</span> Get Stronger: Element Guide
        </h2>

        <div style={{ marginBottom: "20px", color: "#d1d5db", fontSize: "14px", lineHeight: "1.5", textAlign: "center" }}>
          Exploit enemy weaknesses to deal <strong>1.5x bonus damage!</strong> <br/>
          Using the same element against an enemy will deal heavily reduced damage (0.25x).
        </div>

        <div style={{ background: "#111827", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#374151" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "white", borderBottom: "1px solid #4b5563" }}>Your Element</th>
                <th style={{ padding: "12px", textAlign: "left", color: "white", borderBottom: "1px solid #4b5563" }}>Strong Against (1.5x)</th>
              </tr>
            </thead>
            <tbody>
              {elementMatchups.map((matchup, idx) => (
                <tr key={matchup.element} style={{ borderBottom: idx < elementMatchups.length - 1 ? "1px solid #374151" : "none" }}>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      color: getElementColor(matchup.element), 
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      {matchup.element}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {matchup.strongAgainst.map(target => (
                        <span 
                          key={target} 
                          style={{ 
                            background: "rgba(255, 255, 255, 0.1)", 
                            padding: "4px 8px", 
                            borderRadius: "4px",
                            fontSize: "13px",
                            color: getElementColor(target)
                          }}
                        >
                          {target}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "12px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}