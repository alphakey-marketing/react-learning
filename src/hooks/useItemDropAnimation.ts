import { useState, useCallback } from 'react';
import { Equipment } from '../types/equipment';
import { DroppingItem } from '../components/ItemDropAnimation';

export function useItemDropAnimation() {
  const [droppingItems, setDroppingItems] = useState<DroppingItem[]>([]);

  const addDroppingItem = useCallback((item: Equipment) => {
    const id = `${Date.now()}-${Math.random()}`;
    
    // Drop from enemy position (center-right of screen)
    const startX = (window.innerWidth / 2) + 150;
    const startY = (window.innerHeight / 2) - 30;
    
    const droppingItem: DroppingItem = {
      id,
      item,
      startX,
      startY,
    };

    setDroppingItems(prev => [...prev, droppingItem]);
  }, []);

  const removeDroppedItem = useCallback((id: string) => {
    setDroppingItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    droppingItems,
    addDroppingItem,
    removeDroppedItem,
  };
}
