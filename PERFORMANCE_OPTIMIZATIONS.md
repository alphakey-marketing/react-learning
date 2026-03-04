# Performance & Stability Optimizations

## Completed Optimizations

### 1. **Battle Log Memory Management** ✅
- **Issue**: Unbounded log array growth causing memory leaks
- **Fix**: Limited to 100 most recent entries
- **Impact**: Prevents memory issues during long play sessions
- **File**: `src/hooks/useBattleLog.ts`

## Recommended Optimizations

### 2. **Attack Cooldown Calculation**
**Current Issue**: 50ms interval runs continuously even when not needed
```typescript
// Current: Runs every 50ms
const interval = setInterval(() => {
  const now = Date.now();
  const timePassed = now - lastAttackTime;
  // ... calculation
}, 50);
```

**Recommendation**: Use requestAnimationFrame for smoother updates
```typescript
let animationFrameId: number;
const updateCooldown = () => {
  const now = Date.now();
  const timePassed = now - lastAttackTime;
  if (timePassed >= attackDelayMs) {
    setCanAttack(true);
    setAttackCooldownPercent(100);
  } else {
    setAttackCooldownPercent(Math.floor((timePassed / attackDelayMs) * 100));
    animationFrameId = requestAnimationFrame(updateCooldown);
  }
};
animationFrameId = requestAnimationFrame(updateCooldown);
```

### 3. **Reduce useEffect Dependencies**
**Current Issue**: `battleActionRef` recreated on every state change
```typescript
useEffect(() => {
  battleActionRef.current = battleAction;
}, [char, enemy, equipped, currentZoneId, canAttack, skillCooldowns, killCount, isBossFight]);
```

**Impact**: High - causes unnecessary re-renders

**Recommendation**: The ref pattern is already correct, but the function itself should use refs more consistently to avoid this useEffect entirely.

### 4. **Town Healing Optimization**
**Current Issue**: Runs every 3 seconds regardless of zone
```typescript
useEffect(() => {
  const id = setInterval(() => {
    townHealingRef.current();
  }, 3000);
  return () => clearInterval(id);
}, []);
```

**Recommendation**: Only run when in town
```typescript
useEffect(() => {
  if (currentZoneId !== 0) return; // Not in town
  
  const id = setInterval(() => {
    townHealingRef.current();
  }, 3000);
  return () => clearInterval(id);
}, [currentZoneId]);
```

### 5. **Auto-Potion Optimization**
**Current Issue**: 1-second timer runs even when auto-potion is disabled

**Recommendation**: Add checks for auto-potion settings
```typescript
useEffect(() => {
  // Don't run timer if auto-potions are disabled
  if (autoHpPercent === 0 && autoMpPercent === 0) return;
  if (currentZoneId === 0) return;
  
  // ... existing timer code
}, [currentZoneId, autoHpPercent, autoMpPercent]);
```

### 6. **Memoize Expensive Calculations**
**Current**: Some calculations happen on every render

**Recommendations**:
```typescript
// Memoize skill lookup
const skillsMap = useMemo(() => 
  new Map(SKILLS_DB[char.jobClass].map(s => [s.id, s])),
  [char.jobClass]
);

// Memoize equipment calculations  
const equipStats = useMemo(() => 
  calculateEquipmentStats(equipped),
  [equipped]
);
```

### 7. **Component Memoization**
Add React.memo to frequently re-rendered components:
- `CharacterStats`
- `EnemyDisplay` 
- `SkillHotkeys`
- `BattleLog`

```typescript
export const CharacterStats = React.memo(function CharacterStats(props) {
  // ... component code
});
```

### 8. **Event Handler Optimization**
Use `useCallback` for event handlers passed to children:
```typescript
const handleAddStat = useCallback((stat: keyof CharacterStats) => {
  game.addStat(stat);
}, [game.addStat]);
```

### 9. **Lazy Loading for Modals**
Use React.lazy for modal components:
```typescript
const SkillWindow = lazy(() => import('./components/SkillWindow'));
const JobChangeNPC = lazy(() => import('./components/JobChangeNPC'));
const RefineNPC = lazy(() => import('./components/RefineNPC'));
```

### 10. **Debounce Frequent Updates**
For rapid state changes (like HP/MP updates), consider debouncing:
```typescript
import { debounce } from 'lodash';

const debouncedSetChar = useMemo(
  () => debounce(setChar, 50),
  []
);
```

## Performance Monitoring

### Add Performance Metrics
```typescript
// Track frame rate
let lastTime = performance.now();
let frameCount = 0;

const measureFPS = () => {
  frameCount++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
};
```

### React DevTools Profiler
Use React DevTools Profiler to identify:
- Components with excessive re-renders
- Expensive render times
- Unnecessary prop changes

## Critical Priority Fixes

1. **Battle Log Memory Limit** ✅ - DONE
2. **Town Healing Zone Check** - HIGH PRIORITY
3. **Auto-Potion Conditional Timer** - HIGH PRIORITY  
4. **requestAnimationFrame for Cooldowns** - MEDIUM PRIORITY
5. **Component Memoization** - MEDIUM PRIORITY
6. **Lazy Loading Modals** - LOW PRIORITY

## Testing Checklist

- [ ] Game runs smoothly for 30+ minutes
- [ ] Memory usage stays stable
- [ ] No lag during combat
- [ ] Auto-attack maintains consistent speed
- [ ] UI remains responsive during heavy combat
- [ ] No memory leaks in dev tools
- [ ] Frame rate stays above 30 FPS

## Browser Performance Tips

### For Users
1. Close unnecessary browser tabs
2. Use hardware acceleration
3. Clear browser cache periodically
4. Disable browser extensions during gameplay

### For Development
1. Use React Strict Mode in development only
2. Enable source maps for debugging
3. Use production build for performance testing
4. Profile with React DevTools before optimizing

## Monitoring Commands

```bash
# Build for production
npm run build

# Analyze bundle size
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json

# Run performance audit
npm run lighthouse
```