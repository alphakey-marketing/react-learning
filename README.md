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

## 📋 Code Refactoring Plan

### Current Structure Issues

The current codebase has a monolithic structure with `MiniLevelGame.tsx` containing approximately 1,350 lines of code. Everything exists in a single file including:
- Type definitions
- Game logic
- Data definitions  
- UI components
- State management

This makes it difficult to maintain, test, and scale the application.

### Recommended File Organization

Below is a comprehensive plan to reorganize the codebase into modular, maintainable components.

---

## 📁 Directory Structure

```
src/
├── types/
│   ├── character.ts      # Character, stats, job interfaces
│   ├── enemy.ts          # Enemy and zone interfaces
│   ├── skill.ts          # Skill interface and types
│   ├── equipment.ts      # Equipment and inventory types
│   └── game.ts           # Log and general game types
│
├── data/
│   ├── skills.ts         # SKILLS_DB definitions
│   ├── zones.ts          # ZONES array with map data
│   └── constants.ts      # Game constants (CRIT_MULTIPLIER, etc.)
│
├── logic/
│   ├── combat.ts         # Combat calculations
│   ├── character.ts      # Character stat calculations
│   ├── experience.ts     # Level up logic
│   └── loot.ts           # Item drop and generation
│
├── components/
│   ├── CharacterStats.tsx    # Player stats display
│   ├── EnemyDisplay.tsx      # Enemy info and health bar
│   ├── BattleLog.tsx         # Combat log display
│   ├── SkillWindow.tsx       # Skill tree interface
│   ├── SkillHotkeys.tsx      # Skill quick-use buttons
│   ├── Inventory.tsx         # Inventory management
│   ├── Shop.tsx              # Shop and potion system
│   ├── MapSystem.tsx         # Zone navigation
│   └── BossChallenge.tsx     # Boss fight UI
│
├── hooks/
│   ├── useCharacter.ts       # Character state management
│   ├── useCombat.ts          # Combat system logic
│   ├── useSkills.ts          # Skill system and cooldowns
│   ├── useInventory.ts       # Inventory management
│   └── useBattleLog.ts       # Log management with auto-scroll
│
├── App.tsx
├── MiniLevelGame.tsx         # Main game container (refactored)
└── index.tsx
```

---

## 🔧 Implementation Details

### 1. Type Definitions (`src/types/`)

**`types/character.ts`**
```typescript
export type JobClass = "Novice" | "Swordsman" | "Mage" | "Archer";

export interface Stats {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
}

export interface Character {
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  stats: Stats;
  statPoints: number;
  jobClass: JobClass;
  jobLevel: number;
  jobExp: number;
  jobExpToNext: number;
  skillPoints: number;
  learnedSkills: Record<string, number>;
}
```

**`types/skill.ts`**
```typescript
export interface Skill {
  id: string;
  name: string;
  nameZh: string;
  maxLevel: number;
  mpCost: (level: number) => number;
  description: string;
  damageMultiplier: (level: number) => number;
  cooldown: number;
  effect?: "stun" | "dot" | "heal" | "buff";
}
```

**`types/enemy.ts`**
```typescript
export interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
}

export interface Zone {
  id: number;
  name: string;
  minLevel: number;
  enemies: Enemy[];
}
```

**`types/equipment.ts`**
```typescript
export interface Equipment {
  id: number;
  name: string;
  type: "weapon" | "armor";
  stat: number;
  rarity: "common" | "rare" | "epic";
}

export interface EquippedItems {
  weapon: Equipment | null;
  armor: Equipment | null;
}
```

**`types/game.ts`**
```typescript
export interface Log {
  id: number;
  text: string;
}
```

---

### 2. Game Data (`src/data/`)

**`data/constants.ts`**
```typescript
export const CRIT_MULTIPLIER = 1.5;
export const HP_POTION_COST = 50;
export const MP_POTION_COST = 50;
export const HP_POTION_HEAL_PERCENT = 0.5;
export const MP_POTION_RECOVER_PERCENT = 0.5;
export const BASE_STAT_POINTS_PER_LEVEL = 3;
export const BASE_SKILL_POINTS_PER_JOB_LEVEL = 1;
```

