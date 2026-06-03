import { useState, useEffect } from "react";
import { useMonetization } from "../context/MonetizationContext";

interface InterstitialAdProps {
  onAdComplete: () => void;
}

export function InterstitialAd({ onAdComplete }: InterstitialAdProps) {
  const { isUAT } = useMonetization();
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (isUAT) {
      console.log("[UAT] Interstitial ad shown — countdown started");
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanSkip(true);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleComplete() {
    if (isUAT) console.log("[UAT] Interstitial ad completed — entering zone");
    onAdComplete();
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.92)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 3000, padding: "20px",
    }}>
      <div style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "20px",
        maxWidth: "360px", width: "100%",
        textAlign: "center",
      }}>
        {/* UAT label */}
        {isUAT && (
          <div style={{
            background: "rgba(124,58,237,0.2)",
            border: "1px solid #7c3aed",
            borderRadius: "6px",
            padding: "4px 10px",
            fontSize: "10px", color: "#a78bfa",
            marginBottom: "10px",
          }}>
            🧪 UAT — Real AdMob video plays here on Android
          </div>
        )}

        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 10px 0" }}>
          Advertisement
        </p>

        {/* Ad placeholder box */}
        <div style={{
          width: "100%", height: "180px",
          background: "linear-gradient(135deg, #1e3a5f, #0f2027)",
          borderRadius: "8px",
          display: "flex", justifyContent: "center",
          alignItems: "center", flexDirection: "column",
          border: "1px dashed #334155",
          marginBottom: "16px", gap: "8px",
        }}>
          <span style={{ fontSize: "32px" }}>📺</span>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
            {isUAT ? "[UAT] AdMob video placeholder" : "Loading ad..."}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#64748b", fontSize: "11px", margin: 0 }}>
            ⭐ <span style={{ color: "#fbbf24" }}>Premium Pass</span> removes ads
          </p>
          {canSkip ? (
            <button
              onClick={handleComplete}
              style={{
                padding: "6px 16px",
                background: "#1e293b", color: "white",
                border: "1px solid #334155",
                borderRadius: "6px", cursor: "pointer",
                fontWeight: "bold", fontSize: "13px",
              }}
            >
              Continue →
            </button>
          ) : (
            <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "bold" }}>
              {countdown}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}