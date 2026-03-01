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

### **🔥 Phase 1: Core Addiction Loops (Priority - Next 5 Commits)**

These create the "just one more..." feeling.

#### **✅ Commit 1: Loot Explosion System** 🎁 **[COMPLETED]**
**Why it's addictive:** Instant visual feedback + random rewards trigger dopamine

**Features Implemented:**
- ✅ **Floating damage numbers** that pop up when you hit (shows damage amount)
- ✅ **Critical hit effects** - Larger, red, glowing text for crits
- ✅ **Item drop animations** - Items literally drop from monsters with physics-based bounce
- ✅ **Rare item sparkle effects** (common = white, rare = blue glow, epic = purple glow)
- ✅ **"Rare Drop!" banner** that flashes across screen for rare/epic drops
- ✅ **Level-up celebration** - Golden glowing text when you level up

**Files Created:**
- `src/components/FloatingText.tsx` - Damage numbers and text effects
- `src/components/ItemDropAnimation.tsx` - Physics-based item drops
- `src/components/RareDropBanner.tsx` - Epic/rare drop announcements
- `src/hooks/useFloatingText.ts` - Hook for managing floating text
- `src/hooks/useItemDropAnimation.ts` - Hook for item drop effects

---

#### **Commit 2: Achievement & Milestone System** 🏆
**Why it's addictive:** Clear goals + instant gratification + social proof feel

**Features to Add:**
- **Pop-up achievements** when unlocked (e.g., "First Blood!", "Level 10!", "100 Kills!")
- **Achievement categories:**
  - Combat: Kill X enemies, deal X damage in one hit, defeat boss without dying
  - Progression: Reach level X, max a stat, learn all skills for class
  - Collection: Own 5 weapons, sell 100 items, earn 10,000 gold
- **Title system** - Unlock titles that show on character card
- **Achievement tracker UI** - Shows "Close to unlocking: Kill 3 more Goblins!"

**Why NEXT:** Gives players short-term goals between leveling up.

---

#### **Commit 3: Card System (RO's Most Addictive Feature)** 🃏
**Why it's addictive:** Ultra-rare drops + collection + power boost

**Features:**
- **Monster cards drop at 0.01% - 0.1% rate** (super rare!)
- **Card effects:**
  - Poring Card: +5% HP
  - Goblin Card: +2 ATK
  - Boss Cards: Powerful unique effects
- **Card album UI** - Shows all cards, "???" for undiscovered ones
- **"CARD DROP!" screen flash** - Unmistakable when you get one
- **Card slotting** - Equipment has 1-4 card slots
- **Collection counter** - "12/50 cards collected"

**Why AFTER Achievement System:** Cards can be part of achievement rewards.

---

#### **Commit 4: Daily Quests & Rewards** 📅
**Why it's addictive:** Login habit formation + FOMO + guaranteed rewards

**Features:**
- **Daily login bonus** - Day 1: 100g, Day 2: 200g, Day 7: Rare item
- **Daily quests** (resets every 24h):
  - Kill 10 Porings (Reward: 500 EXP, 100g)
  - Defeat 1 Boss (Reward: Random card chance boost)
  - Collect 5 items (Reward: HP potions)
- **Streak counter** - "Logged in for 5 days straight!"
- **Quest completion fanfare** - Satisfying sound + visual effect

**Why THEN:** Keeps players coming back tomorrow.

---

#### **Commit 5: Mob Variety & Mini-Bosses** 👹
**Why it's addictive:** Surprises break monotony + rare encounters = excitement

**Features:**
- **Mini-boss random spawns** (5% chance instead of normal enemy)
  - Looks different (bigger, glowing)
  - 3x HP, 2x rewards
  - Special loot table
- **Rare monster variants:**
  - Shiny Poring (golden), Golden Goblin
  - Drop 5x items guaranteed
- **Environmental variety** per zone:
  - Forest: Trees, nature sounds
  - Caves: Darker, echo sounds
  - Desert: Heat shimmer effect
- **Monster bestiary** - Track which monsters you've killed, show stats

**Why THEN:** Makes grinding less repetitive.

---

### **⚡ Phase 2: Progression Depth (Next 3 Commits)**

These give long-term goals to chase.