**`data/skills.ts`**
```typescript
import { Skill } from '../types/skill';
import { JobClass } from '../types/character';

export const SKILLS_DB: Record<JobClass, Skill[]> = {
  Novice: [
    {
      id: "basic_attack",
      name: "Basic Attack",
      nameZh: "普通攻擊",
      maxLevel: 1,
      mpCost: () => 2,
      description: "基本攻擊",
      damageMultiplier: () => 1.0,
      cooldown: 0,
    },
  ],
  Swordsman: [
    // ... Swordsman skills
  ],
  Mage: [
    // ... Mage skills
  ],
  Archer: [
    // ... Archer skills
  ],
};
```

**`data/zones.ts`**
```typescript
import { Zone } from '../types/enemy';

export const ZONES: Zone[] = [
  {
    id: 1,
    name: "🌱 新手草原",
    minLevel: 1,
    enemies: [
      { name: "Slime", level: 1, hp: 30, maxHp: 30, atk: 5, def: 2 },
      { name: "Goblin", level: 2, hp: 50, maxHp: 50, atk: 8, def: 4 },
    ],
  },
  // ... more zones
];
```

---

### 3. Game Logic (`src/logic/`)

**`logic/character.ts`**
```typescript
import { Character } from '../types/character';

export function calcPlayerAtk(char: Character, weaponBonus: number): number {
  const { str, dex, luk } = char.stats;
  const base = str * 2 + Math.floor(dex * 0.5) + Math.floor(luk * 0.3);
  return base + weaponBonus + char.level;
}

export function calcPlayerMagicAtk(char: Character): number {
  const { int, dex } = char.stats;
  return int * 3 + Math.floor(dex * 0.3) + char.level;
}

export function calcPlayerDef(char: Character, armorBonus: number): number {
  const { vit, agi } = char.stats;
  const softDef = vit * 1.5 + agi * 0.5;
  return softDef + armorBonus;
}

export function calcCritChance(char: Character): number {
  const { luk } = char.stats;
  return Math.min(50, Math.floor(luk / 3));
}
```

**`logic/combat.ts`**
```typescript
import { Character } from '../types/character';
import { Enemy } from '../types/enemy';
import { Skill } from '../types/skill';
import { CRIT_MULTIPLIER } from '../data/constants';
import { calcPlayerAtk, calcPlayerMagicAtk, calcCritChance } from './character';

export interface CombatResult {
  damage: number;
  isCrit: boolean;
  enemyDefeated: boolean;
  playerHpLost: number;
}

export function calculateSkillDamage(
  char: Character,
  enemy: Enemy,
  skill: Skill,
  skillLevel: number,
  weaponBonus: number
): CombatResult {
  // Combat calculation logic
  // Returns structured combat result
}
```

**`logic/experience.ts`**
```typescript
import { Character } from '../types/character';

export interface LevelUpResult {
  didLevelUp: boolean;
  newLevel: number;
  statPointsGained: number;
}

export function processExpGain(
  char: Character,
  expGain: number
): LevelUpResult {
  // Level up calculation logic
}

export function processJobExpGain(
  char: Character,
  jobExpGain: number
): { didJobLevelUp: boolean; newJobLevel: number; skillPointsGained: number } {
  // Job level calculation logic
}
```

**`logic/loot.ts`**
```typescript
import { Equipment } from '../types/equipment';

export function generateLoot(
  playerLevel: number,
  isBossDrop: boolean = false
): Equipment | null {
  // Loot generation logic
}

export function calculateSellPrice(item: Equipment): number {
  return item.stat * 2;
}
```

---

### 4. UI Components (`src/components/`)

**`components/CharacterStats.tsx`**
```typescript
import React from 'react';
import { Character } from '../types/character';

interface CharacterStatsProps {
  character: Character;
  onAddStat: (statName: keyof Character['stats']) => void;
}

export function CharacterStats({ character, onAddStat }: CharacterStatsProps) {
  const expProgress = Math.floor((character.exp / character.expToNext) * 100);
  const hpPercent = Math.floor((character.hp / character.maxHp) * 100);
  const mpPercent = Math.floor((character.mp / character.maxMp) * 100);
  const jobExpPercent = Math.floor((character.jobExp / character.jobExpToNext) * 100);

  return (
    <div style={containerStyles}>
      {/* Character stats UI */}
    </div>
  );
}
```

