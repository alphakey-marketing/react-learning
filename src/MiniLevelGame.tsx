import { CharacterStats } from "./components/CharacterStats";
import { EnemyDisplay } from "./components/EnemyDisplay";
import { BattleLog } from "./components/BattleLog";
import { SkillWindow } from "./components/SkillWindow";
import { SkillHotkeys } from "./components/SkillHotkeys";
import { EnhancedInventory } from "./components/EnhancedInventory";
import { Shop } from "./components/Shop";
import { PotionBar } from "./components/PotionBar";
import { MapSystem } from "./components/MapSystem";
import { BossChallenge } from "./components/BossChallenge";
import { JobChangeNPC } from "./components/JobChangeNPC";
import { RefineNPC } from "./components/RefineNPC";
import { CombatHUD } from "./components/CombatHUD";
// import { DevTools } from "./components/DevTools"; // Hidden for MVP
import { FloatingText } from "./components/FloatingText";
import { ItemDropAnimation } from "./components/ItemDropAnimation";
// import { AchievementPopup } from "./components/AchievementPopup";
// import { AchievementList } from "./components/AchievementList";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { useBattleLog } from "./hooks/useBattleLog";
import { useGameState } from "./hooks/useGameState";
import { useFloatingText } from "./hooks/useFloatingText";
import { useItemDropAnimation } from "./hooks/useItemDropAnimation";
// import { useAchievements } from "./hooks/useAchievements";
import { canChangeJob } from "./data/jobs";
import { useEffect, useState, useMemo } from "react";

