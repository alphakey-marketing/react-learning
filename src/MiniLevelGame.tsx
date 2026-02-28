import { CharacterStats } from "./components/CharacterStats";
import { EnemyDisplay } from "./components/EnemyDisplay";
import { BattleLog } from "./components/BattleLog";
import { SkillWindow } from "./components/SkillWindow";
import { SkillHotkeys } from "./components/SkillHotkeys";
import { Inventory } from "./components/Inventory";
import { Shop } from "./components/Shop";
import { MapSystem } from "./components/MapSystem";
import { BossChallenge } from "./components/BossChallenge";
import { JobChangeNPC } from "./components/JobChangeNPC";
import { useBattleLog } from "./hooks/useBattleLog";
import { useGameState } from "./hooks/useGameState";
import { canChangeJob } from "./data/jobs";

export function MiniLevelGame() {
  const { logs, addLog } = useBattleLog();
  const game = useGameState(addLog);

  // Check if player can change job
  const canChangeJobNow = canChangeJob(game.char.jobClass, game.char.jobLevel);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "system-ui, sans-serif",
        padding: "20px",
        paddingTop: "40px",
      }}
    >
      <div
        style={{
          border: "2px solid gold",
          padding: "20px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "1200px",
          background: "rgba(34, 34, 34, 0.95)",
          boxShadow: "0 8px 32px rgba(255, 215, 0, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            margin: "0 0 20px 0",
            fontSize: "28px",
            background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          ⚔️ Mini RPG - RO Style
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "15px",
          }}
        >
          {/* Left Column */}
          <div style={{ minWidth: 0 }}>
            <CharacterStats
              character={game.char}
              onAddStat={game.addStat}
              onOpenSkills={() => game.setShowSkillWindow(true)}
            />
            
            {/* Action Buttons */}
            <div style={{ marginTop: "10px", marginBottom: "10px", display: "flex", gap: "8px" }}>
              <button
                onClick={game.openJobChangeNPC}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: canChangeJobNow
                    ? "linear-gradient(45deg, #f59e0b, #d97706)"
                    : "#555",
                  color: "white",
                  border: canChangeJobNow ? "2px solid #fbbf24" : "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  boxShadow: canChangeJobNow
                    ? "0 0 15px rgba(251, 191, 36, 0.5)"
                    : "none",
                  animation: canChangeJobNow ? "pulse 2s infinite" : "none",
                }}
              >
                {canChangeJobNow
                  ? "🧙 Job Change!"
                  : "🧙 Job Master"}
              </button>
              
              {/* Escape to Town Button */}
              {game.currentZoneId !== 0 && (
                <button
                  onClick={game.escapeToTown}
                  disabled={game.char.hp <= 0}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: game.char.hp > 0 ? "linear-gradient(45deg, #10b981, #059669)" : "#555",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: game.char.hp > 0 ? "pointer" : "not-allowed",
                    fontWeight: "bold",
                    fontSize: "13px",
                    boxShadow: game.char.hp > 0 ? "0 0 10px rgba(16, 185, 129, 0.3)" : "none",
                  }}
                >
                  🏛️ Escape to Town
                </button>
              )}
            </div>

            <EnemyDisplay enemy={game.enemy} />
            <BossChallenge
              bossAvailable={game.bossAvailable}
              bossDefeated={game.bossDefeated}
              killCount={game.killCount}
              onChallengeBoss={game.challengeBoss}
            />
          </div>

          {/* Right Column */}
          <div style={{ minWidth: 0 }}>
            {/* Battle Log moved to top of right column */}
            <BattleLog logs={logs} />
            
            <MapSystem
              currentZoneId={game.currentZoneId}
              unlockedZoneIds={game.unlockedZoneIds}
              onTravel={game.travelToZone}
            />
            <Inventory
              inventory={game.inventory}
              equipped={game.equipped}
              onEquip={game.equipItem}
            />
            <Shop
              character={game.char}
              hpPotions={game.hpPotions}
              mpPotions={game.mpPotions}
              isInTown={game.currentZoneId === 0}
              autoHpPercent={game.autoHpPercent}
              autoMpPercent={game.autoMpPercent}
              onSellItem={game.sellItem}
              onBuyHpPotion={game.buyHpPotion}
              onBuyMpPotion={game.buyMpPotion}
              onUseHpPotion={game.useHpPotion}
              onUseMpPotion={game.useMpPotion}
              onSetAutoHpPercent={game.setAutoHpPercent}
              onSetAutoMpPercent={game.setAutoMpPercent}
            />
          </div>
        </div>

        {/* Skill Window (Full Width) */}
        {game.showSkillWindow && (
          <SkillWindow
            character={game.char}
            onLearnSkill={game.learnSkill}
            onClose={() => game.setShowSkillWindow(false)}
          />
        )}

        {/* Job Change NPC (Full Screen Modal) */}
        {game.showJobChangeNPC && (
          <JobChangeNPC
            currentJob={game.char.jobClass}
            currentJobLevel={game.char.jobLevel}
            onJobChange={game.handleJobChange}
            onClose={() => game.setShowJobChangeNPC(false)}
          />
        )}

        {/* Death Modal */}
        {game.showDeathModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                border: "3px solid #dc2626",
                borderRadius: "16px",
                padding: "40px",
                maxWidth: "500px",
                width: "90%",
                color: "white",
                textAlign: "center",
                boxShadow: "0 0 50px rgba(220, 38, 38, 0.5)",
              }}
            >
              <div style={{ fontSize: "72px", marginBottom: "20px" }}>
                💀
              </div>
              <h2
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "32px",
                  color: "#dc2626",
                  fontWeight: "bold",
                }}
              >
                You Were Defeated!
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "10px",
                  color: "#bbb",
                }}
              >
                Your adventure has ended...
              </p>
              <p
                style={{
                  fontSize: "14px",
                  marginBottom: "30px",
                  color: "#888",
                }}
              >
                You will respawn at town with 50% HP and MP.
              </p>
              <button
                onClick={game.handleRespawn}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "linear-gradient(45deg, #dc2626, #991b1b)",
                  color: "white",
                  border: "2px solid #ef4444",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(220, 38, 38, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(220, 38, 38, 0.4)";
                }}
              >
                ❤️‍🩹 Respawn
              </button>
            </div>
          </div>
        )}

        {/* Skill Hotkeys */}
        <SkillHotkeys
          character={game.char}
          skillCooldowns={game.skillCooldowns}
          onUseSkill={game.battleAction}
          disabled={game.char.hp <= 0}
        />
      </div>

      {/* Add pulse animation for job change button */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
