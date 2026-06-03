import { useMonetization } from "../context/MonetizationContext";

export function UATBanner() {
  const { isUAT } = useMonetization();

  if (!isUAT) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 9999,
      background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
      color: "white",
      textAlign: "center",
      padding: "6px 12px",
      fontSize: "11px",
      fontWeight: "bold",
      letterSpacing: "1px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
    }}>
      <span>🧪 UAT MODE</span>
      <span style={{ opacity: 0.7 }}>|</span>
      <span style={{ fontWeight: "normal" }}>
        Payments are simulated — no real charges
      </span>
      <button
        onClick={() => {
          localStorage.removeItem("rpg_monetization");
          location.reload();
        }}
        style={{
          marginLeft: "12px",
          padding: "2px 8px",
          background: "rgba(255,255,255,0.2)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "10px",
          fontWeight: "bold",
        }}
      >
        🔄 Reset State
      </button>
    </div>
  );
}