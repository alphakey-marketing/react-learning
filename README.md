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

## 🎮 **Addiction-Focused Roadmap: "Progressive Complexity"**

To prevent overwhelming new players, systems are introduced progressively. Players start with simple "Number Go Up" mechanics, and unlock deep strategic math (Elements/Races) only when they hit the mid-game difficulty wall.

---

## 📋 **Implementation Status Overview**

### ✅ Phase 1: The Dopamine Hook (Levels 1-20)
*Focus: Visual rewards, simple numbers, and immediate gratification.*
- ✅ **Commit 1:** Loot Explosion System - Visual feedback & physics drops
- ✅ **Commit 2:** Achievement System - Short-term goals & milestones

### 🚧 Phase 2: Power Up & Gamble (Levels 20-40) [CURRENT]
*Focus: Easy-to-understand power boosts without complex math.*
- 🔄 **Commit 3:** Equipment Enhancement (+1 to +10 & Breaking)
- ⏳ **Commit 4:** Card System (Basic Edition - Flat Stats)

### ⏳ Phase 3: The Strategic Awakening (Levels 40-70)
*Focus: Hitting a difficulty wall where strategy and knowledge become required.*
- **Commit 5:** Bestiary & Daily Quests
- **Commit 6:** Element & Race System (The big strategy unlock)
- **Commit 7:** Advanced Cards (Elemental/Race multipliers)

### ⏳ Phase 4: Companions & Content (Levels 70-90)
*Focus: Variety and emotional attachment.*
- **Commit 8:** Pet/Companion System
- **Commit 9:** MVP World Bosses & Mini-Boss Spawns

### ⏳ Phase 5: The Infinite Endgame (Level 99+)
*Focus: Giving hardcore players endless goals.*
- **Commit 10:** Prestige/Rebirth System
- **Commit 11:** Single-Player Guild / Party Simulation
- **Commit 12:** Final Polish (Screen shake, Particles, Sounds)

---

## 🔥 **Detailed Roadmap**

---

### **✅ Commit 1: Loot Explosion System** 🎁 **[COMPLETED]**
**Features Implemented:**
- ✅ Floating damage numbers & Critical hit text
- ✅ Physics-based item drop animations
- ✅ Rare item sparkle effects (white/blue/purple)
- ✅ Level-up celebration text

### **✅ Commit 2: Achievement System** 🏆 **[COMPLETED]**
**Features Implemented:**
- ✅ Pop-up achievements with rarity-colored glow
- ✅ 25+ achievements across Combat, Progression, Collection, Exploration
- ✅ Title system for character display
- ✅ Achievement tracker UI with progress hints

---

### **🔄 Commit 3: Equipment Enhancement (+0 to +10)** 🔨 **[CURRENT]**
**Why now:** Everyone understands upgrading. It creates a massive gold/material sink and introduces thrilling gambling risk before complex combat math is needed.

**Features to Add:**
- **The Blacksmith NPC** in town.
- **Safe Upgrades:** +1 to +4 have a 100% success rate.
- **Risk/Reward:** +5 to +10 have dropping success rates.
- **The Penalty:** Failing an unsafe upgrade **destroys the equipment**.
- **Visuals:** Gear +7 or higher gets a glowing aura in the UI.
- **Materials:** Elunium (Armor) and Oridecon (Weapons) drop from bosses.

---

### **⏳ Commit 4: Card System (Basic Edition)** 🃏
**Why now:** Introduces the RO 0.01% drop rate dopamine hit. Kept simple with flat stats first.

**Features to Add:**
- **Monster cards drop at 0.01% - 0.1% rate**.
- **Basic Effects:** Poring (+100 HP), Wolf (+10 ATK), etc.
- **Card slotting UI** - Equipment has 0-4 card slots.
- **Card Album** to track collections.

---

### **⏳ Commit 5: Bestiary & Daily Quests** 📅
**Why now:** Teaches players about enemy stats to prepare them for the Element system, while establishing daily retention loops.

**Features to Add:**
- **Bestiary Book:** Tracks monsters killed, reveals their HP/ATK.
- **Daily login rewards.**
- **Daily bounties:** "Kill 50 Goblins".

---

### **⏳ Commit 6: Element, Race & Size System (The Awakening)** ⚡🐉
**Why now:** The player has high upgraded gear and basic cards, but hits Zone 4 (e.g., Volcano). Raw stats are no longer enough. The game introduces Rock-Paper-Scissors combat.

**Features to Add:**
- **Narrative Unlock:** NPC warns about Elemental monsters.
- **Element Wheel:** Fire beats Earth, Water beats Fire, etc.
- **Races:** Demon, Demi-Human, Undead, Plant.
- **Pre-Battle Prep:** UI pauses to allow gear swapping before entering a zone.
- **Advanced Combat Math:** Hitting weakness does 150%-200% damage.

---

### **⏳ Commit 7: Advanced Card System** 🎴
**Features to Add:**
- Upgrades the Card System to utilize Elements/Races.
- e.g., Vadon Card (+20% vs Fire), Hydra Card (+20% vs Demi-Human).
- This creates massive build diversity and horizontal progression.

---

### **⏳ Commit 8: Pet/Companion System** 🐾
**Features to Add:**
- Capture low-HP enemies with taming items.
- Pets auto-attack and give passive bonuses (e.g., +10% Gold drop).
- Hunger and loyalty meters.

---

### **⏳ Commit 9: MVP World Bosses** 👑
**Features to Add:**
- Rare boss spawns with massive HP pools.
- Summon "Mob Slaves" (minions).
- Drop MVP Cards with game-breaking unique effects.

---

### **⏳ Commit 10: Prestige/Rebirth System** ♻️
**Features to Add:**
- Reach Level 99 -> Rebirth to Level 1.
- Keep Gear/Cards, gain permanent stat multipliers.
- Unlock Transcendent titles and auras.

---

### **⏳ Commit 11: Party/Guild Simulation** 👥
**Features to Add:**
- Hire NPC mercenaries (e.g., a Priest to heal you, a Knight to tank).
- Pay them gold per minute.
- Simulates the MMO feeling in a single-player environment.

---

## 📝 Current Implementation Status

### ✅ Completed Features
- Basic combat system, auto-attack, Jobs (Novice -> 1st/2nd Jobs)
- Skill trees, Equipment, Zone progression
- HP/MP potions, Town healing
- **Loot explosion visual effects**
- **Achievement system & Title tracking**

### 🔄 Currently Implementing
- Equipment Enhancement System (Commit 3)

### ⏳ Next Up
- Basic Card System (Commit 4)
