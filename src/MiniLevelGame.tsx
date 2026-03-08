import { CharacterStats } from "./components/CharacterStats";
import { EnemyDisplay } from "./components/EnemyDisplay";
import { BattleLog } from "./components/BattleLog";
import { SkillWindow } from "./components/SkillWindow";
import { EnhancedInventory } from "./components/EnhancedInventory";
import { Shop } from "./components/Shop";
import { PotionBar } from "./components/PotionBar";
import { MapSystem } from "./components/MapSystem";
import { BossChallenge } from "./components/BossChallenge";
import { JobChangeNPC } from "./components/JobChangeNPC";
import { RefineNPC } from "./components/RefineNPC";
import { TrainingHut } from "./components/TrainingHut";
import { CombatHUD } from "./components/CombatHUD";
import { FloatingText } from "./components/FloatingText";
import { ItemDropAnimation } from "./components/ItemDropAnimation";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { DevToolsPanel } from "./components/DevToolsPanel";
import { CombatStatusDisplay } from "./components/CombatStatusDisplay";
import { GameCompleteModal } from "./components/GameCompleteModal";
import { Equipment } from "./types/equipment";
import { useBattleLog } from "./hooks/useBattleLog";
import { useGameState } from "./hooks/useGameState";
import { useFloatingText } from "./hooks/useFloatingText";
import { useItemDropAnimation } from "./hooks/useItemDropAnimation";
import { canChangeJob } from "./data/jobs";
import { useEffect, useState, useRef } from "react";

