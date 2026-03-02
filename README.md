# Mini RPG - RO Style

A React-based RPG game inspired by Ragnarok Online, built with TypeScript and Vite.

## Running the Project

This project uses [React](https://reactjs.org/) with [Vite](https://vitejs.dev/) for fast development and optimized builds.

### Getting Started
- Hit run
- Edit [App.tsx](#src/App.tsx) and watch it live update!
- The main game component is in [MiniLevelGame.tsx](#src/MiniLevelGame.tsx)

By default, Replit runs the `dev` script, but you can configure it by changing the `run` field in the [configuration file](#.replit). Here are the vite docs for [serving production websites](https://vitejs.dev/guide/build.html)

---

## 🎮 **Addiction-Focused Roadmap for Single-Player RO**

The key to RO's addiction: **Short-term dopamine hits + Long-term progression goals + Random rewards**

---

## 📋 **Implementation Status Overview**

### ✅ Phase 1: Foundation (Completed)
- ✅ **Commit 1:** Loot Explosion System - Visual feedback & rewards
- ✅ **Commit 2:** Achievement System - Goals & milestones

### 🚧 Phase 2: Strategic Depth (Current)
- 🔄 **Commit 3A:** Element & Race System - Combat strategy foundation
- ⏳ **Commit 3B:** Card System - Collection & power progression

### ⏳ Phase 3: Endgame Loops (Planned)
- **Commit 4:** Equipment Enhancement (+0 to +10)
- **Commit 5:** Daily Quest System

### ⏳ Phase 4: Content Variety (Planned)
- **Commit 6:** Mob Variety & Mini-Bosses
- **Commit 7:** Pet/Companion System

### ⏳ Phase 5: Long-term Progression (Planned)
- **Commit 8:** Prestige/Rebirth System
- **Commit 9:** Guild/Party System (Single-player simulation)

### ⏳ Phase 6: Polish (Planned)
- **Commit 10:** Screen Shake, Particles & Sound
- **Commit 11:** Stat Build Presets & Guides

---

## 🔥 **Detailed Roadmap**

---

### **✅ Commit 1: Loot Explosion System** 🎁 **[COMPLETED]**
**Why it's addictive:** Instant visual feedback + random rewards trigger dopamine

**Features Implemented:**
- ✅ **Floating damage numbers** that pop up when you hit (shows damage amount)
- ✅ **Critical hit effects** - Larger, red, glowing text for crits
- ✅ **Item drop animations** - Items literally drop from monsters with physics-based bounce
- ✅ **Rare item sparkle effects** (common = white, rare = blue glow, epic = purple glow)
- ✅ **Level-up celebration** - Golden glowing text when you level up

**Files Created:**
- `src/components/FloatingText.tsx` - Damage numbers and text effects
- `src/components/ItemDropAnimation.tsx` - Physics-based item drops
- `src/hooks/useFloatingText.ts` - Hook for managing floating text
- `src/hooks/useItemDropAnimation.ts` - Hook for item drop effects

---

### **✅ Commit 2: Achievement & Milestone System** 🏆 **[COMPLETED]**
**Why it's addictive:** Clear goals + instant gratification + social proof feel

**Features Implemented:**
- ✅ **Pop-up achievements** when unlocked with rarity-colored glow
- ✅ **Achievement categories:**
  - ⚔️ Combat: Kill enemies, deal damage, defeat bosses
  - 📈 Progression: Reach levels, max stats, learn skills, job changes
  - 💰 Collection: Earn gold, own equipment, sell items, use potions
  - 🗺️ Exploration: Visit zones, survive combat time, respawn
- ✅ **Title system** - Unlock titles that show on character card ("Novice Hunter", "Boss Destroyer", etc.)
- ✅ **Achievement tracker UI** - Shows progress with hints ("Kill 3 more!", "2 levels to go!")
- ✅ **Progress indicators** - Visual bars and percentages for locked achievements
- ✅ **25+ achievements** across 4 categories with 4 rarity tiers

**Files Created:**
- `src/types/achievement.ts` - Achievement type definitions
- `src/data/achievements.ts` - 25+ achievement definitions
- `src/components/AchievementPopup.tsx` - Animated unlock notifications
- `src/components/AchievementList.tsx` - Full achievement gallery
- `src/hooks/useAchievements.ts` - Achievement tracking logic

**Why NEXT AFTER Loot System:** Gives players short-term goals between leveling up.

---

### **🔄 Commit 3A: Element & Race System** ⚡🐉 **[CURRENT]**
**Why it's addictive:** Strategic depth + build diversity + knowledge-based gameplay

**Why BEFORE Cards:** Elements/Races are the foundation for strategic combat. Cards become 10x more valuable when they interact with enemy types.

**Features to Add:**

#### **Element System (Rock-Paper-Scissors):**
- 🔥 **Fire** → Weak to Water, Strong vs Wind/Earth
- 💧 **Water** → Weak to Earth, Strong vs Fire
- 🌍 **Earth** → Weak to Wind, Strong vs Water  
- 💨 **Wind** → Weak to Fire, Strong vs Earth
- ⚪ **Holy** ↔ **Dark** ☠️ (Mutual weakness)
- 👻 **Ghost** (Reduced physical damage)
- ☠️ **Poison** (DoT effects)
- ⚫ **Neutral** (No advantages)

#### **Race System:**
- 👹 **Demon** - High ATK, low DEF
- 🧚 **Demi-Human** - Balanced stats
- 🐉 **Dragon** - High HP, high all stats
- 🌿 **Plant** - Weak to Fire element
- 🐟 **Fish** - Lower stats on land
- 🪨 **Formless** - Magic resistant
- 🦴 **Undead** - Heals from Dark/Poison
- 🐛 **Insect** - Fast ASPD
- 👼 **Angel** - Holy element

#### **Size System:**
- **Small** - Daggers +25%, Spears -25%
- **Medium** - All weapons 100%
- **Large** - Spears +25%, Daggers -25%

#### **Implementation Details:**
```typescript
Enemy Properties:
  - Element (affects damage taken/dealt)
  - Race (affects specialized equipment/skills)
  - Size (affects weapon effectiveness)

Weapon Properties:
  - Element (e.g., Fire Sword deals Fire damage)
  - Bonus vs Race (e.g., Dragon Lance +40% vs Dragons)
  
Armor Properties:
  - Elemental Resist (e.g., Fire Armor: -50% Fire damage)
  - Race Defense (future)

Combat Formula:
  Base Damage × Element Modifier × Size Modifier × Race Modifier
```

#### **Strategic Impact:**
- 🧠 **Build diversity** - Fire Mage shines vs Water/Ice zones
- 🎒 **Equipment switching** - Carry multiple weapon/armor sets
- 📚 **Knowledge matters** - Study enemy before boss fight
- 🎯 **Preparation pays off** - Right element = 2x damage!

**Files to Create:**
- `src/types/element.ts` - Element/Race/Size enums
- `src/data/enemyProperties.ts` - Enemy → Element/Race/Size mapping
- `src/data/elementalWeapons.ts` - Elemental weapon loot table
- `src/logic/elementalCombat.ts` - Elemental damage calculations
- `src/components/ElementIcon.tsx` - Visual element badges
- `src/components/EnemyInfo.tsx` - Enemy detail tooltip

**Files to Update:**
- `src/types/equipment.ts` - Add element/race fields
- `src/types/enemy.ts` - Add element/race/size
- `src/logic/combat.ts` - Integrate elemental modifiers
- `src/logic/loot.ts` - Generate elemental weapons
- `src/components/EnemyDisplay.tsx` - Show element/race icons

**Estimated Time:** 45-60 minutes

---

### **⏳ Commit 3B: Card System (RO's Most Addictive Feature)** 🃏
**Why it's addictive:** Ultra-rare drops + collection urge + power boost

**Why AFTER Element System:** Cards gain strategic value by interacting with elements/races.

**Features to Add:**

#### **Card Drop System:**
- **Drop rates:**
  - Common monsters: 0.5% - 1%
  - Rare monsters: 0.1% - 0.5%
  - Boss monsters: 0.01% - 0.05% (but guaranteed card type)
- **"CARD DROP!" screen flash** with epic animation
- **Card rarity tiers:**
  - 🟢 Common: +5 stat, +10% vs element
  - 🔵 Rare: +10 stat, +20% vs element  
  - 🟣 Epic: +20 stat, +30% vs race
  - 🟡 Legendary: Unique effects, +50% vs type

#### **Card Effects (Leveraging Element/Race System):**
```typescript
🟢 Poring Card (Common - Water/Plant)
   Slot: Weapon
   Effect: +100 HP, +15% damage vs Fire enemies

🔵 Lunatic Card (Rare - Neutral/Demi-Human)  
   Slot: Armor
   Effect: +5 LUK, +20% flee rate

🟣 Drake Card (Epic - Fire/Dragon)
   Slot: Weapon  
   Effect: +25 ATK, +30% damage vs Dragon race

🟡 Baphomet Card (Legendary - Dark/Demon)
   Slot: Weapon
   Effect: +50 ATK, Splash damage, +50% vs Holy enemies
```

#### **Card System Features:**
- **Card album UI** - Shows all cards, "???" for undiscovered
- **Card slotting** - Equipment has 0-4 card slots
  - Common equipment: 0-1 slots
  - Rare equipment: 1-2 slots
  - Epic equipment: 2-3 slots  
  - Boss drops: 3-4 slots
- **Card removal** - Destroys equipment (risk/reward)
- **Collection counter** - "12/75 cards collected"
- **Card trading** - Future: trade duplicates for specific cards

**Files to Create:**
- `src/types/card.ts` - Card type definitions
- `src/data/cards.ts` - 75+ card database
- `src/components/CardAlbum.tsx` - Card collection UI
- `src/components/CardSlotting.tsx` - Card insertion interface
- `src/components/CardInventory.tsx` - Card storage
- `src/hooks/useCards.ts` - Card state management

**Files to Update:**
- `src/types/equipment.ts` - Add card slot properties
- `src/logic/loot.ts` - Add card drop logic
- `src/logic/combat.ts` - Apply card bonuses

**Why AFTER Elements:** Cards like "Fire Dragon Card" only make sense with element system.

**Estimated Time:** 1.5-2 hours

---

### **⏳ Commit 4: Equipment Enhancement (+0 to +10 System)** 🔨
**Why it's addictive:** Gambling mechanic + visible power increase + risk/reward

**Why AFTER Cards:** Can enhance equipment with slotted cards for even bigger gambles.

**Features:**
- **Refine NPC in town** (costs gold + refine materials)
- **Enhancement success rates:**
  - +1 to +3: 100% (safe zone)
  - +4 to +7: 70% → 50% (risk starts)
  - +8 to +10: 40% → 20% (**item destroyed on fail!**)
- **Each +1 gives:**
  - Weapons: +2 ATK per level
  - Armor: +1 DEF per level
  - +7 and above: Element damage +10%
- **Visual feedback:**
  - +0 to +3: Normal appearance
  - +4 to +6: Faint glow
  - +7 to +9: Bright pulsing aura  
  - +10: Epic glowing aura + sparkles
- **Refine materials:**
  - Elunium (drops from normal monsters)
  - Oridecon (drops from bosses)
  - Enriched materials (higher success rate, rare drop)

**Files to Create:**
- `src/components/RefineNPC.tsx` - Enhancement interface
- `src/components/RefineAnimation.tsx` - Success/fail animations
- `src/logic/refinement.ts` - Enhancement calculations
- `src/data/refineMaterials.ts` - Material definitions

**Strategic Impact:**
- ⚠️ **Risk management** - Safe +7 or gamble for +10?
- 💰 **Resource sink** - Gold and materials have value
- 🎰 **Gambling excitement** - Heart-pounding +9 → +10 attempts
- 🏆 **Prestige** - +10 weapon is status symbol

**Estimated Time:** 1-1.5 hours

---

### **⏳ Commit 5: Daily Quest System** 📅
**Why it's addictive:** Login habit formation + FOMO + guaranteed rewards

**Why AFTER Achievements:** Uses achievement tracking infrastructure.

**Features:**
- **Daily login rewards** (resets at midnight):
  - Day 1: 500 gold
  - Day 2: 1000 gold + HP potions
  - Day 3: 2000 gold + MP potions
  - Day 7: Random card + refine materials
  - Day 30: Legendary card guaranteed
- **Daily quests** (3 per day):
  - Easy: Kill 10 enemies (500 EXP, 200g)
  - Medium: Defeat 1 boss (1000 EXP, card chance +5%)
  - Hard: Clear zone without potions (Rare equipment)
- **Streak system:**
  - 7-day streak: +10% EXP boost for 24h
  - 14-day streak: +10% drop rate boost
  - 30-day streak: Exclusive title + card
- **Quest UI:**
  - Shows time until reset
  - Progress bars for each quest
  - Claim rewards button with animation

**Files to Create:**
- `src/types/dailyQuest.ts` - Quest definitions
- `src/data/dailyQuests.ts` - Quest pool
- `src/components/DailyQuestPanel.tsx` - Quest UI
- `src/components/LoginReward.tsx` - Login bonus popup
- `src/hooks/useDailyQuests.ts` - Quest state + localStorage

**Estimated Time:** 1-1.5 hours

---

### **⏳ Commit 6: Mob Variety & Mini-Bosses** 👹
**Why it's addictive:** Breaks grinding monotony + rare encounters = excitement

**Why AFTER Element System:** Mini-bosses can have unique element combos.

**Features:**
- **Mini-boss spawns** (3% chance replacing normal enemy):
  - Name prefix: "Elite" or "Veteran"
  - 3x HP, 1.5x ATK/DEF
  - Guaranteed rare item drop
  - 5x card drop rate
  - Glowing aura + name plate
- **Rare variants:**
  - Golden Poring (5% spawn)
  - Silver Lunatic (3% spawn)  
  - Drops special loot only they have
- **Monster bestiary:**
  - Tracks kills per monster type
  - Shows drop rates after 10+ kills
  - Element/race info
  - Achievement for "Discover all monsters"
- **Environmental variety per zone:**
  - Forest: Green tint, leaf particles
  - Cave: Dark, torch light, echoes
  - Desert: Heat shimmer, sand storms
  - Volcano: Red glow, embers

**Files to Create:**
- `src/components/Bestiary.tsx` - Monster encyclopedia
- `src/data/miniBosses.ts` - Mini-boss definitions
- `src/data/rareVariants.ts` - Shiny monster data
- `src/components/ZoneEnvironment.tsx` - Visual zone effects
- `src/hooks/useBestiary.ts` - Monster tracking

**Estimated Time:** 1.5-2 hours

---

### **⏳ Commit 7: Pet/Companion System** 🐾
**Why it's addictive:** Emotional attachment + passive bonuses + collection

**Why AFTER Cards:** Pets can have card-like effects.

**Features:**
- **Pet capture system:**
  - Buy "Taming Item" from shop (different per monster)
  - Use on enemy at <20% HP
  - 30% capture chance
  - Can only have 1 active pet
- **Pet mechanics:**
  - Follows player sprite
  - Auto-attacks (50% of player damage)
  - Gains EXP and levels up
  - Has hunger meter (feed with items)
  - Loyalty affects performance
- **Pet bonuses:**
  - 🟢 Poring: +10% gold gain
  - 🐺 Wolf: +5% crit chance
  - 🦅 Falcon: +15% EXP gain
  - 🐉 Dragon (rare): +10% all stats
- **Pet evolution:**
  - Level 30: Evolve to stronger form
  - Evolved pets have unique sprites
  - Enhanced passive bonuses
- **Pet UI:**
  - Pet status window (HP, hunger, loyalty)
  - Pet inventory (own equipment slots!)
  - Pet skill tree (future)

**Files to Create:**
- `src/types/pet.ts` - Pet definitions
- `src/data/pets.ts` - Capturable pets
- `src/components/PetDisplay.tsx` - Pet UI
- `src/components/PetCapture.tsx` - Capture interface
- `src/hooks/usePet.ts` - Pet state management
- `src/logic/petCombat.ts` - Pet battle logic

**Estimated Time:** 2-2.5 hours

---

### **⏳ Commit 8: Prestige/Rebirth System** ♻️
**Why it's addictive:** Infinite progression + permanent bonuses + prestige currency

**Why LATE GAME:** Requires Level 99 cap to make sense.

**Features:**
- **Rebirth requirements:**
  - Reach Level 99
  - Defeat final boss
  - Pay 1,000,000 gold
- **Rebirth effects:**
  - Reset to Level 1
  - Keep: Equipment, cards, pets, achievements
  - Lose: Gold, items, quest progress
  - Gain: +5% all stats permanently per rebirth
  - Unlock: Prestige level counter
- **Prestige shop:**
  - Spend prestige points on:
    - Stat boost scrolls
    - Exclusive cosmetics
    - Card pack bundles
    - Pet skins
- **Prestige benefits:**
  - Level 1-10 Rebirth: +50% EXP per rebirth
  - Level 10+ Rebirth: Access to Rebirth-only zones
  - Level 20+ Rebirth: Transcendent job classes
- **Visual prestige:**
  - Name color changes per rebirth tier
  - Aura effects at high prestige
  - Prestige-only titles

**Files to Create:**
- `src/components/RebirthNPC.tsx` - Rebirth interface
- `src/components/PrestigeShop.tsx` - Prestige store
- `src/hooks/usePrestige.ts` - Prestige tracking
- `src/logic/prestigeCalculations.ts` - Stat bonuses

**Estimated Time:** 1.5-2 hours

---

### **⏳ Commit 9: Guild/Party System (Single-Player)** 👥
**Why it's addictive:** Social simulation + shared bonuses + cooperative feel (even fake)

**Why OPTIONAL:** Works as single-player simulation with NPC "party members."

**Features:**
- **NPC party members:**
  - Recruit from town (costs gold)
  - AI-controlled fighters
  - Each has class/element/build
  - Level up with you
- **Party bonuses:**
  - 2 members: +10% EXP
  - 3 members: +20% EXP, +5% drop rate
  - 4 members: +30% EXP, +10% drop rate, damage share
- **Guild simulation:**
  - Join NPC guild
  - Complete guild missions
  - Earn guild points
  - Unlock guild storage
  - Guild level provides buffs
- **Cooperative mechanics:**
  - Party members tank/heal
  - Can give commands (attack/defend/retreat)
  - Share loot distribution

**Estimated Time:** 2-3 hours

---

### **⏳ Commit 10: Screen Shake, Particles & Sound Effects** 💥
**Why it's addictive:** Tactile feedback makes combat satisfying

**Features:**
- **Screen effects:**
  - Shake on crit (intensity scales with damage)
  - Flash on boss kill
  - Slow-mo on rare card drop
- **Particle systems:**
  - Blood splash (varies by enemy race)
  - Gold coins fountain on kill
  - Element particles (fire sparks, water drops)
  - Level-up sparkle burst
- **Sound library:**
  - Hit sounds (pitch varies by damage)
  - Crit sound (extra bass)
  - Level-up fanfare
  - Rare drop chime
  - Boss music
  - Zone ambient sounds

**Files to Create:**
- `src/utils/screenShake.ts` - Camera shake utility
- `src/components/ParticleSystem.tsx` - Particle effects
- `src/assets/sounds/` - Sound files
- `src/hooks/useSoundEffects.ts` - Audio management

**Estimated Time:** 2-3 hours

---

### **⏳ Commit 11: Stat Build Presets & Guides** 📖
**Why it's addictive:** Removes decision paralysis + encourages replayability

**Features:**
- **Build templates:**
  - "Tank Swordsman" (VIT 50, STR 30)
  - "Glass Cannon Mage" (INT 60, DEX 20)
  - "Crit Assassin" (AGI 40, LUK 40)
  - "Support Priest" (INT 40, VIT 30)
- **Build preview:**
  - Shows expected stats at Level 99
  - DPS calculator
  - Survivability rating
- **In-game encyclopedia:**
  - Element chart
  - Race weaknesses
  - Skill tooltips
  - Equipment comparisons
- **Stat reset:**
  - NPC in town
  - Costs gold (scales with level)
  - First reset free

**Files to Create:**
- `src/data/buildTemplates.ts` - Preset builds
- `src/components/BuildGuide.tsx` - Build UI
- `src/components/Encyclopedia.tsx` - Game knowledge base
- `src/components/StatResetNPC.tsx` - Reset interface

**Estimated Time:** 1-1.5 hours

---

## 🎯 **Why This Specific Order?**

### **Dependency Chain:**
```
Commit 1 (Loot) → Foundation for visual rewards
    ↓
Commit 2 (Achievements) → Tracking system
    ↓
Commit 3A (Elements/Races) → Combat strategy foundation
    ↓
Commit 3B (Cards) → Leverage elements for value
    ↓
Commit 4 (Enhancement) → Builds on cards (enhance slotted items)
    ↓  
Commit 5 (Daily Quests) → Uses achievement tracking
    ↓
Commit 6 (Mob Variety) → Uses elements for unique enemies
    ↓
Commit 7 (Pets) → Uses cards/elements for pet bonuses
    ↓
Commit 8 (Prestige) → Requires full game loop
    ↓
Commit 9 (Guild/Party) → Optional cooperative layer
    ↓
Commits 10-11 (Polish) → Final layer of juice
```

### **Psychological Progression:**
1. **Commits 1-2:** Instant satisfaction (loot + achievements) → Hook players
2. **Commits 3-5:** Strategic depth (elements + cards + enhancement) → Engage brain
3. **Commits 6-7:** Content variety (mobs + pets) → Keep fresh
4. **Commits 8-9:** Endgame (prestige + guild) → Long-term retention
5. **Commits 10-11:** Polish (effects + guides) → Perfect experience

---

## 🧠 **The Psychological Formula:**

Classic RO's addiction = **Variable Ratio Reinforcement Schedule**

- **Fixed rewards:** Level up every X EXP (predictable satisfaction)
- **Variable rewards:** Cards drop randomly (unpredictable dopamine spike)  
- **Progress markers:** Achievements, quests (sense of accomplishment)
- **FOMO:** Daily quests (fear of missing out)
- **Collection urge:** Card album, bestiary (completionist drive)
- **Social proof:** Titles, prestige (status display)
- **Risk/reward:** Enhancement gambling (thrill of gamble)

---

## 📝 Current Implementation Status

### ✅ Completed Features
- Basic combat system with manual and auto-attack
- Job system (Novice → Swordsman/Mage/Archer → Knight/Wizard/Hunter)
- Skill trees and job-specific abilities
- Equipment system with weapons and armor
- Zone progression with boss fights
- ASPD-based attack speed
- HP/MP potion system with auto-use
- Town healing and safe zones
- Death and respawn system
- Job level progression
- **Loot explosion visual effects**
- **Floating damage numbers with crit effects**
- **Item drop animations with rarity glow**
- **Level-up celebrations**
- **Achievement system (25+ achievements)**
- **Title system with character display**
- **Achievement progress tracking with hints**

### 🔄 Currently Implementing
- Element & Race System (Commit 3A)

### ⏳ Next Up
- Card System (Commit 3B)
- Equipment Enhancement (Commit 4)

---

## 📚 Technical Documentation

For code organization and architecture details, see the original refactoring plan sections below.

[Rest of original README content...]