**`components/SkillWindow.tsx`**
```typescript
import React from 'react';
import { Character } from '../types/character';
import { Skill } from '../types/skill';

interface SkillWindowProps {
  character: Character;
  availableSkills: Skill[];
  onLearnSkill: (skillId: string) => void;
  onClose: () => void;
}

export function SkillWindow({ 
  character, 
  availableSkills, 
  onLearnSkill, 
  onClose 
}: SkillWindowProps) {
  return (
    <div style={windowStyles}>
      {/* Skill tree UI */}
    </div>
  );
}
```

**`components/BattleLog.tsx`**
```typescript
import React, { useRef, useEffect } from 'react';
import { Log } from '../types/game';

interface BattleLogProps {
  logs: Log[];
}

export function BattleLog({ logs }: BattleLogProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    
    if (isNearBottom) {
      logsEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [logs]);

  return (
    <div ref={containerRef} style={logContainerStyles}>
      {logs.map((log) => (
        <div key={log.id} style={logEntryStyles}>
          {log.text}
        </div>
      ))}
      <div ref={logsEndRef} />
    </div>
  );
}
```

---

### 5. Custom Hooks (`src/hooks/`)

**`hooks/useCharacter.ts`**
```typescript
import { useState } from 'react';
import { Character } from '../types/character';

export function useCharacter() {
  const [character, setCharacter] = useState<Character>({
    // Initial character state
  });

  const addStatPoint = (statName: keyof Character['stats']) => {
    if (character.statPoints <= 0) return;
    
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: prev.stats[statName] + 1
      },
      statPoints: prev.statPoints - 1
    }));
  };

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  return {
    character,
    addStatPoint,
    updateCharacter,
    setCharacter
  };
}
```

**`hooks/useCombat.ts`**
```typescript
import { useState, useRef, useEffect } from 'react';
import { Enemy } from '../types/enemy';
import { Character } from '../types/character';

export function useCombat(character: Character) {
  const [enemy, setEnemy] = useState<Enemy>(/* initial enemy */);
  const [currentZoneId, setCurrentZoneId] = useState<number>(1);
  const [isBossFight, setIsBossFight] = useState<boolean>(false);

  const battleAction = (skillId?: string) => {
    // Combat logic
  };

  const travelToZone = (zoneId: number) => {
    // Zone travel logic
  };

  // Auto-attack effect
  useEffect(() => {
    const id = setInterval(() => {
      battleAction("basic_attack");
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return {
    enemy,
    currentZoneId,
    isBossFight,
    battleAction,
    travelToZone,
    setEnemy
  };
}
```

**`hooks/useSkills.ts`**
```typescript
import { useState } from 'react';
import { Character } from '../types/character';

export function useSkills(character: Character) {
  const [showSkillWindow, setShowSkillWindow] = useState<boolean>(false);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});

  const learnSkill = (skillId: string) => {
    // Skill learning logic
  };

  const isSkillOnCooldown = (skillId: string, cooldown: number): boolean => {
    const now = Date.now();
    const lastUsed = skillCooldowns[skillId] || 0;
    const timePassed = (now - lastUsed) / 1000;
    return timePassed < cooldown;
  };

  const setSkillCooldown = (skillId: string) => {
    setSkillCooldowns(prev => ({ ...prev, [skillId]: Date.now() }));
  };

  return {
    showSkillWindow,
    setShowSkillWindow,
    skillCooldowns,
    learnSkill,
    isSkillOnCooldown,
    setSkillCooldown
  };
}
```

**`hooks/useBattleLog.ts`**
```typescript
import { useState } from 'react';
import { Log } from '../types/game';

const MAX_LOGS = 50;

export function useBattleLog() {
  const [logs, setLogs] = useState<Log[]>([]);

  const addLog = (text: string) => {
    setLogs(prev => {
      const newLog = { id: Date.now() + Math.random(), text };
      const next = [...prev, newLog];
      if (next.length > MAX_LOGS) next.shift();
      return next;
    });
  };

  const clearLogs = () => setLogs([]);

  return {
    logs,
    addLog,
    clearLogs
  };
}
```

