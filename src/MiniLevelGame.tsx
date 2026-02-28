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
            display: "flex",
            gap: "20px",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          {/* Left Column */}
          <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
            <CharacterStats
              character={game.char}
              onAddStat={game.addStat}
              onOpenSkills={() => game.setShowSkillWindow(true)}
            />
            
            {/* Job Change Button */}
            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
              <button
                onClick={game.openJobChangeNPC}
                style={{
                  width: "100%",
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
                  ? "🧙 Job Change Available!"
                  : "🧙 Job Change Master"}
              </button>
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
          <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
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
              onSellItem={game.sellItem}
              onBuyHpPotion={game.buyHpPotion}
              onBuyMpPotion={game.buyMpPotion}
              onUseHpPotion={game.useHpPotion}
              onUseMpPotion={game.useMpPotion}
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

        {/* Skill Hotkeys */}
        <SkillHotkeys
          character={game.char}
          skillCooldowns={game.skillCooldowns}
          onUseSkill={game.battleAction}
          disabled={game.char.hp <= 0}
        />

        {game.char.hp <= 0 && (
          <div
            style={{
              marginTop: "10px",
              textAlign: "center",
              color: "#ef4444",
              fontWeight: "bold",
            }}
          >
            💀 You are defeated! Wait for respawn...
          </div>
        )}
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
