import { useState } from "react";
import { useMonetization } from "../context/MonetizationContext";

interface ShopModalProps {
  onClose: () => void;
  onPurchasePremium: () => void;
  onPurchaseCoins: (packId: string) => void;
}

const COIN_PACKS = [
  { id: "coins_1000",  label: "Starter Pack",     coins: 1000,  price: "$0.99", icon: "🪙", color: "#94a3b8" },
  { id: "coins_5000",  label: "Adventurer Pack",   coins: 5000,  price: "$3.99", icon: "💰", color: "#fbbf24", popular: true },
  { id: "coins_10000", label: "Legend Pack",       coins: 10000, price: "$6.99", icon: "👑", color: "#a78bfa" },
];

export function ShopModal({ onClose, onPurchasePremium, onPurchaseCoins }: ShopModalProps) {
  const { isPremium, premiumExpiryDate, isUAT, restorePurchases } = useMonetization();
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const expiryStr = premiumExpiryDate
    ? new Date(premiumExpiryDate).toLocaleDateString()
    : null;

  async function handleRestore() {
    setRestoreStatus("loading");
    try {
      await restorePurchases();
      setRestoreStatus("done");
    } catch {
      setRestoreStatus("error");
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        {/* UAT notice bar inside shop */}
        {isUAT && (
          <div style={{
            background: "rgba(124, 58, 237, 0.15)",
            border: "1px solid #7c3aed",
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: "16px",
            fontSize: "11px",
            color: "#a78bfa",
            textAlign: "center",
          }}>
            🧪 UAT: All purchases are simulated — coins & premium activate instantly
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "24px", color: "#fbbf24" }}>👑 VIP Store</h2>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
            Support the adventure & unlock the full story
          </p>
        </div>

        {/* Premium Pass */}
        <div style={{
          border: `2px solid ${isPremium ? "#10b981" : "#fbbf24"}`,
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px",
          background: "rgba(251,191,36,0.05)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#fbbf24" }}>
                ⭐ Premium Pass
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
                $2.99 / month {isUAT && <span style={{ color: "#7c3aed" }}>(UAT: free)</span>}
              </p>
            </div>
            {isPremium ? (
              <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "12px" }}>
                ✅ Active{expiryStr ? ` until ${expiryStr}` : ""}
              </span>
            ) : (
              <button onClick={onPurchasePremium} style={premiumBtnStyle}>
                {isUAT ? "Simulate Buy" : "Subscribe"}
              </button>
            )}
          </div>
          <ul style={{ margin: "12px 0 0 0", paddingLeft: "18px", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.8" }}>
            <li>🚫 No ads — ever</li>
            <li>❤️ 2× daily lives (10 instead of 5)</li>
            <li>🔓 Unlock all chapters instantly</li>
            <li>⚡ Faster life regeneration</li>
          </ul>
        </div>

        {/* Coin Packs */}
        <p style={{ margin: "0 0 10px 0", color: "#94a3b8", fontSize: "13px" }}>
          🪙 Gold Coin Packs
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {COIN_PACKS.map((pack) => (
            <div key={pack.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: `1px solid ${pack.color}`,
              borderRadius: "10px",
              padding: "12px 16px",
              background: pack.popular ? "rgba(251,191,36,0.08)" : "transparent",
              position: "relative",
            }}>
              {pack.popular && (
                <span style={{
                  position: "absolute", top: "-10px", left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fbbf24", color: "#000",
                  fontSize: "10px", fontWeight: "bold",
                  padding: "2px 8px", borderRadius: "999px",
                }}>
                  MOST POPULAR
                </span>
              )}
              <div>
                <span style={{ fontSize: "18px" }}>{pack.icon}</span>
                <span style={{ marginLeft: "8px", fontWeight: "bold", color: pack.color }}>
                  {pack.coins.toLocaleString()} Gold
                </span>
                <span style={{ marginLeft: "6px", color: "#94a3b8", fontSize: "12px" }}>
                  {pack.label}
                </span>
              </div>
              <button
                onClick={() => onPurchaseCoins(pack.id)}
                style={{ ...packBtnStyle, borderColor: pack.color, color: pack.color }}
              >
                {isUAT ? `(UAT) ${pack.price}` : pack.price}
              </button>
            </div>
          ))}
        </div>

        {/* Restore Purchases — required by Google Play policy */}
        <button
          onClick={handleRestore}
          disabled={restoreStatus === "loading"}
          style={restoreBtnStyle}
        >
          {restoreStatus === "loading" && "⏳ Restoring..."}
          {restoreStatus === "done" && "✅ Purchases Restored!"}
          {restoreStatus === "error" && "❌ Restore Failed — try again"}
          {restoreStatus === "idle" && (isUAT ? "🔄 Restore Purchases (UAT)" : "🔄 Restore Purchases")}
        </button>

        {/* Close */}
        <button onClick={onClose} style={closeBtnStyle}>✕ Close</button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.85)", display: "flex",
  justifyContent: "center", alignItems: "center",
  zIndex: 2000, padding: "20px",
};
const modalStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  border: "2px solid #fbbf24", borderRadius: "16px",
  padding: "24px", maxWidth: "420px", width: "100%",
  color: "white", maxHeight: "90vh", overflowY: "auto",
};
const premiumBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "linear-gradient(45deg, #f59e0b, #d97706)",
  color: "white", border: "none", borderRadius: "8px",
  cursor: "pointer", fontWeight: "bold", fontSize: "14px",
};
const packBtnStyle: React.CSSProperties = {
  padding: "6px 14px", background: "transparent",
  border: "1px solid", borderRadius: "8px",
  cursor: "pointer", fontWeight: "bold", fontSize: "12px",
};
const restoreBtnStyle: React.CSSProperties = {
  width: "100%", padding: "10px", marginBottom: "10px",
  background: "rgba(255,255,255,0.05)", color: "#94a3b8",
  border: "1px solid #334155", borderRadius: "8px",
  cursor: "pointer", fontSize: "13px",
};
const closeBtnStyle: React.CSSProperties = {
  width: "100%", padding: "10px",
  background: "transparent", color: "#64748b",
  border: "1px solid #1e293b", borderRadius: "8px",
  cursor: "pointer", fontSize: "13px",
};