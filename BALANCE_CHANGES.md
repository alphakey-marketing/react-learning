# Balance Changes - March 2026

## Overview
This document tracks major balance adjustments made to improve class viability and progression smoothness across all three job paths (Knight, Hunter, Wizard).

---

## Patch: Class Balance Update
**Date:** March 5, 2026  
**Branch:** `feature/crit-bypass-def`  
**Issue:** Wizard early-game survivability crisis, Hunter ASPD penalty too harsh, Physical classes hitting defense wall in endgame

---

## Changes

### 🧙 **Wizard (Class Buffs)**

**Problem:** Wizards had extremely low HP (0.7x multiplier) causing frequent deaths in Lv 10-25 zones, with no defensive bonuses to compensate.

**Changes:**
- **HP Multiplier:** `0.7x` → `0.85x` (+21% HP)
- **DEF Bonus:** `0` → `+2 DEF`

**Impact:**
- Level 20 Wizard with 15 VIT: **285 HP → 346 HP** (+61 HP)
- Survives 4-5 hits instead of 3 hits in Frozen Cavern zone
- +2 DEF reduces incoming physical damage by ~2-4 points per hit
- Early game (Lv 10-25) much more forgiving for new Wizard players
- Late game (Lv 30+) still relies on positioning and MP management

**Balance Rationale:**  
Wizards should be "glass cannons" with lower survivability than Knights, but not so fragile that they die before casting a single spell. The 0.85x multiplier keeps them squishier than Hunters (1.1x) and Knights (1.5x), maintaining class identity while removing frustrating early deaths.

---

### 🎯 **Hunter (Weapon Balance)**

**Problem:** Bow ASPD penalty (-15%) was too harsh, causing Hunters to feel sluggish despite high crit rate and DEX scaling.

**Changes:**
- **Bow ASPD Penalty:** `-15%` → `-10%`
- **Bow Penetration:** `0%` → `+5% physical DEF penetration`

**Impact:**
- Hunter with 50 AGI, 40 DEX: **1.02 attacks/sec → 1.08 attacks/sec** (+6% DPS)
- Endgame Zone 7-8 enemies (25-35% DEF): Effective DEF reduced to 20-30%
- Hunters now clear speed competitive with Knights in high-DEF zones
- Still slower than Knights (+10% ASPD) but compensated by higher crit rate

**Balance Rationale:**  
Bows should be slower than swords (tactical, precise) but not cripplingly slow. The -10% penalty maintains the "sniper" feel while keeping DPS viable. Physical penetration helps Hunters scale into endgame without hitting the DEF wall.

---

### ⚔️ **Knight (Weapon Balance)**

**Problem:** Swords had no defense penetration, causing Knights to lose 25-35% damage in endgame zones (Zone 7-8) while Wizards maintained effectiveness through wand penetration.

**Changes:**
- **Sword Penetration:** `0%` → `+10% physical DEF penetration`

**Impact:**
- Zone 8 enemies (35% DEF): Effective DEF reduced to 25%
- Knight damage loss: **-35%** → **-25%** (10% DPS increase vs high-DEF enemies)
- Maintains competitive clearing speed against Wizards in Void Dimension

**Balance Rationale:**  
Knights should excel at consistent, reliable physical damage. Without penetration, high-DEF enemies created an artificial difficulty wall. 10% penetration (vs Wizard's 15%) keeps physical classes viable while preserving magic's advantage against armored foes.

---

## Weapon Passive Summary (Post-Patch)

| Weapon | Crit Bonus | ASPD Mod | Penetration | Accuracy |
|--------|------------|----------|-------------|----------|
| **Sword** | 0% | +10% | **+10% DEF** | 0% |
| **Bow** | +5% | **-10%** | **+5% DEF** | +10% |
| **Wand** | 0% | 0% | +15% MDEF | 0% |

---

## Job Bonus Summary (Post-Patch)

| Job Class | HP Mult | MP Mult | ATK Bonus | DEF Bonus |
|-----------|---------|---------|-----------|----------|
| Novice | 1.0x | 1.0x | 0 | 0 |
| Swordsman | 1.3x | 0.9x | +5 | +3 |
| Mage | 0.8x | 1.5x | 0 | 0 |
| Archer | 1.0x | 1.0x | +3 | +1 |
| **Knight** | 1.5x | 0.9x | +10 | +5 |
| **Wizard** | **0.85x** | 2.0x | 0 | **+2** |
| **Hunter** | 1.1x | 1.1x | +8 | +2 |

---

## Expected Progression Impact

### Early Game (Lv 1-15)
- **Knight:** Still easiest (high HP + DEF)
- **Hunter:** Slightly easier (improved ASPD)
- **Wizard:** Now playable (21% more HP + 2 DEF prevents instant deaths)

### Mid Game (Lv 15-25)
- **Knight:** Strong and steady
- **Hunter:** Competitive clear speed with improved ASPD
- **Wizard:** No longer dies instantly, can focus on MP management

### Late Game (Lv 25-38)
- **Knight:** Excellent with penetration preventing DEF wall
- **Hunter:** Strong with crit scaling + penetration
- **Wizard:** Dominant AOE damage, manageable survivability with proper gear

---

## Testing Notes

### Zones to Test:
1. **Zone 3 (Mountain Path, Lv 10)** - Wizard job change survival
2. **Zone 5 (Frozen Cavern, Lv 20)** - Wizard HP buff effectiveness
3. **Zone 6 (Volcanic Depths, Lv 25)** - Hunter ASPD improvement
4. **Zone 7-8 (Castle/Void, Lv 30-38)** - Physical penetration impact

### Metrics to Monitor:
- Wizard death rate in Zones 3-5 (should decrease by ~30-40%)
- Hunter clear time vs Knight (should be within 10-15%)
- Knight damage vs Zone 8 bosses (should match Wizard within 20%)

---

## Rollback Plan

If changes prove too strong/weak:

**Wizard too tanky:**
- Reduce HP multiplier to 0.80x (middle ground)
- Keep +2 DEF bonus

**Hunter too fast:**
- Increase bow ASPD penalty to -12%
- Keep +5% penetration

**Physical penetration too strong:**
- Reduce sword penetration to 8%
- Reduce bow penetration to 3%

---

## Related Files

- `src/data/jobs.ts` - Job stat bonuses
- `src/logic/character.ts` - Weapon passives and ASPD calculation
- `src/logic/combat.ts` - Damage calculation with penetration

---

## Credits

**Analysis:** Perplexity AI (difficulty analysis across 8 zones, 3 classes)  
**Implementation:** Balance team  
**Testing:** QA team (pending)
