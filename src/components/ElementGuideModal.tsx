import { ElementType, getElementColor, getElementEmoji } from "../types/element";

interface ElementGuideModalProps {
  onClose: () => void;
}

export function ElementGuideModal({ onClose }: ElementGuideModalProps) {
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
          maxWidth: "600px",
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

        <h2 style={{ margin: "0 0 16px 0", color: "white", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span>💪</span> Get Stronger: Element Guide
        </h2>

        <div style={{ marginBottom: "24px", color: "#d1d5db", fontSize: "14px", lineHeight: "1.6", background: "#111827", padding: "16px", borderRadius: "8px" }}>
          <strong style={{ color: "#fbbf24", display: "block", marginBottom: "8px" }}>💡 How Elements Work:</strong>
          <ul style={{ margin: "0", paddingLeft: "20px" }}>
            <li><strong>Boss enemies have elements</strong> - they are weak to specific attacks!</li>
            <li><strong>Regular mobs are Neutral</strong> - they take normal damage from everything</li>
            <li><strong>Using the right element = 1.5x BONUS damage!</strong> ⚡</li>
            <li><strong>Wrong element? No penalty!</strong> - you still deal normal damage (1.0x)</li>
            <li><strong>Check boss element before fighting</strong> - plan your skills accordingly!</li>
          </ul>
        </div>

        <h3 style={{ margin: "0 0 12px 0", color: "#fbbf24", fontSize: "16px", textAlign: "center" }}>🔄 Element Triangle (Rock-Paper-Scissors)</h3>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔥</div>
            <div style={{ color: getElementColor("Fire"), fontWeight: "bold" }}>Fire</div>
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>beats</div>
            <div style={{ color: getElementColor("Wind"), fontSize: "14px" }}>🌪️ Wind</div>
          </div>

          <div style={{ fontSize: "24px", color: "#6b7280" }}>→</div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🌪️</div>
            <div style={{ color: getElementColor("Wind"), fontWeight: "bold" }}>Wind</div>
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>beats</div>
            <div style={{ color: getElementColor("Water"), fontSize: "14px" }}>💧 Water</div>
          </div>

          <div style={{ fontSize: "24px", color: "#6b7280" }}>→</div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>💧</div>
            <div style={{ color: getElementColor("Water"), fontWeight: "bold" }}>Water</div>
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>beats</div>
            <div style={{ color: getElementColor("Fire"), fontSize: "14px" }}>🔥 Fire</div>
          </div>
        </div>

        <div style={{ background: "#111827", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#fbbf24", fontSize: "14px" }}>📋 Quick Reference</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                <th style={{ padding: "8px", textAlign: "left", color: "#9ca3af", fontSize: "13px", fontWeight: "normal" }}>Boss Element</th>
                <th style={{ padding: "8px", textAlign: "left", color: "#9ca3af", fontSize: "13px", fontWeight: "normal" }}>Use This (1.5x)</th>
                <th style={{ padding: "8px", textAlign: "left", color: "#9ca3af", fontSize: "13px", fontWeight: "normal" }}>Example Skills</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "10px" }}>
                  <span style={{ color: getElementColor("Fire"), fontWeight: "bold", fontSize: "14px" }}>🔥 Fire</span>
                </td>
                <td style={{ padding: "10px" }}>
                  <span style={{ color: getElementColor("Water"), fontWeight: "bold", fontSize: "14px" }}>💧 Water</span>
                </td>
                <td style={{ padding: "10px", color: "#d1d5db", fontSize: "13px" }}>冰箭術, 暴風雪</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "10px" }}>
                  <span style={{ color: getElementColor("Water"), fontWeight: "bold", fontSize: "14px" }}>💧 Water</span>
                </td>
                <td style={{ padding: "10px" }}>
                  <span style={{ color: getElementColor("Wind"), fontWeight: "bold", fontSize: "14px" }}>🌪️ Wind</span>
                </td>
                <td style={{ padding: "10px", color: "#d1d5db", fontSize: "13px" }}>雷擊術</td>
              </tr>
              <tr>
                <td style={{ padding: "10px" }}>
                  <span style={{ color: getElementColor("Wind"), fontWeight: "bold", fontSize: "14px" }}>🌪️ Wind</span>
                </td>
                <td style={{ padding: "10px" }}>
                  <span style={{ color: getElementColor("Fire"), fontWeight: "bold", fontSize: "14px" }}>🔥 Fire</span>
                </td>
                <td style={{ padding: "10px", color: "#d1d5db", fontSize: "13px" }}>火焰彈, 隕石術, 爆裂波動</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid #3b82f6", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
          <div style={{ color: "#60a5fa", fontSize: "13px", lineHeight: "1.5" }}>
            <strong>💡 Pro Tip:</strong> Learn multiple elemental skills to be ready for any boss! If you see "🛡️ Resisted!" 3 times in a row, the game will hint which element to use.
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}