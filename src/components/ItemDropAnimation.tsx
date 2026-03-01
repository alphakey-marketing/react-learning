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
  const [yOffset, setYOffset] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.5);

  const rarityColor = {
    common: '#ffffff',
    rare: '#4a9eff',
    epic: '#a335ee',
  }[item.item.rarity];

  useEffect(() => {
    // Smoother "pop up and float" animation
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Animation phases:
      // 0-20%: Pop up, fade in, scale up
      // 20-80%: Float slowly upwards
      // 80-100%: Fade out

      if (progress < 0.2) {
        // Pop up phase
        const popProgress = progress / 0.2;
        setYOffset(-popProgress * 30);
        setOpacity(popProgress);
        setScale(0.5 + (popProgress * 0.7)); // Scale from 0.5 to 1.2
      } else if (progress < 0.8) {
        // Float phase
        const floatProgress = (progress - 0.2) / 0.6;
        setYOffset(-30 - (floatProgress * 40)); // Float up higher
        setOpacity(1);
        
        // Add gentle pulsing to rare items
        if (item.item.rarity !== 'common') {
          setScale(1.2 + Math.sin(elapsed * 0.005) * 0.1);
        } else {
          setScale(1.2);
        }
      } else {
        // Fade out phase
        const fadeProgress = (progress - 0.8) / 0.2;
        setYOffset(-70 - (fadeProgress * 20));
        setOpacity(1 - fadeProgress);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete(item.id);
      }
    };

    requestAnimationFrame(animate);
  }, [item.id, onComplete, item.item.rarity]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${item.startX}px`,
        top: `${item.startY + yOffset}px`,
        opacity,
        transform: `scale(${scale})`,
        transition: 'none', // Use JS animation, not CSS transitions here
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: item.item.rarity === 'epic' ? 'drop-shadow(0 0 10px #a335ee)' : 
                item.item.rarity === 'rare' ? 'drop-shadow(0 0 8px #4a9eff)' : 'none',
      }}
    >
      <div style={{
        fontSize: '32px',
        textShadow: `0 0 15px ${rarityColor}`,
        userSelect: 'none',
      }}>
        {item.item.type === 'weapon' ? '⚔️' : '🛡️'}
      </div>
      <div style={{
        color: rarityColor,
        fontSize: '14px',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px #000',
        marginTop: '4px',
        background: 'rgba(0,0,0,0.6)',
        padding: '2px 8px',
        borderRadius: '10px',
        border: `1px solid ${rarityColor}55`,
        whiteSpace: 'nowrap',
      }}>
        {item.item.name}
      </div>
    </div>
  );
}