export function MiniLevelGame() {
  const { logs, addLog } = useBattleLog();
  const { floatingTexts, addFloatingText, removeFloatingText } = useFloatingText();
  const { droppingItems, addDroppingItem, removeDroppedItem } = useItemDropAnimation();
  // const achievements = useAchievements(); // DISABLED - causing freeze
  
  // const [showAchievements, setShowAchievements] = useState(false);
  const [showRefineNPC, setShowRefineNPC] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasSeenTutorial") !== "true";
    }
    return true;
  });
  
  const game = useGameState(addLog, {
    onDamageDealt: (damage: number, isCrit: boolean) => {
      addFloatingText(`-${damage}`, {
        color: isCrit ? '#ff3333' : '#ffaa00',
        isCrit,
      });
      // achievements.trackDamage(damage); // DISABLED
      
      // Screen shake effect on crit
      if (isCrit) {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
          gameContainer.classList.remove('crit-shake');
          void gameContainer.offsetWidth; // trigger reflow
          gameContainer.classList.add('crit-shake');
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
    onItemDrop: (item) => {
      addDroppingItem(item);
    },
    onMaterialDrop: (material: 'elunium' | 'oridecon', amount: number) => {
      const materialText = material === 'elunium' ? `💎 +${amount} Elunium` : `🔥 +${amount} Oridecon`;
      const materialColor = material === 'elunium' ? '#a78bfa' : '#f87171';
      
      addFloatingText(materialText, {
        color: materialColor,
        fontSize: 28,
        isLevelUp: true, // Use level-up animation style for emphasis
      });
    },
    onEnemyKilled: (isBoss: boolean, goldEarned: number) => {
      // achievements.trackKill(isBoss); // DISABLED
      // achievements.trackGoldEarned(goldEarned); // DISABLED
    },
  });

  const canChangeJobNow = canChangeJob(game.char.jobClass, game.char.jobLevel);

  // Determine background based on zone - Using useMemo to ensure it updates
  const zoneBackground = useMemo(() => {
    console.log('Zone changed to:', game.currentZoneId, 'Boss available:', game.bossAvailable);
    
    // Boss fight takes priority
    if (game.bossAvailable) {
      return "radial-gradient(circle at 50% 20%, #7f1d1d 0%, #450a0a 50%, #1c0a0a 100%)"; // Red
    }
    
    // Check specific zones
    switch(game.currentZoneId) {
      case 0: // Town
        return "radial-gradient(circle at 50% 20%, #334155 0%, #1e293b 50%, #0f172a 100%)"; // Blue-slate
      case 1: // Beginner Plains - Light green
        return "radial-gradient(circle at 50% 20%, #15803d 0%, #166534 50%, #14532d 100%)"; // Lighter green
      case 2: // Dark Forest - Deep green
        return "radial-gradient(circle at 50% 20%, #14532d 0%, #052e16 50%, #021a0a 100%)"; // Dark green
      case 3: // Mountain Path - Gray/rocky
        return "radial-gradient(circle at 50% 20%, #44403c 0%, #292524 50%, #1c1917 100%)"; // Gray-brown
      case 4: // Desert Ruins - Orange/sandy
        return "radial-gradient(circle at 50% 20%, #92400e 0%, #78350f 50%, #451a03 100%)"; // Orange-brown
      case 5: // Frozen Cavern - Icy blue
        return "radial-gradient(circle at 50% 20%, #1e3a8a 0%, #1e40af 50%, #1e293b 100%)"; // Blue
      case 6: // Volcanic Depths - Red-orange
        return "radial-gradient(circle at 50% 20%, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)"; // Red-orange
      case 7: // Ancient Castle - Purple-gray
        return "radial-gradient(circle at 50% 20%, #581c87 0%, #3b0764 50%, #2e1065 100%)"; // Purple
      case 8: // Void Dimension - Deep purple/black
        return "radial-gradient(circle at 50% 20%, #4c1d95 0%, #2e1065 50%, #1a0a3d 100%)"; // Dark purple
      default:
        return "radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 50%, #020617 100%)"; // Default dark
    }
  }, [game.currentZoneId, game.bossAvailable]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Disable hotkeys while tutorial is showing
      if (showTutorial) return;
      
      if ((e.key === 'a' || e.key === 'A') && game.currentZoneId !== 0 && game.canAttack) {
        e.preventDefault();
        game.battleAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.canAttack, game.currentZoneId, game.battleAction, showTutorial]);

  const wrappedSellItem = () => {
    game.sellItem();
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
        background: zoneBackground,
        transition: "background 1.5s ease",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "system-ui, sans-serif",
        padding: "20px",
        paddingTop: "40px",
        paddingBottom: "120px",
        position: "relative",
      }}
    >
      {/* Grid Pattern Overlay for Texture */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      
      <FloatingText items={floatingTexts} onRemove={removeFloatingText} />
      <ItemDropAnimation items={droppingItems} onAnimationComplete={removeDroppedItem} />
      
      {/* Combat HUD - Floating Status Display */}
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
          border: "2px solid rgba(251, 191, 36, 0.5)",
          padding: "20px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "1200px",
          background: "rgba(20, 20, 20, 0.85)",
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(251, 191, 36, 0.1)",
          backdropFilter: "blur(12px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            margin: "0 0 20px 0",
            fontSize: "28px",
            background: "linear-gradient(45deg, #fbbf24, #f59e0b, #fef3c7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "900",
            letterSpacing: "1px",
            textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          ⚔️ Mini RPG - RO Style
        </h1>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
          {/* Tutorial Button */}
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
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
            }}
          >
            <span>📖</span>
            <span>How to Play</span>
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "15px",
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
                    : "#333",
                  color: "white",
                  border: canChangeJobNow ? "2px solid #fbbf24" : "1px solid #555",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  boxShadow: canChangeJobNow
                    ? "0 0 15px rgba(251, 191, 36, 0.5)"
                    : "none",
                  animation: canChangeJobNow ? "pulseButton 2s infinite" : "none",
                  transition: "all 0.2s",
                }}
              >
                {canChangeJobNow
                  ? "✨ Job Change!"
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
                    ? (game.char.hp > 0 ? "linear-gradient(45deg, #10b981, #059669)" : "#333")
                    : "linear-gradient(45deg, #8b5cf6, #6d28d9)",
                  color: "white",
                  border: game.char.hp > 0 ? "1px solid rgba(255,255,255,0.2)" : "1px solid #555",
                  borderRadius: "6px",
                  cursor: game.char.hp > 0 ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                  fontSize: "13px",
                  boxShadow: game.char.hp > 0 
                    ? (game.currentZoneId !== 0 ? "0 4px 10px rgba(16, 185, 129, 0.3)" : "0 4px 10px rgba(139, 92, 246, 0.3)")
                    : "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (game.char.hp > 0) e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  if (game.char.hp > 0) e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {game.currentZoneId !== 0 ? "🏛️ Escape to Town" : "🔨 Blacksmith"}
              </button>
            </div>

            <EnemyDisplay 
              enemy={game.enemy} 
              onAttack={() => game.battleAction()}
              canAttack={game.canAttack}
              inTown={game.currentZoneId === 0}
              attackCooldownPercent={game.attackCooldownPercent}
              autoAttackEnabled={game.autoAttackEnabled}
              onToggleAutoAttack={game.toggleAutoAttack}
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
              />
            </div>
            
            <div data-tutorial="shop">
              <Shop
                character={game.char}
                isInTown={game.currentZoneId === 0}
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
                onClick={wrappedHandleRespawn}
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

        <SkillHotkeys
          character={game.char}
          skillCooldowns={game.skillCooldowns}
          onUseSkill={game.battleAction}
          disabled={game.char.hp <= 0 || !game.canAttack || game.currentZoneId === 0}
        />
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
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .crit-shake {
          animation: critShake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
