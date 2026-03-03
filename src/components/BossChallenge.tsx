interface BossChallengeProps {
  bossAvailable: boolean;
  bossDefeated: boolean;
  killCount: number;
  onChallengeBoss: () => void;
}

export function BossChallenge({
  bossAvailable,
  bossDefeated,
  killCount,
  onChallengeBoss,
}: BossChallengeProps) {
  return (
    <>
      {bossAvailable && (
        <div style={{ marginBottom: "15px", textAlign: "center" }}>
          <button
            onClick={onChallengeBoss}
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(45deg, #dc2626, #991b1b)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(220, 38, 38, 0.7)",
            }}
          >
            💀 CHALLENGE BOSS (Kills: {killCount}/10)
          </button>
        </div>
      )}

      {bossDefeated && (
        <div
          style={{
            marginBottom: "15px",
            textAlign: "center",
            color: "#10b981",
            fontWeight: "bold",
            padding: "10px",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          ✅ Boss Defeated! Next area unlocked.
        </div>
      )}
    </>
  );
}
