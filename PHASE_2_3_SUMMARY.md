# Phase 2 & 3 Implementation Summary

## Phase 2: Weapon Passive Bonuses

### Overview
Each weapon type now provides unique passive bonuses that encourage different playstyles and enable cross-class experimentation.

### Weapon Passives Implemented

#### Sword
- **ASPD Bonus:** +10% attack speed
- **Philosophy:** Balanced weapon for sustained DPS
- **Best For:** Knights, Swordsmen

#### Bow
- **Crit Bonus:** +5% base critical chance
- **ASPD Penalty:** -15% attack speed (slower but deadlier)
- **Accuracy Bonus:** +10% hit rate
- **Philosophy:** High-damage precision weapon
- **Best For:** Archers, Hunters

#### Wand
- **Penetration:** 15% enemy MDEF bypass
- **Philosophy:** Overcome magic resistance
- **Best For:** Mages, Wizards

### Cross-Class Weapon System

#### Penalty Mechanics
- **Optimal Weapon:** 100% damage (no penalty)
- **Cross-Class Weapon:** 75% damage (25% penalty)
- **Wrong Class (Mage with non-wand):** 0% damage (enforced restriction)

#### Examples
- **DEX Knight with Bow:** Takes 25% damage penalty but gains +5% crit and +10% accuracy
- **AGI Archer with Sword:** Takes 25% damage penalty but gains +10% ASPD
- **Mage with Bow/Sword:** Cannot equip (enforced)

### Testing Goals
✅ Do players experiment with hybrid builds?
- Knights can try DEX + Bow for ranged crit builds
- Archers can use Sword for faster (but weaker) attacks
- Penalty is noticeable but not prohibitive

---

## Phase 3: MDEF (Magic Defense) System

### Overview
Added a separate defense stat for magic attacks, calculated from INT and VIT.

### Soft MDEF Formula
```typescript
softMdef = INT + floor(VIT / 2)
```

### Defense Stat Breakdown

#### Physical Defense
- **Soft DEF:** VIT-based (flat reduction)
- **Hard DEF %:** Equipment-based (percentage reduction)

#### Magic Defense
- **Soft MDEF:** INT + VIT/2 (flat reduction)
- **Hard MDEF %:** Currently mirrors Hard DEF % (simplified)

### Enemy Magic Attacks
- **30% of enemy attacks** are now classified as "magic attacks"
- Magic attacks use **Soft MDEF** instead of Soft DEF
- Hard MDEF % applies similarly to Hard DEF %

### Wand Penetration Interaction
- Wands reduce enemy MDEF effectiveness by **15%**
- Example: Enemy has 20% Hard MDEF → Wand reduces it to 5% effective MDEF

### Testing Goals
✅ Are magic-using enemies beatable without being trivial?
- INT-based characters (Mages/Wizards) naturally have higher MDEF
- VIT provides secondary magic protection
- Non-INT classes are more vulnerable to magic but not helpless
- Balanced to avoid magic immunity while keeping it meaningful

---

## Implementation Details

### Files Modified

1. **src/logic/character.ts**
   - Added `WeaponPassives` interface
   - Created `getWeaponPassives()` function
   - Created `getWeaponClassPenalty()` function
   - Updated `calcPlayerAtk()` to return passives and penalty
   - Updated `calcPlayerMagicAtk()` to return passives
   - Updated `calcPlayerDef()` to include `softMdef`
   - Updated `calcCritChance()` to accept weapon crit bonus
   - Updated `calcASPD()` to accept weapon ASPD modifier

2. **src/logic/combat.ts**
   - Updated `calculateDamage()` to apply weapon passives
   - Applied cross-class penalty to both normal and critical hits
   - Applied wand penetration to magic damage
   - Created `calculateEnemyDamage()` with magic attack support

3. **src/hooks/useGameState.ts**
   - Updated ASPD calculation to use weapon passives
   - Integrated weapon ASPD modifier into attack speed

### Key Design Decisions

#### Why 25% Penalty?
- Noticeable enough to matter
- Not so harsh that it kills hybrid builds
- Allows experimentation without crippling characters

#### Why INT + VIT/2 for MDEF?
- INT is primary (mages are naturally magic-resistant)
- VIT provides universal protection (secondary)
- Simple formula, easy to understand

#### Why 30% Magic Attack Rate?
- Keeps magic defense relevant
- Not so common that physical defense becomes useless
- Adds variety to enemy damage types

---

## Testing Recommendations

### Phase 2 Testing
1. **Create a DEX Knight**
   - Equip a Bow
   - Check if crit rate increases
   - Check if ASPD decreases
   - Verify 25% damage penalty

2. **Create an AGI Archer**
   - Equip a Sword
   - Check if ASPD increases
   - Verify 25% damage penalty

3. **Try to equip non-wand on Mage**
   - Should be blocked with error message

### Phase 3 Testing
1. **Create a Mage/Wizard**
   - Check Soft MDEF stat
   - Verify INT contributes directly
   - Verify VIT contributes at half rate

2. **Fight enemies with magic attacks**
   - Some enemy attacks should deal less damage (magic-based)
   - Physical classes should take more magic damage than Mages

3. **Test Wand Penetration**
   - Equip a wand
   - Verify magic damage increases against high-MDEF enemies

---

## Future Enhancements

### Phase 2 Extensions
- Add more weapon types (Staff, Dagger, Spear)
- Each with unique passives
- More granular cross-class penalties

### Phase 3 Extensions
- Hard MDEF % from equipment (robes, magic shields)
- Elemental resistance system (fire, ice, lightning)
- Enemy-specific MDEF stats (not just mirrored DEF)
- Skills that bypass MDEF (like crits bypass DEF)

---

## Commit History

1. `feat: Phase 2 - weapon passives & cross-class penalties + Phase 3 - MDEF`
   - Updated character.ts with weapon passives and MDEF

2. `feat: integrate weapon passives, cross-class penalty, and MDEF`
   - Updated combat.ts to apply new mechanics

3. `feat: integrate weapon ASPD modifier into attack speed`
   - Updated useGameState.ts to use weapon ASPD passives

---

## Summary

**Phase 2** introduces weapon diversity through passive bonuses and enables cross-class experimentation with a balanced penalty system.

**Phase 3** adds a separate magic defense layer to create strategic depth in character building and combat encounters.

Both phases work together to:
- Encourage build diversity
- Add meaningful stat choices (INT for MDEF, DEX for ranged builds)
- Keep combat engaging with varied damage types
- Allow experimentation without being overly punishing