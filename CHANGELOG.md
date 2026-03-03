# Changelog

## 2026-02-28 - Job Change & Skill System Improvements

### ✅ Fixed Issues

#### 1. Low Damage After Job Change
**Problem:** After changing jobs (e.g., Novice → Swordsman), skills only dealt 1 damage.

**Root Cause:**
- Character reset to level 1 with all stats = 1
- Base attack was only ~4 points
- Enemy defense subtracted most damage
- Result: 1 damage × skill multiplier = 1 damage

**Solution Implemented (Option 2):**
- Reset to level 1 BUT with **15 stat points** instead of 5
- This allows immediate stat distribution for viable damage
- Example: 10 STR → ~35 ATK → Bash deals ~50 damage (instead of 1!)
- Maintains RO authenticity while being playable

#### 2. MP Cost Balance
**Problem:** Skills cost too much MP relative to total MP pool
- Level 1 character: ~40-50 MP total
- Skills costing 15-20 MP = only 2-3 casts before empty
- Very frustrating for continuous gameplay

**Solution:**
Rebalanced all skill MP costs:

| Job | Skill | Old MP (Lv1) | New MP (Lv1) | Change |
|-----|-------|--------------|--------------|--------|
| Novice | Basic Attack | 2 | 2 | - |
| Swordsman | Bash | 9 | 6-7 | -25% |
| Swordsman | Magnum Break | 17 | 12-13 | -29% |
| Mage | Fire Bolt | 12 | 8-9 | -29% |
| Mage | Cold Bolt | 14 | 9-10 | -32% |
| Mage | Lightning Bolt | 16 | 10-11 | -34% |
| Archer | Double Strafe | 11 | 7-8 | -31% |
| Archer | Arrow Shower | 17 | 13-14 | -24% |
| Knight | Bowling Bash | 22 | 15-16 | -30% |
| Wizard | Storm Gust | 45 | 30-32 | -31% |
| Wizard | Meteor Storm | 50 | 35-37 | -29% |
| Hunter | Blitz Beat | 18 | 12-14 | -28% |
| Hunter | Claymore Trap | 22 | 15-17 | -27% |

**Design Philosophy:**
- Basic skills: 6-10 MP (spam-friendly, 5-6 casts with 50 MP)
- AoE skills: 12-15 MP (situational, 3-4 casts)
- Ultimate skills: 30-35 MP (powerful finishers)

#### 3. Basic Attack Always Available
**Problem:** Basic_attack might not be available after job change

**Solution:**
- Added `basic_attack` to ALL job skill databases
- Job change now preserves `basic_attack: 1` in learned skills
- Players always have a low-MP fallback attack option

### 🎮 New Features

#### Auto-Attack Skill Selection
**Feature:** Players can now choose which skill to use for auto-attack

**How it works:**
1. Open Skill Window
2. Any learned skill shows "Set Auto" button
3. Click to set that skill as auto-attack
4. Current auto-attack skill shows "⭐ Auto" badge
5. Auto-attack timer uses selected skill

**Benefits:**
- Choose between high-damage (high MP) vs low-cost skills
- Adapt strategy based on situation
- Example: Use basic_attack when low on MP, switch to Bash when full

**UI Design:**
```
📖 Skill Window
─────────────────────────────
[✓] Bash Lv.5          [Learn] [★ Auto]  ← Current auto-attack
    MP: 7 | CD: 1s
    Single target heavy strike
    
[✓] Magnum Break Lv.3  [Learn] [Set Auto] ← Can be set
    MP: 15 | CD: 3s
    AoE fire attack
    
[✓] Basic Attack Lv.1  [MAX]   [Set Auto] ← Always available
    MP: 2 | CD: 0s
    Basic attack
```

### 📋 Implementation Details

#### Files Modified:

1. **src/data/skills.ts**
   - Added `basic_attack` to all job classes (Swordsman, Mage, Archer, Knight, Wizard, Hunter)
   - Rebalanced all MP costs using formulas like `6 + Math.floor(lv * 0.5)`

2. **src/types/character.ts**
   - Added `autoAttackSkillId: string` field to Character interface

3. **src/hooks/useGameState.ts**
   - Modified `handleJobChange()`: Now gives 15 base stat points instead of 5
   - Modified `handleJobChange()`: Always includes `basic_attack: 1` in initial skills
   - Modified `handleJobChange()`: Sets first job skill as auto-attack
   - Added `setAutoAttackSkill()` function for UI callback
   - Modified `battleAction()`: Uses `char.autoAttackSkillId` for auto-attack

4. **src/components/SkillWindow.tsx**
   - Already had auto-attack selection UI implemented
   - Shows "⭐ Auto" badge for current auto-attack skill
   - "Set Auto" button for learned skills

### 🎯 Testing Recommendations

#### Test Case 1: Job Change with 15 Stat Points
1. Start as Novice
2. Level up to Job Level 10
3. Change to Swordsman
4. ✅ Should have ~20 stat points (15 base + leveling points)
5. ✅ Distribute to STR and test Bash damage
6. ✅ Should deal 30-50+ damage (not 1!)

#### Test Case 2: MP Cost Sustainability
1. Create new Swordsman (level 1)
2. ✅ Should have ~40-50 MP
3. ✅ Bash costs 6-7 MP (can cast 6-7 times)
4. ✅ Magnum Break costs 12-13 MP (can cast 3-4 times)
5. ✅ Basic Attack costs 2 MP (always available)

#### Test Case 3: Auto-Attack Selection
1. Learn multiple skills
2. Open Skill Window
3. ✅ Current auto-attack shows "⭐ Auto"
4. Click "Set Auto" on different skill
5. ✅ Auto-attack changes, log shows confirmation
6. ✅ Auto-attack timer uses new skill

#### Test Case 4: Basic Attack Always Available
1. Change jobs multiple times
2. ✅ Basic_attack always appears in skill list
3. ✅ Can set basic_attack as auto-attack
4. ✅ Works in combat

### 📊 Balance Impact

**Before Changes:**
- Job change → 1 damage → frustrating
- Skills → out of MP in 3 casts → frustrating
- No choice in auto-attack → limiting

**After Changes:**
- Job change → 30-50+ damage → playable
- Skills → 5-7 casts → sustainable
- Auto-attack selection → strategic depth

### 🔜 Next Steps

**Recommended future improvements:**
1. Add skill damage preview in Skill Window (e.g., "Expected: ~56 damage")
2. Show job bonuses more prominently in job change UI
3. Add skill hotkeys (F1-F8) for quick skill switching
4. Tutorial popup explaining auto-attack selection feature
5. Save auto-attack preference per job class

### 🎮 Game Design Notes

**Why Option 2 (15 stat points)?**
- Maintains RO authenticity (reset to level 1)
- But provides enough points for immediate viability
- Encourages strategic stat distribution
- Balances challenge with playability

**Why rebalance MP costs?**
- Original costs designed for higher-level characters
- Level 1 job change characters need lower costs
- Scales better with progression
- Maintains skill power fantasy while being sustainable

**Why auto-attack selection?**
- Adds player agency
- Strategic depth (MP management)
- RO-like gameplay (manual skill selection)
- Quality of life improvement

---

## Commit History

1. `feat: Add basic_attack to all job classes for consistent availability`
2. `fix: Job change improvements - 15 stat points, basic_attack always available, proper skill initialization`
3. `docs: Add changelog for job change and skill system improvements`
