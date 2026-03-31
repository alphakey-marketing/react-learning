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

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Level up / material drops: centre of screen, upper third
    const levelUpX = vw / 2;
    const levelUpY = vh * 0.28;

    // Damage numbers: centre of screen offset slightly left, mid-screen
    // Clamp so they never go off-screen on narrow viewports
    const randomOffset = Math.random() * 30 - 15;
    const damageX = Math.max(60, Math.min(vw - 60, vw / 2 - Math.min(120, vw * 0.15) + randomOffset));
    const damageY = Math.max(80, Math.min(vh - 80, vh * 0.38 + randomOffset));

    const defaultX = options?.isLevelUp ? levelUpX : damageX;
    const defaultY = options?.isLevelUp ? levelUpY : damageY;

    const newText: FloatingTextData = {
      id,
      text,
      x: options?.x !== undefined ? options.x : defaultX,
      y: options?.y !== undefined ? options.y : defaultY,
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