#### **Commit 6: Equipment Enhancement (+1 to +10 System)** 🔨
**Why it's addictive:** Gambling mechanic + visible power increase

**Features:**
- **Refine NPCs in town** (costs gold + refine stones)
- **Success rates:**
  - +1 to +3: 100% (safe)
  - +4 to +7: 60%
  - +8 to +10: 30%, **item destroyed on fail**
- **Visual feedback:**
  - +4 weapon glows faintly
  - +7 weapon pulses with light
  - +10 weapon has epic aura
- **Refine stones drop from bosses**

---

#### **Commit 7: Pet/Companion System** 🐾
**Why it's addictive:** Emotional attachment + passive bonuses + collection

**Features:**
- **Capture system** - Use "Taming Item" on low-HP monsters
- **Pets follow you** and auto-attack (weaker than you)
- **Pet bonuses:**
  - Poring: +5% gold gain
  - Wolf: +3% crit chance
  - Bird: +10% EXP
- **Pet evolution** - Level up pets to unlock stronger forms
- **Pet UI** - Shows hunger, loyalty, stats

---

#### **Commit 8: Prestige/Rebirth System** ♻️
**Why it's addictive:** Infinite progression + special rewards

**Features:**
- **At Level 99** - Option to "Rebirth"
  - Reset to Level 1
  - Keep equipment and cards
  - Unlock "Prestige Level" counter
  - Each prestige grants +5% all stats permanently
- **Prestige-only rewards:**
  - Special titles ("Reborn Hero")
  - Unique cosmetic effects
  - Access to Prestige Shop
- **Prestige leaderboard** (even in single-player, shows your rank vs theoretical max)

---

### **🎨 Phase 3: Polish & Juice (Next 2 Commits)**

These make everything *feel* better.

#### **Commit 9: Screen Shake, Particles & Sound Effects** 💥
**Why it's addictive:** Tactile feedback makes combat satisfying

**Features:**
- **Screen shake** when you crit or kill boss
- **Particle effects:**
  - Blood splash when enemy hit
  - Gold coins when enemy dies
  - Level-up sparkles
- **Sound library:**
  - Hit sounds (different for crit)
  - Level up fanfare
  - Rare drop chime
  - Background music per zone

---

#### **Commit 10: Stat Build Presets & Guides** 📖
**Why it's addictive:** Removes decision paralysis + encourages replayability

**Features:**
- **Build templates:**
  - "Tank Swordsman" (VIT focus)
  - "Glass Cannon Mage" (INT/DEX)
  - "Crit Assassin" (AGI/LUK)
- **In-game tips:**
  - "AGI increases your attack speed!"
  - "LUK affects critical chance and drop rate!"
- **Stat reset NPC** (expensive, but allows experimentation)

---

## 🎯 **Why This Order?**

1. **Commits 1-5** create immediate satisfaction (loot drops, achievements, cards) → Players get hooked
2. **Commits 6-8** add depth for mid-game → Players stay hooked
3. **Commits 9-10** polish the experience → Players tell friends

---

## 🧠 **The Psychological Formula:**

Classic RO's addiction = **Variable Ratio Reinforcement Schedule**

- **Fixed rewards:** Level up every X exp (predictable satisfaction)
- **Variable rewards:** Cards drop randomly (unpredictable dopamine spike)
- **Progress markers:** Achievements, quests (sense of accomplishment)
- **FOMO:** Daily quests (fear of missing out)
- **Collection urge:** Card album, bestiary (completionist drive)

---

## 📝 Current Implementation Status

### ✅ Completed Features
- Basic combat system with manual and auto-attack
- Job system (Novice → Swordsman/Mage/Archer)
- Skill trees and job-specific abilities
- Equipment system with weapons and armor
- Zone progression with boss fights
- ASPD-based attack speed
- HP/MP potion system with auto-use
- Town healing and safe zones
- Death and respawn system
- Job level progression
- **Loot explosion visual effects**
- **Floating damage numbers**
- **Item drop animations**
- **Level-up celebrations**

### 🚧 In Progress
- Achievement system (Next)
- Card collection system (After achievements)

---

## 📚 Technical Documentation

For code organization and architecture details, see the original refactoring plan sections below.

[Rest of original README content...]
