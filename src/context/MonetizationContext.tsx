import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Capacitor } from "@capacitor/core";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonetizationState {
  isPremium: boolean;
  premiumExpiryDate: number | null;
  coins: number;
  lives: number;
  maxLives: number;
  lastLifeRegenTime: number;
}

interface MonetizationContextType extends MonetizationState {
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addLives: (amount: number) => void;
  spendLife: () => boolean;
  activatePremium: () => void;
  deactivatePremium: () => void;
  restorePurchases: () => Promise<void>;
  isChapterFree: (chapterNumber: number) => boolean;
  isUAT: boolean; // true when running in browser
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_LIVES = 5;
const PREMIUM_MAX_LIVES = 10;
const LIFE_REGEN_MS = 30 * 60 * 1000; // 30 min per life
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const FREE_CHAPTERS = 3;
const STORAGE_KEY = "rpg_monetization";

// ─── Default State ────────────────────────────────────────────────────────────
const defaultState: MonetizationState = {
  isPremium: false,
  premiumExpiryDate: null,
  coins: 0,
  lives: MAX_LIVES,
  maxLives: MAX_LIVES,
  lastLifeRegenTime: Date.now(),
};

// ─── Context ──────────────────────────────────────────────────────────────────
const MonetizationContext = createContext<MonetizationContextType>({
  ...defaultState,
  addCoins: () => {},
  spendCoins: () => false,
  addLives: () => {},
  spendLife: () => false,
  activatePremium: () => {},
  deactivatePremium: () => {},
  restorePurchases: async () => {},
  isChapterFree: () => true,
  isUAT: true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function MonetizationProvider({ children }: { children: ReactNode }) {
  const isUAT = !Capacitor.isNativePlatform(); // true in browser

  const [state, setState] = useState<MonetizationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  // ── Persist to localStorage on every change ──────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ── On app open: sync premium from RevenueCat (Android only) ─────────────
  useEffect(() => {
    if (isUAT) return; // skip in browser

    async function syncPremiumFromRevenueCat() {
      try {
        // TODO: uncomment after installing @capgo/capacitor-purchases
        // const { customerInfo } = await Purchases.getCustomerInfo();
        // const active = customerInfo.entitlements.active['premium'];
        // setState(prev => ({ ...prev, isPremium: !!active }));
        console.log("[RevenueCat] Premium sync placeholder — wire up after Capacitor setup");
      } catch (err) {
        // Network error: keep localStorage cache, do not lock out user
        console.warn("[RevenueCat] Sync failed, using cached state:", err);
      }
    }

    syncPremiumFromRevenueCat();
  }, []);

  // ── Check local premium expiry ────────────────────────────────────────────
  useEffect(() => {
    if (!state.premiumExpiryDate) return;
    if (Date.now() > state.premiumExpiryDate) {
      setState(prev => ({
        ...prev,
        isPremium: false,
        premiumExpiryDate: null,
        maxLives: MAX_LIVES,
      }));
    }
  }, []);

  // ── Life regeneration timer ───────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const currentMax = prev.isPremium ? PREMIUM_MAX_LIVES : MAX_LIVES;
        if (prev.lives >= currentMax) return prev;

        const elapsed = Date.now() - prev.lastLifeRegenTime;
        const livesToAdd = Math.floor(elapsed / LIFE_REGEN_MS);
        if (livesToAdd <= 0) return prev;

        return {
          ...prev,
          lives: Math.min(prev.lives + livesToAdd, currentMax),
          maxLives: currentMax,
          lastLifeRegenTime: prev.lastLifeRegenTime + livesToAdd * LIFE_REGEN_MS,
        };
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────
  function addCoins(amount: number) {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
  }

  function spendCoins(amount: number): boolean {
    if (state.coins < amount) return false;
    setState(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }

  function addLives(amount: number) {
    setState(prev => {
      const max = prev.isPremium ? PREMIUM_MAX_LIVES : MAX_LIVES;
      return { ...prev, lives: Math.min(prev.lives + amount, max) };
    });
  }

  function spendLife(): boolean {
    if (state.lives <= 0) return false;
    setState(prev => ({ ...prev, lives: prev.lives - 1 }));
    return true;
  }

  function activatePremium() {
    setState(prev => ({
      ...prev,
      isPremium: true,
      premiumExpiryDate: Date.now() + PREMIUM_DURATION_MS,
      maxLives: PREMIUM_MAX_LIVES,
    }));
  }

  function deactivatePremium() {
    setState(prev => ({
      ...prev,
      isPremium: false,
      premiumExpiryDate: null,
      maxLives: MAX_LIVES,
      lives: Math.min(prev.lives, MAX_LIVES),
    }));
  }

  async function restorePurchases(): Promise<void> {
    if (isUAT) {
      // UAT simulation: just reactivate premium
      console.log("[UAT] Restore purchases simulated");
      activatePremium();
      return;
    }
    // TODO: uncomment after Capacitor setup
    // try {
    //   const { customerInfo } = await Purchases.restorePurchases();
    //   if (customerInfo.entitlements.active['premium']) {
    //     activatePremium();
    //   }
    // } catch (err) {
    //   console.error("[RevenueCat] Restore failed:", err);
    //   throw err;
    // }
  }

  function isChapterFree(chapterNumber: number): boolean {
    return chapterNumber <= FREE_CHAPTERS || state.isPremium;
  }

  return (
    <MonetizationContext.Provider value={{
      ...state,
      addCoins,
      spendCoins,
      addLives,
      spendLife,
      activatePremium,
      deactivatePremium,
      restorePurchases,
      isChapterFree,
      isUAT,
    }}>
      {children}
    </MonetizationContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useMonetization() {
  return useContext(MonetizationContext);
}