export function MiniLevelGame() {
  const { logs, addLog } = useBattleLog();
  const { floatingTexts, addFloatingText, removeFloatingText } = useFloatingText();
  const { droppingItems, addDroppingItem, removeDroppedItem } = useItemDropAnimation();
  
  const [showRefineNPC, setShowRefineNPC] = useState(false);
  const [showTrainingHut, setShowTrainingHut] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [playTimeMs, setPlayTimeMs] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasSeenTutorial") !== "true";
    }
    return true;
  });
  const [showDevTools, setShowDevTools] = useState(false);
  
  const game = useGameState(addLog, {
    onDamageDealt: (damage: number, isCrit: boolean) => {
      addFloatingText(`-${damage}`, {
        color: isCrit ? '#ff3333' : '#ffaa00',
        isCrit,
      });
      
      if (isCrit) {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
          gameContainer.classList.remove('crit-shake');
          void gameContainer.offsetWidth;
          gameContainer.classList.add('crit-shake');
          
          setTimeout(() => {
            gameContainer.classList.remove('crit-shake');
          }, 300);
        }
      }
    },
    onEnemyDamageDealt: (damage: number) => {
      const windowCenterX = window.innerWidth / 2;
      const randomOffset = Math.random() * 30 - 15;
      addFloatingText(`-${damage}`, {
        color: '#ff6b6b',
        x: (windowCenterX + 200) + randomOffset,
        y: (window.innerHeight * 0.4) + randomOffset,
      });
    },
    onLevelUp: (newLevel: number) => {
      addFloatingText(`🌟 LEVEL ${newLevel}! 🌟`, {
        color: '#ffd700',
        fontSize: 42,
        isLevelUp: true,
      });
    },
    onJobLevelUp: (newJobLevel: number) => {
      addFloatingText(`🌟 JOB LV ${newJobLevel}! 🌟`, {
        color: '#10b981',
        fontSize: 42,
        isLevelUp: true,
      });
    },
    onItemDrop: (item) => {
      addDroppingItem(item);
    },
    onMaterialDrop: (material: 'elunium' | 'oridecon', amount: number) => {
      const materialText = material === 'elunium' ? `💎 +${amount} Elunium` : `🔥 +${amount} Oridecon`;
      const materialColor = material === 'elunium' ? '#a78bfa' : '#f87171';
      
      addFloatingText(materialText, {
        color: materialColor,
        fontSize: 28,
        isLevelUp: true,
      });
    },
    onEnemyKilled: (isBoss: boolean, goldEarned: number) => {
      // Show game complete modal if final boss (Zone 8) is defeated
      if (isBoss && game.currentZoneId === 8 && !showGameComplete) {
        setPlayTimeMs(Date.now() - startTimeRef.current);
        // We use a timeout to let the combat finish before showing the modal
        setTimeout(() => {
          setShowGameComplete(true);
        }, 1000);
      }
    },
  });

  const canChangeJobNow = canChangeJob(game.char.jobClass, game.char.jobLevel);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl+D to toggle dev tools
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
        return;
      }
      
      if (showTutorial || showGameComplete) return;
      
      if ((e.key === 'a' || e.key === 'A') && game.currentZoneId !== 0 && game.canAttack) {
        e.preventDefault();
        game.battleAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.canAttack, game.currentZoneId, game.battleAction, showTutorial, showGameComplete]);

  const wrappedSellItem = (item: Equipment) => {
    game.sellItem(item);
  };

  const wrappedUseHpPotion = () => {
    game.useHpPotion();
  };

  const wrappedUseMpPotion = () => {
    game.useMpPotion();
  };

  const wrappedHandleRespawn = () => {
    game.handleRespawn();
  };

  const wrappedHandleJobChange = (newJob: any) => {
    game.handleJobChange(newJob);
  };

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
        padding: "10px", // Reduced for mobile
        paddingTop: "20px", // Reduced for mobile
        paddingBottom: "20px",
      }}
    >
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      
      {/* UAT: Show game complete modal when final boss is defeated */}
      {showGameComplete && <GameCompleteModal character={game.char} playTimeMs={playTimeMs} onClose={() => setShowGameComplete(false)} />}
      
      {showDevTools && (
        <DevToolsPanel
          character={game.char}
          onAddBaseLevel={game.devAddBaseLevel}
          onAddJobLevel={game.devAddJobLevel}
          onAddGold={game.devAddGold}
          onAddPotions={game.devAddPotions}
          onFullHeal={game.devFullHeal}
          onAddGear={game.devAddGear}
          onUnlockAllZones={game.devUnlockAllZones}
        />
      )}
      
      <FloatingText items={floatingTexts} onRemove={removeFloatingText} />
      <ItemDropAnimation items={droppingItems} onAnimationComplete={removeDroppedItem} />
      
      <CombatHUD
        character={game.char}
        hpPotions={game.hpPotions}
        mpPotions={game.mpPotions}
        autoHpPercent={game.autoHpPercent}
        autoMpPercent={game.autoMpPercent}
        onUseHpPotion={wrappedUseHpPotion}
        onUseMpPotion={wrappedUseMpPotion}
        inTown={game.currentZoneId === 0}
      />

      <div
        id="game-container"
        style={{
          border: "2px solid gold",
          padding: "15px", // Reduced for mobile
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
            margin: "0 0 15px 0", // Reduced for mobile
            fontSize: "clamp(18px, 5vw, 28px)", // Responsive font size
            background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          ⚔️ Mini RPG - RO Style
        </h1>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowTutorial(true)}
            style={{
              padding: "8px 16px",
              background: "rgba(59, 130, 246, 0.2)",
              color: "#60a5fa",
              border: "1px solid #3b82f6",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(12px, 3vw, 14px)", // Responsive font
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📖</span>
            <span>How to Play</span>
          </button>
          
          <button
            onClick={() => setShowTrainingHut(true)}
            style={{
              padding: "8px 16px",
              background: "rgba(245, 158, 11, 0.2)",
              color: "#fbbf24",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(12px, 3vw, 14px)", // Responsive font
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🎯</span>
            <span>Training Hut</span>
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", // Stack on mobile
            gap: "15px", // Reduced for mobile
            marginBottom: "12px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div data-tutorial="character-stats">
              <CharacterStats
                character={game.char}
                equipped={game.equipped}
                onAddStat={game.addStat}
                onOpenSkills={() => game.setShowSkillWindow(true)}
              />
            </div>
            
            <div style={{ marginTop: "10px", marginBottom: "10px", display: "flex", gap: "8px" }}>
              <button
                data-tutorial="job-master"
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
                  fontSize: "clamp(11px, 3vw, 13px)", // Responsive font
                  boxShadow: canChangeJobNow
                    ? "0 0 15px rgba(251, 191, 36, 0.5)"
                    : "none",
                  animation: canChangeJobNow ? "pulseButton 2s infinite" : "none",
                }}
              >
                {canChangeJobNow
                  ? "🧙 Job Change!"
                  : "🧙 Job Master"}
              </button>

              <button
                onClick={() => {
                  if (game.currentZoneId !== 0) {
                    game.escapeToTown();
                  } else {
                    setShowRefineNPC(true);
                  }
                }}
                disabled={game.char.hp <= 0}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: game.currentZoneId !== 0 
                    ? (game.char.hp > 0 ? "linear-gradient(45deg, #10b981, #059669)" : "#555")
                    : "linear-gradient(45deg, #8b5cf6, #6d28d9)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: game.char.hp > 0 ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                  fontSize: "clamp(11px, 3vw, 13px)", // Responsive font
                  boxShadow: game.char.hp > 0 
                    ? (game.currentZoneId !== 0 ? "0 0 10px rgba(16, 185, 129, 0.3)" : "0 0 10px rgba(139, 92, 246, 0.3)")
                    : "none",
                }}
              >
                {game.currentZoneId !== 0 ? "🏛️ Escape to Town" : "🔨 Blacksmith"}
              </button>
            </div>

            <EnemyDisplay 
              enemy={game.enemy}
              currentZoneId={game.currentZoneId}
              onAttack={() => game.battleAction()}
              canAttack={game.canAttack}
              inTown={game.currentZoneId === 0}
              attackCooldownPercent={game.attackCooldownPercent}
              autoAttackEnabled={game.autoAttackEnabled}
              onToggleAutoAttack={game.toggleAutoAttack}
            />
            
            <CombatStatusDisplay
              character={game.char}
              skillCooldowns={game.skillCooldowns}
              activeDebuffs={game.activeDebuffs}
              activeSelfBuffs={game.activeSelfBuffs}
              inTown={game.currentZoneId === 0}
            />
            
            <BossChallenge
              bossAvailable={game.bossAvailable}
              bossDefeated={game.bossDefeated}
              killCount={game.killCount}
              onChallengeBoss={game.challengeBoss}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <BattleLog logs={logs} />
            
            <PotionBar
              character={game.char}
              hpPotions={game.hpPotions}
              mpPotions={game.mpPotions}
              autoHpPercent={game.autoHpPercent}
              autoMpPercent={game.autoMpPercent}
              onUseHpPotion={wrappedUseHpPotion}
              onUseMpPotion={wrappedUseMpPotion}
              onSetAutoHpPercent={game.setAutoHpPercent}
              onSetAutoMpPercent={game.setAutoMpPercent}
            />
            
            <div data-tutorial="map-system">
              <MapSystem
                currentZoneId={game.currentZoneId}
                unlockedZoneIds={game.unlockedZoneIds}
                onTravel={game.travelToZone}
              />
            </div>
            
            <div data-tutorial="inventory">
              <EnhancedInventory
                inventory={game.inventory}
                equipped={game.equipped}
                onEquip={game.equipItem}
                onUnequip={game.unequipItem}
              />
            </div>
            
            <div data-tutorial="shop">
              <Shop
                character={game.char}
                isInTown={game.currentZoneId === 0}
                inventory={game.inventory}
                onSellItem={wrappedSellItem}
                onBuyHpPotion={game.buyHpPotion}
                onBuyMpPotion={game.buyMpPotion}
              />
            </div>
          </div>
        </div>

        {game.showSkillWindow && (
          <SkillWindow
            character={game.char}
            onLearnSkill={game.learnSkill}
            onSetAutoAttack={game.setAutoAttackSkill}
            onClose={() => game.setShowSkillWindow(false)}
          />
        )}

        {game.showJobChangeNPC && (
          <JobChangeNPC
            currentJob={game.char.jobClass}
            currentJobLevel={game.char.jobLevel}
            onJobChange={wrappedHandleJobChange}
            onClose={() => game.setShowJobChangeNPC(false)}
          />
        )}

        {showRefineNPC && (
          <RefineNPC
            character={game.char}
            inventory={game.inventory}
            equipped={game.equipped}
            onRefine={game.refineItem}
            onClose={() => setShowRefineNPC(false)}
          />
        )}

        {showTrainingHut && (
          <TrainingHut
            character={game.char}
            equipped={game.equipped}
            onClose={() => setShowTrainingHut(false)}
          />
        )}

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
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                border: "3px solid #dc2626",
                borderRadius: "16px",
                padding: "30px", // Reduced for mobile
                maxWidth: "500px",
                width: "100%",
                color: "white",
                textAlign: "center",
                boxShadow: "0 0 50px rgba(220, 38, 38, 0.5)",
              }}
            >
              <div style={{ fontSize: "clamp(48px, 15vw, 72px)", marginBottom: "20px" }}>
                💀
              </div>
              <h2
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "clamp(24px, 7vw, 32px)",
                  color: "#dc2626",
                  fontWeight: "bold",
                }}
              >
                You Were Defeated!
              </h2>
              <p
                style={{
                  fontSize: "clamp(14px, 4vw, 16px)",
                  marginBottom: "10px",
                  color: "#bbb",
                }}
              >
                Your adventure has ended...
              </p>
              <p
                style={{
                  fontSize: "clamp(12px, 3.5vw, 14px)",
                  marginBottom: "30px",
                  color: "#888",
                }}
              >
                You will respawn at town with 50% HP and MP.
              </p>
              <button
                onClick={wrappedHandleRespawn}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "linear-gradient(45deg, #dc2626, #991b1b)",
                  color: "white",
                  border: "2px solid #ef4444",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "clamp(16px, 4.5vw, 18px)",
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
      </div>

      <style>{`
        @keyframes pulseButton {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes critShake {
          0% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .crit-shake {
          animation: critShake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
