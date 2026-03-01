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
    
    // Default position (center of screen for level up, slightly right of center for damage)
    const defaultX = options?.isLevelUp ? window.innerWidth / 2 : (window.innerWidth / 2) + 100;
    const defaultY = options?.isLevelUp ? window.innerHeight / 3 : (window.innerHeight / 2) - 50;
    
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