---

## 🎯 Benefits of This Structure

### Maintainability
Each file has a single responsibility, making it easier to locate and fix issues without affecting other parts of the code.

### Reusability
Components and hooks can be reused across different parts of your application or in future projects.

### Testing
Smaller, isolated functions are much easier to unit test than a large monolithic component.

### Collaboration
Multiple developers can work on different files simultaneously without merge conflicts.

### Performance
React can better optimize rendering when components are properly separated, as only affected components will re-render.

### Scalability
Adding new features becomes straightforward:
- New skills → `data/skills.ts`
- New zones → `data/zones.ts`
- New UI elements → Create new component file

---

## 🚀 Migration Steps

1. **Create Directory Structure** - Set up all folders as outlined above
2. **Extract Types** - Move all interfaces to `types/` directory
3. **Extract Data** - Move SKILLS_DB and ZONES to `data/` directory
4. **Extract Logic** - Move calculation functions to `logic/` directory
5. **Create Components** - Break down UI into separate component files
6. **Create Hooks** - Extract stateful logic into custom hooks
7. **Update Main Component** - Refactor MiniLevelGame.tsx to use new modules
8. **Test Thoroughly** - Ensure all functionality works after refactoring

---

## 📝 Example: Refactored Main Component

```typescript
// src/MiniLevelGame.tsx
import { CharacterStats } from './components/CharacterStats';
import { EnemyDisplay } from './components/EnemyDisplay';
import { BattleLog } from './components/BattleLog';
import { SkillWindow } from './components/SkillWindow';
import { SkillHotkeys } from './components/SkillHotkeys';
import { Inventory } from './components/Inventory';
import { Shop } from './components/Shop';
import { MapSystem } from './components/MapSystem';

import { useCharacter } from './hooks/useCharacter';
import { useCombat } from './hooks/useCombat';
import { useSkills } from './hooks/useSkills';
import { useInventory } from './hooks/useInventory';
import { useBattleLog } from './hooks/useBattleLog';

export function MiniLevelGame() {
  const character = useCharacter();
  const combat = useCombat(character);
  const skills = useSkills(character);
  const inventory = useInventory();
  const battleLog = useBattleLog();

  return (
    <div style={containerStyles}>
      <div style={gameWindowStyles}>
        <h1 style={titleStyles}>⚔️ Mini RPG - RO Style</h1>
        
        <div style={mainLayoutStyles}>
          <div style={leftColumnStyles}>
            <CharacterStats 
              character={character.character} 
              onAddStat={character.addStatPoint} 
            />
            <EnemyDisplay enemy={combat.enemy} />
          </div>

          <div style={rightColumnStyles}>
            <MapSystem 
              currentZone={combat.currentZoneId} 
              onTravel={combat.travelToZone} 
            />
            <Inventory inventory={inventory} />
            <Shop 
              character={character.character} 
              inventory={inventory} 
            />
          </div>
        </div>

        {skills.showSkillWindow && (
          <SkillWindow 
            character={character.character}
            availableSkills={SKILLS_DB[character.character.jobClass]}
            onLearnSkill={skills.learnSkill}
            onClose={() => skills.setShowSkillWindow(false)}
          />
        )}

        <BattleLog logs={battleLog.logs} />
        <SkillHotkeys 
          skills={skills} 
          character={character.character}
          onUseSkill={combat.battleAction} 
        />
      </div>
    </div>
  );
}
```

---

## 🛠️ Development Tips

- **Start Small** - Refactor one section at a time (e.g., start with types)
- **Keep Tests** - Write tests for extracted functions to ensure behavior remains consistent
- **Use Git Branches** - Create a separate branch for refactoring work
- **Maintain Functionality** - Ensure the game works after each major refactoring step
- **Document Changes** - Update this README as you implement each section

---

## 📚 Additional Resources

- [React Component Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## 📞 Contributing

Feel free to open issues or submit pull requests to improve the codebase structure!
