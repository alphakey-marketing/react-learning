# Balance Fix Implementation Guide

## Quick Fix Implementation

This guide shows how to implement the starting equipment and potion fixes to make Zone 1 playable.

## Step 1: Update useGameState.ts Initialization

### Import the Starting Equipment System

Add to imports at the top of `src/hooks/useGameState.ts`:

```typescript
import { 
  getStartingEquipment, 
  STARTING_RESOURCES 
} from "../data/startingEquipment";
```

### Update Initial Equipment State

Find this line in `useGameState.ts`:
```typescript
const [equipped, setEquipped] = useState<EquippedItems>({
  weapon: null,
  armor: null,
  head: null,
  garment: null,
  footgear: null,
  accessory1: null,
  accessory2: null,
});
```

Replace with:
```typescript
const [equipped, setEquipped] = useState<EquippedItems>(() => {
  const startingItems = getStartingEquipment();
  return {
    weapon: startingItems.find(item => item.type === 'weapon') || null,
    armor: startingItems.find(item => item.type === 'armor') || null,
    head: null,
    garment: null,
    footgear: startingItems.find(item => item.type === 'footgear') || null,
    accessory1: null,
    accessory2: null,
  };
});
```

### Update Initial Character State

Find these lines:
```typescript
const [char, setChar] = useState<Character>({
  // ... other properties
  gold: 0,
  // ...
});

const [hpPotions, setHpPotions] = useState<number>(1);
const [mpPotions, setMpPotions] = useState<number>(1);
```

Replace with:
```typescript
const [char, setChar] = useState<Character>({
  // ... other properties
  gold: STARTING_RESOURCES.gold, // Now 100 instead of 0
  // ...
});

const [hpPotions, setHpPotions] = useState<number>(STARTING_RESOURCES.hpPotions); // Now 5 instead of 1
const [mpPotions, setMpPotions] = useState<number>(STARTING_RESOURCES.mpPotions); // Now 3 instead of 1
```

## Step 2: Add Welcome Message (Optional)

In `MiniLevelGame.tsx`, add a useEffect to show starting equipment message:

```typescript
import { STARTING_EQUIPMENT_TUTORIAL } from "./data/startingEquipment";

// Inside MiniLevelGame component, after const game = useGameState(...):

useEffect(() => {
  // Show starting equipment tutorial on first load
  const hasSeenWelcome = localStorage.getItem("hasSeenStartingEquipment");
  if (!hasSeenWelcome) {
    // Show messages with delay for better UX
    setTimeout(() => {
      STARTING_EQUIPMENT_TUTORIAL.messages.forEach((msg, index) => {
        setTimeout(() => addLog(msg), index * 500);
      });
      localStorage.setItem("hasSeenStartingEquipment", "true");
    }, 1000);
  }
}, []);
```

## Step 3: Add Zone 1 Warning System

Create `src/components/StatWarning.tsx`:

```typescript
import { Character } from "../types/character";

interface StatWarningProps {
  character: Character;
  currentZoneId: number;
  onClose: () => void;
}

export function StatWarning({ character, currentZoneId, onClose }: StatWarningProps) {
  // Only show if player has unspent points and trying to enter Zone 1
  if (currentZoneId !== 0 || character.statPoints === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      border: "3px solid #fbbf24",
      borderRadius: "12px",
      padding: "20px",
      maxWidth: "400px",
      color: "white",
      boxShadow: "0 8px 32px rgba(245, 158, 11, 0.4)",
      zIndex: 1000,
    }}>
      <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚠️</div>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
        You have {character.statPoints} unspent stat points!
      </h3>
      <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
        Zone 1 enemies are dangerous! We recommend investing your stat points before leaving town.
      </p>
      <p style={{ margin: "0 0 15px 0", fontSize: "14px", fontWeight: "bold" }}>
        💡 Beginner tip: Try 8 STR, 2 AGI, 2 VIT
      </p>
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "10px",
          background: "rgba(255, 255, 255, 0.2)",
          border: "2px solid white",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        I understand
      </button>
    </div>
  );
}
```

## Expected Results After Implementation

### Before Fix
- **Starting ATK**: 1 (bare hands)
- **Starting DEF**: 0
- **Starting HP Potions**: 1
- **Starting Gold**: 0
- **Poring fight**: 51 seconds, 102 damage taken → DEATH ☠️

### After Fix
- **Starting ATK**: 9-10 (with Training Knife)
- **Starting DEF**: 7 (Cotton Shirt + Slippers)
- **Starting HP Potions**: 5
- **Starting Gold**: 100
- **Poring fight**: ~5 seconds, ~15 damage taken → WIN ✅

### Combat Simulation with Starting Equipment

```
Player Stats:
- ATK: 1 (base) + 8 (weapon) = 9-10 total
- DEF: 7 (5 armor + 2 footgear)
- HP: 75 (no VIT investment yet)
- ASPD: 0.69 attacks/sec

VS Poring:
- Player deals: 9 - 1 (Poring DEF) = 8 damage per hit
- Poring dies in: 35 HP / 8 = 5 hits (~7 seconds)
- Poring deals: 5 - 7 = 1 damage per hit (minimum)
- Total damage taken: ~3-4 damage
- Result: EASY WIN with 71+ HP remaining ✅
```

## Testing Checklist

- [ ] New character starts with Training Knife equipped
- [ ] New character starts with Cotton Shirt equipped  
- [ ] New character starts with Novice Slippers equipped
- [ ] New character starts with 5 HP potions
- [ ] New character starts with 3 MP potions
- [ ] New character starts with 100 gold
- [ ] Can defeat Poring without dying
- [ ] Can defeat Fabre without dying
- [ ] Warning appears when leaving town with unspent stats
- [ ] Tutorial messages appear on first game load

## Alternative: Zone 1 Enemy Nerf (If Equipment Fix Not Preferred)

If you prefer not to give starting equipment, reduce Zone 1 enemies by 40%:

In `src/data/zones.ts`, update Zone 1 enemies:

```typescript
{
  id: 1,
  name: "Beginner Plains",
  minLevel: 1,
  enemies: [
    createEnemy("Poring", 1, 3, 0, 25, 0.3, 0),    // was: 5 ATK, 1 DEF, 35 HP
    createEnemy("Lunatic", 2, 4, 1, 28, 0.35, 0),  // was: 7 ATK, 2 DEF, 40 HP
    createEnemy("Fabre", 2, 4, 1, 26, 0.3, 0),     // was: 6 ATK, 3 DEF, 38 HP
    createEnemy("Willow", 3, 6, 2, 34, 0.4, 0),    // was: 9 ATK, 3 DEF, 48 HP
  ],
},
```

This makes Zone 1 survivable even without equipment, but the experience is still very difficult.

## Recommendation

**Use both fixes together**:
1. Starting equipment (Training Knife + Cotton Shirt + Slippers)
2. Starting resources (5 HP potions, 3 MP potions, 100 gold)
3. Warning system for unspent stat points

This provides the best new player experience while maintaining challenge and progression.
