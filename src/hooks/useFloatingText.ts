import { useState, useCallback } from 'react';
import { FloatingTextData } from '../components/FloatingText';

export function useFloatingText() {
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);

  const addFloatingText = useCallback((text: string, options?: {
    color?: string;
    fontSize?: number;
    isCrit?: boolean;
    isLevelUp?: boolean;
    x?: number;
    y?: number;
  }) => {
    const id = `${Date.now()}-${Math.random()}`;
    
    // Level up appears center-top of the game window
    // Damage numbers appear near the enemy container
    // We adjust X/Y to be relative to typical desktop layout:
    // Screen center X = middle of game window
    // Enemy is roughly center-left in the UI layout
    
    const windowCenterX = window.innerWidth / 2;
    
    // Level up: Center screen, high up
    const levelUpX = windowCenterX;
    const levelUpY = window.innerHeight * 0.3;
    
    // Damage: Left side near enemy portrait, slightly randomized to avoid stacking perfectly
    const randomOffset = Math.random() * 40 - 20; // -20 to +20 px
    const damageX = (windowCenterX - 200) + randomOffset; 
    const damageY = (window.innerHeight * 0.4) + randomOffset;
    
    const defaultX = options?.isLevelUp ? levelUpX : damageX;
    const defaultY = options?.isLevelUp ? levelUpY : damageY;
    
    const newText: FloatingTextData = {
      id,
      text,
      x: options?.x ?? defaultX,
      y: options?.y ?? defaultY,
      color: options?.color || '#fff',
      fontSize: options?.fontSize,
      isCrit: options?.isCrit,
      isLevelUp: options?.isLevelUp,
    };

    setFloatingTexts(prev => [...prev, newText]);
  }, []);

  const removeFloatingText = useCallback((id: string) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    floatingTexts,
    addFloatingText,
    removeFloatingText,
  };
}
