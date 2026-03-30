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
import { useGameAudio } from "./hooks/useGameAudio";
import { canChangeJob } from "./data/jobs";
import { useEffect, useState, useRef } from "react";
import { BottomNavBar, MobileTab } from "./components/BottomNavBar";
import { useMonetization } from "./context/MonetizationContext";
import { LivesBar } from "./components/LivesBar";
import { ShopModal } from "./components/ShopModal";
import { InterstitialAd } from "./components/InterstitialAd";
import { TopHUDBar } from "./components/TopHUDBar";

export function MiniLevelGame() {
  const { logs, addLog } = useBattleLog();
  const { floatingTexts, addFloatingText, removeFloatingText } = useFloatingText();
  const { droppingItems, addDroppingItem, removeDroppedItem } = useItemDropAnimation();
  const audio = useGameAudio();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<MobileTab>('combat');
  const [newItemBadge, setNewItemBadge] = useState(0);
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

  // ── Monetization ──────────────────────────────────────────────────────────
  const {
    isPremium,
    lives,
    addCoins,
    addLives,
    spendLife,
    activatePremium,
    isChapterFree,
  } = useMonetization();
  const [showShop, setShowShop] = useState(false);
  const [showNoLivesGate, setShowNoLivesGate] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [pendingChapterUnlock, setPendingChapterUnlock] = useState<number | null>(null);

  function handleZoneTravel(zoneId: number) {
    if (lives === 0) {
      setShowNoLivesGate(true);
      return;
    }
    if (zoneId >= 4 && !isChapterFree(zoneId)) {
      setPendingChapterUnlock(zoneId);
      setShowInterstitialAd(true);
    } else {
      game.travelToZone(zoneId);
      if (isMobile) setActiveTab('combat');
    }
  }

  function handleAdComplete() {
    setShowInterstitialAd(false);
    if (pendingChapterUnlock !== null) {
      game.travelToZone(pendingChapterUnlock);
      setPendingChapterUnlock(null);
      if (isMobile) setActiveTab('combat');
    }
  }

  function handlePurchasePremium() {
    activatePremium();
    setShowShop(false);
  }

  function handlePurchaseCoins(packId: string) {
    const packMap: Record<string, number> = {
      coins_1000: 1000,
      coins_5000: 5000,
      coins_10000: 10000,
    };
    const amount = packMap[packId] ?? 0;
    game.devAddGold(amount);
    setShowShop(false);
  }

  function handleWatchAdForLife() {
    addLives(1);
  }
  // ── END Monetization ──────────────────────────────────────────────────────

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
      if (damage === 0) {
        addFloatingText(`✨ Dodged!`, {
          color: '#34d399',
          x: (windowCenterX + 200) + randomOffset,
          y: (window.innerHeight * 0.4) + randomOffset,
        });
      } else {
        addFloatingText(`-${damage}`, {
          color: '#ff6b6b',
          x: (windowCenterX + 200) + randomOffset,
          y: (window.innerHeight * 0.4) + randomOffset,
        });
      }
    },
    onLevelUp: (newLevel: number) => {
      addFloatingText(`🌟 LEVEL ${newLevel}! 🌟`, {
        color: '#ffd700',
        fontSize: 42,
        isLevelUp: true,
      });
      audio.playSFX("levelup");
    },
    onJobLevelUp: (newJobLevel: number) => {
      addFloatingText(`🌟 JOB LV ${newJobLevel}! 🌟`, {
        color: '#10b981',
        fontSize: 42,
        isLevelUp: true,
      });
      audio.playSFX("levelup");
    },
    onItemDrop: (item) => {
      addDroppingItem(item);
      // Show badge on Bag tab rather than auto-switching (which is disruptive during combat)
      if (isMobile && activeTab !== 'inventory') {
        setNewItemBadge(prev => prev + 1);
      }
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
      if (isBoss && game.currentZoneId === 8 && !showGameComplete) {
        setPlayTimeMs(Date.now() - startTimeRef.current);
        setTimeout(() => {
          setShowGameComplete(true);
        }, 1000);
      }
    },
  });

  const canChangeJobNow = canChangeJob(game.char.jobClass, game.char.jobLevel);

  // Reactive mobile detection — updates on window resize / orientation change
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Keyboard shortcut — gated behind lives > 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
        return;
      }
      if (showTutorial || showGameComplete) return;
      if ((e.key === 'a' || e.key === 'A') && game.currentZoneId !== 0 && game.canAttack && lives > 0) {
        e.preventDefault();
        game.battleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.canAttack, game.currentZoneId, game.battleAction, showTutorial, showGameComplete, lives]);

  useEffect(() => {
    if (game.currentZoneId === 0) {
      audio.playBGM("town");
    } else if (game.bossAvailable || game.isBossFight) {
      audio.playBGM("boss");
    } else {
      audio.playBGM("fight");
    }
  }, [game.currentZoneId, game.bossAvailable, game.isBossFight]);

  useEffect(() => {
    if (game.char.hp <= 0) {
      audio.playSFX("death");
    }
  }, [game.char.hp]);

  const wrappedSellItem = (item: Equipment) => { game.sellItem(item); };
  const wrappedUseHpPotion = () => { game.useHpPotion(); };
  const wrappedUseMpPotion = () => { game.useMpPotion(); };
  const wrappedHandleRespawn = () => {
    spendLife();
    game.handleRespawn();
  };
  const wrappedHandleJobChange = (newJob: any) => { game.handleJobChange(newJob); };

  return (
    <div
      style={{
        height: isMobile ? "100dvh" : "auto",
        minHeight: isMobile ? undefined : "100vh",
        overflow: isMobile ? "hidden" : "visible",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        color: "white",
        display: "flex",
        flexDirection: isMobile ? "column" : undefined,
        justifyContent: isMobile ? undefined : "center",
        alignItems: isMobile ? "stretch" : "flex-start",
        fontFamily: "system-ui, sans-serif",
        padding: isMobile ? "0" : "10px",
        paddingTop: isMobile ? "0" : "20px",
        paddingBottom: isMobile ? "0" : "20px",
      }}
    >
      {showTutorial && (
        <TutorialOverlay
          onClose={() => {
            setShowTutorial(false);
            setActiveTab('combat'); // reset tab so no empty screen after tutorial
            audio.playBGM(game.currentZoneId === 0 ? "town" : "fight");
          }}
          onBeforeStep={(stepIndex) => {
            if (!isMobile) return;
            // Maps tutorial step index → the tab whose data-tutorial element it highlights.
            // Steps: 0=welcome, 1=Combat&Exploration(map), 2=Stats&Growth, 3=JobAdvancement(stats),
            //        4=Loot&Equipment(inventory), 5=Town&Survival(shop).
            // Update this if tutorial steps in TutorialOverlay.tsx are reordered.
            const tabMap: Record<number, MobileTab> = {
              1: 'map',
              2: 'stats',
              3: 'stats',
              4: 'inventory',
              5: 'shop',
            };
            const tab = tabMap[stepIndex];
            if (tab) setActiveTab(tab);
          }}
        />
      )}

      {showGameComplete && (
        <GameCompleteModal
          character={game.char}
          playTimeMs={playTimeMs}
          onClose={() => setShowGameComplete(false)}
        />
      )}

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

      {/* Phase 2A: TopHUDBar — mobile-only persistent top bar */}
      {isMobile && (
        <TopHUDBar
          level={game.char.level}
          hp={game.char.hp}
          maxHp={game.char.maxHp}
        />
      )}

      <div
        id="game-container"
        style={{
          border: isMobile ? "none" : "2px solid gold",
          padding: isMobile ? "6px 6px 0 6px" : "15px",
          borderRadius: isMobile ? "0" : "12px",
          width: "100%",
          maxWidth: isMobile ? "100%" : "1200px",
          flex: isMobile ? 1 : undefined,
          display: isMobile ? "flex" : "block",
          flexDirection: isMobile ? "column" : undefined,
          overflow: isMobile ? "hidden" : undefined,
          background: "rgba(34, 34, 34, 0.95)",
          boxShadow: isMobile ? "none" : "0 8px 32px rgba(255, 215, 0, 0.2)",
          backdropFilter: "blur(10px)",
          overflowX: isMobile ? undefined : "hidden",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? "4px" : "20px", flexShrink: 0 }}>

          <div style={{ marginBottom: isMobile ? "3px" : "12px" }}>
            <LivesBar
              onWatchAd={handleWatchAdForLife}
              onBuyCoins={() => setShowShop(true)}
            />
          </div>

          <h1
            style={{
              margin: isMobile ? "0 0 2px 0" : "0 0 8px 0",
              fontSize: isMobile ? "15px" : "clamp(24px, 6vw, 32px)",
              background: "linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            ⚔️ Mini RPG Adventure
          </h1>
          {!isMobile && (
          <p
            style={{
              margin: "0",
              fontSize: "clamp(12px, 3vw, 14px)",
              color: "#94a3b8",
              fontStyle: "italic",
            }}
          >
            A nostalgic Ragnarok Online inspired idle RPG • Battle monsters, level up, and conquer epic bosses
          </p>
          )}
        </div>

        {!isMobile && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap", flexShrink: 0 }}>
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
              fontSize: "clamp(12px, 3vw, 14px)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <span>📖</span><span>How to Play</span>
          </button>

          <button
            onClick={audio.toggleMute}
            style={{
              padding: "8px 16px",
              background: "rgba(255, 255, 255, 0.08)",
              color: audio.isMuted ? "#666" : "#a3e635",
              border: `1px solid ${audio.isMuted ? "#555" : "#65a30d"}`,
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(12px, 3vw, 14px)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <span>{audio.isMuted ? "🔇" : "🔊"}</span>
            <span>{audio.isMuted ? "Muted" : "Music"}</span>
          </button>

          <button
            onClick={() => setShowShop(true)}
            style={{
              padding: "8px 16px",
              background: "rgba(251, 191, 36, 0.2)",
              color: "#fbbf24",
              border: "1px solid #fbbf24",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(12px, 3vw, 14px)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <span>👑</span><span>VIP Store</span>
          </button>

          {showDevTools && (
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
                fontSize: "clamp(12px, 3vw, 14px)",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <span>🎯</span><span>Training Hut</span>
            </button>
          )}
        </div>
        )}

        {isMobile ? (
          /* ── Mobile: Bottom-nav tab layout ── */
          <>
            {/* Always visible: core combat area — does not scroll.
                maxHeight 45vh ensures combat zone never takes more than half the screen
                on small phones (e.g. iPhone SE 667px), leaving ~55vh for tab content. */}
            <div style={{ flexShrink: 0, maxHeight: '45vh', overflowY: 'auto' }}>
              {/* EnemyDisplay — attack/auto gated behind lives > 0 */}
              <EnemyDisplay
                enemy={game.enemy}
                currentZoneId={game.currentZoneId}
                onAttack={() => lives > 0 && game.battleAction()}
                canAttack={game.canAttack && lives > 0}
                inTown={game.currentZoneId === 0}
                attackCooldownPercent={game.attackCooldownPercent}
                autoAttackEnabled={game.autoAttackEnabled && lives > 0}
                onToggleAutoAttack={() => {
                  if (lives === 0) return;
                  game.toggleAutoAttack();
                }}
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

            {/* Tab content — only this region scrolls */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
                paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))", // 64px = BottomNavBar height
              }}
            >
              {activeTab === 'combat' && (
                <>
                  {/* Mobile utility buttons — compacted row inside Combat tab */}
                  <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setShowTutorial(true)}
                      style={{
                        padding: "4px 8px",
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#60a5fa",
                        border: "1px solid #3b82f6",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}
                    >
                      <span>📖</span><span>Help</span>
                    </button>
                    <button
                      onClick={audio.toggleMute}
                      style={{
                        padding: "4px 8px",
                        background: "rgba(255, 255, 255, 0.08)",
                        color: audio.isMuted ? "#666" : "#a3e635",
                        border: `1px solid ${audio.isMuted ? "#555" : "#65a30d"}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}
                    >
                      <span>{audio.isMuted ? "🔇" : "🔊"}</span>
                    </button>
                    <button
                      onClick={() => setShowShop(true)}
                      style={{
                        padding: "4px 8px",
                        background: "rgba(251, 191, 36, 0.2)",
                        color: "#fbbf24",
                        border: "1px solid #fbbf24",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}
                    >
                      <span>👑</span><span>VIP</span>
                    </button>
                    {showDevTools && (
                      <button
                        onClick={() => setShowTrainingHut(true)}
                        style={{
                          padding: "4px 8px",
                          background: "rgba(245, 158, 11, 0.2)",
                          color: "#fbbf24",
                          border: "1px solid #f59e0b",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex", alignItems: "center", gap: "4px",
                        }}
                      >
                        <span>🎯</span>
                      </button>
                    )}
                  </div>
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
                  <SkillHotkeys
                    character={game.char}
                    skillCooldowns={game.skillCooldowns}
                    onUseSkill={(skillId) => game.battleAction(skillId)}
                    disabled={game.currentZoneId === 0 || lives === 0}
                  />
                </>
              )}

              {activeTab === 'stats' && (
                <>
                  <div data-tutorial="character-stats">
                    <CharacterStats
                      character={game.char}
                      equipped={game.equipped}
                      onAddStat={game.addStat}
                      onOpenSkills={() => game.setShowSkillWindow(true)}
                    />
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                    <button
                      data-tutorial="job-master"
                      onClick={game.openJobChangeNPC}
                      style={{
                        flex: 1, padding: "10px",
                        background: canChangeJobNow ? "linear-gradient(45deg, #f59e0b, #d97706)" : "#555",
                        color: "white",
                        border: canChangeJobNow ? "2px solid #fbbf24" : "none",
                        borderRadius: "6px", cursor: "pointer", fontWeight: "bold",
                        fontSize: "clamp(11px, 3vw, 13px)",
                        boxShadow: canChangeJobNow ? "0 0 15px rgba(251, 191, 36, 0.5)" : "none",
                        animation: canChangeJobNow ? "pulseButton 2s infinite" : "none",
                      }}
                    >
                      {canChangeJobNow ? "🧙 Job Change!" : "🧙 Job Master"}
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
                        flex: 1, padding: "10px",
                        background: game.currentZoneId !== 0
                          ? (game.char.hp > 0 ? "linear-gradient(45deg, #10b981, #059669)" : "#555")
                          : "linear-gradient(45deg, #8b5cf6, #6d28d9)",
                        color: "white", border: "none", borderRadius: "6px",
                        cursor: game.char.hp > 0 ? "pointer" : "not-allowed",
                        fontWeight: "bold", fontSize: "clamp(11px, 3vw, 13px)",
                        boxShadow: game.char.hp > 0
                          ? (game.currentZoneId !== 0 ? "0 0 10px rgba(16, 185, 129, 0.3)" : "0 0 10px rgba(139, 92, 246, 0.3)")
                          : "none",
                      }}
                    >
                      {game.currentZoneId !== 0 ? "🏛️ Escape to Town" : "🔨 Blacksmith"}
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'map' && (
                <div data-tutorial="map-system">
                  <MapSystem
                    currentZoneId={game.currentZoneId}
                    unlockedZoneIds={game.unlockedZoneIds}
                    onTravel={handleZoneTravel}
                  />
                </div>
              )}

              {activeTab === 'inventory' && (
                <div data-tutorial="inventory">
                  <EnhancedInventory
                    inventory={game.inventory}
                    equipped={game.equipped}
                    onEquip={game.equipItem}
                    onUnequip={game.unequipItem}
                  />
                </div>
              )}

              {/* Shop panel is now a slide-in overlay controlled by activeTab */}
            </div>

            {/* Phase 2F: Shop as full-screen slide-in panel */}
            <Shop
              character={game.char}
              isInTown={game.currentZoneId === 0}
              inventory={game.inventory}
              equipped={game.equipped}
              onSellItem={wrappedSellItem}
              onBuyHpPotion={game.buyHpPotion}
              onBuyMpPotion={game.buyMpPotion}
              onRefine={game.refineItem}
              onJobChange={wrappedHandleJobChange}
              isOpen={activeTab === 'shop'}
              onClose={() => setActiveTab('combat')}
            />

            <BottomNavBar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab === 'inventory') setNewItemBadge(0);
              }}
              statPointsBadge={game.char.statPoints}
              canChangeJob={canChangeJobNow}
              inventoryBadge={newItemBadge}
            />
          </>
        ) : (
          /* ── Desktop: 2-column grid layout ── */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
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
                    flex: 1, padding: "10px",
                    background: canChangeJobNow ? "linear-gradient(45deg, #f59e0b, #d97706)" : "#555",
                    color: "white",
                    border: canChangeJobNow ? "2px solid #fbbf24" : "none",
                    borderRadius: "6px", cursor: "pointer", fontWeight: "bold",
                    fontSize: "clamp(11px, 3vw, 13px)",
                    boxShadow: canChangeJobNow ? "0 0 15px rgba(251, 191, 36, 0.5)" : "none",
                    animation: canChangeJobNow ? "pulseButton 2s infinite" : "none",
                  }}
                >
                  {canChangeJobNow ? "🧙 Job Change!" : "🧙 Job Master"}
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
                    flex: 1, padding: "10px",
                    background: game.currentZoneId !== 0
                      ? (game.char.hp > 0 ? "linear-gradient(45deg, #10b981, #059669)" : "#555")
                      : "linear-gradient(45deg, #8b5cf6, #6d28d9)",
                    color: "white", border: "none", borderRadius: "6px",
                    cursor: game.char.hp > 0 ? "pointer" : "not-allowed",
                    fontWeight: "bold", fontSize: "clamp(11px, 3vw, 13px)",
                    boxShadow: game.char.hp > 0
                      ? (game.currentZoneId !== 0 ? "0 0 10px rgba(16, 185, 129, 0.3)" : "0 0 10px rgba(139, 92, 246, 0.3)")
                      : "none",
                  }}
                >
                  {game.currentZoneId !== 0 ? "🏛️ Escape to Town" : "🔨 Blacksmith"}
                </button>
              </div>

              {/* EnemyDisplay — attack/auto gated behind lives > 0 */}
              <EnemyDisplay
                enemy={game.enemy}
                currentZoneId={game.currentZoneId}
                onAttack={() => lives > 0 && game.battleAction()}
                canAttack={game.canAttack && lives > 0}
                inTown={game.currentZoneId === 0}
                attackCooldownPercent={game.attackCooldownPercent}
                autoAttackEnabled={game.autoAttackEnabled && lives > 0}
                onToggleAutoAttack={() => {
                  if (lives === 0) return;
                  game.toggleAutoAttack();
                }}
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
                  onTravel={handleZoneTravel}
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
                  equipped={game.equipped}
                  onSellItem={wrappedSellItem}
                  onBuyHpPotion={game.buyHpPotion}
                  onBuyMpPotion={game.buyMpPotion}
                  onRefine={game.refineItem}
                  onJobChange={wrappedHandleJobChange}
                />
              </div>
            </div>
          </div>
        )}

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

        {/* ── Monetization Modals ─────────────────────────────────────────── */}

        {showShop && (
          <ShopModal
            onClose={() => setShowShop(false)}
            onPurchasePremium={handlePurchasePremium}
            onPurchaseCoins={handlePurchaseCoins}
          />
        )}

        {showInterstitialAd && (
          <InterstitialAd onAdComplete={handleAdComplete} />
        )}

        {/* FIX: No Lives Gate — blocks zone entry, shown as full-screen modal */}
        {showNoLivesGate && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.88)",
              display: "flex", justifyContent: "center", alignItems: "center",
              zIndex: 1500, padding: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                border: "3px solid #c0392b",
                borderRadius: "16px",
                padding: "30px",
                maxWidth: "400px",
                width: "100%",
                color: "white",
                textAlign: "center",
                boxShadow: "0 0 50px rgba(192, 57, 43, 0.5)",
              }}
            >
              <div style={{ fontSize: "56px", marginBottom: "12px" }}>💔</div>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#f87171", fontWeight: "bold" }}>
                No Lives Remaining
              </h2>
              <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
                You need at least 1 life to enter battle.<br />
                Watch an ad for a free life, or visit the VIP Store.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => {
                    handleWatchAdForLife();
                    setShowNoLivesGate(false);
                  }}
                  style={{
                    padding: "12px",
                    background: "rgba(16,185,129,0.2)",
                    color: "#10b981",
                    border: "2px solid #10b981",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  📺 Watch Ad — Get +1 ❤️ Free
                </button>
                <button
                  onClick={() => {
                    setShowNoLivesGate(false);
                    setShowShop(true);
                  }}
                  style={{
                    padding: "12px",
                    background: "rgba(251,191,36,0.2)",
                    color: "#fbbf24",
                    border: "2px solid #fbbf24",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  👑 VIP Store
                </button>
                <button
                  onClick={() => setShowNoLivesGate(false)}
                  style={{
                    padding: "10px",
                    background: "transparent",
                    color: "#64748b",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  ✕ Stay in Town
                </button>
              </div>
              <p style={{ margin: "16px 0 0 0", color: "#475569", fontSize: "11px" }}>
                ⏱ Lives regenerate automatically over time
              </p>
            </div>
          </div>
        )}

        {/* Death Modal */}
        {game.showDeathModal && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0, 0, 0, 0.9)",
              display: "flex", justifyContent: "center", alignItems: "center",
              zIndex: 1000, padding: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                border: "3px solid #dc2626", borderRadius: "16px",
                padding: "30px", maxWidth: "500px", width: "100%",
                color: "white", textAlign: "center",
                boxShadow: "0 0 50px rgba(220, 38, 38, 0.5)",
              }}
            >
              <div style={{ fontSize: "clamp(48px, 15vw, 72px)", marginBottom: "20px" }}>💀</div>
              <h2 style={{ margin: "0 0 20px 0", fontSize: "clamp(24px, 7vw, 32px)", color: "#dc2626", fontWeight: "bold" }}>
                You Were Defeated!
              </h2>
              <p style={{ fontSize: "clamp(14px, 4vw, 16px)", marginBottom: "10px", color: "#bbb" }}>
                Your adventure has ended...
              </p>
              <p style={{ fontSize: "clamp(12px, 3.5vw, 14px)", marginBottom: "30px", color: "#888" }}>
                You will respawn at town with 50% HP and MP.
              </p>
              <button
                onClick={wrappedHandleRespawn}
                style={{
                  width: "100%", padding: "15px",
                  background: "linear-gradient(45deg, #dc2626, #991b1b)",
                  color: "white", border: "2px solid #ef4444",
                  borderRadius: "8px", cursor: "pointer",
                  fontSize: "clamp(16px, 4.5vw, 18px)", fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(220, 38, 38, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(220, 38, 38, 0.4)";
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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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
        @media (max-width: 768px) {
          body { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}