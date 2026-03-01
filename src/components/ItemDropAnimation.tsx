import React, { useEffect, useState } from 'react';
import { Equipment } from '../types/equipment';

export interface DroppingItem {
  id: string;
  item: Equipment;
  startX: number;
  startY: number;
}

interface ItemDropAnimationProps {
  items: DroppingItem[];
  onAnimationComplete: (id: string) => void;
}

export function ItemDropAnimation({ items, onAnimationComplete }: ItemDropAnimationProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9998,
    }}>
      {items.map((droppingItem) => (
        <DroppingItemSprite
          key={droppingItem.id}
          item={droppingItem}
          onComplete={onAnimationComplete}
        />
      ))}
    </div>
  );
}

function DroppingItemSprite({ 
  item, 
  onComplete 
}: { 
  item: DroppingItem; 
  onComplete: (id: string) => void 
}) {
  const [y, setY] = useState(item.startY);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);

  const rarityColor = {
    common: '#ffffff',
    rare: '#4a9eff',
    epic: '#a335ee',
  }[item.item.rarity];

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const gravity = 0.5;
    let velocityY = -8; // Initial upward velocity

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Physics-based drop
      velocityY += gravity;
      setY(prev => prev + velocityY);

      // Bounce effect when hitting "ground"
      if (y > item.startY + 40 && velocityY > 0) {
        velocityY = -velocityY * 0.4; // Bounce back with 40% energy
      }

      // Pulse/sparkle effect for rare items
      if (item.item.rarity !== 'common') {
        setScale(1 + Math.sin(elapsed * 0.01) * 0.1);
      }

      // Fade out near end
      if (progress > 0.8) {
        setOpacity(1 - (progress - 0.8) / 0.2);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete(item.id);
      }
    };

    requestAnimationFrame(animate);
  }, [item.id, item.startY, y, onComplete, item.item.rarity]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${item.startX}px`,
        top: `${y}px`,
        fontSize: '24px',
        opacity,
        transform: `scale(${scale})`,
        textShadow: `0 0 10px ${rarityColor}, 0 0 20px ${rarityColor}`,
        filter: item.item.rarity === 'epic' ? 'drop-shadow(0 0 8px #a335ee)' : 
                item.item.rarity === 'rare' ? 'drop-shadow(0 0 6px #4a9eff)' : 'none',
        userSelect: 'none',
      }}
    >
      {item.item.type === 'weapon' ? '⚔️' : '🛡️'}
    </div>
  );
}
