import React, { useEffect, useState } from 'react';

export interface FloatingTextData {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize?: number;
  isCrit?: boolean;
  isLevelUp?: boolean;
}

interface FloatingTextProps {
  items: FloatingTextData[];
  onRemove: (id: string) => void;
}

export function FloatingText({ items, onRemove }: FloatingTextProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      {items.map((item) => (
        <FloatingTextItem key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}

function FloatingTextItem({ item, onRemove }: { item: FloatingTextData; onRemove: (id: string) => void }) {
  const [opacity, setOpacity] = useState(1);
  const [yOffset, setYOffset] = useState(0);

  useEffect(() => {
    const duration = item.isLevelUp ? 2000 : 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Float up
      if (item.isLevelUp) {
        setYOffset(-progress * 80); // Level up floats higher
      } else {
        setYOffset(-progress * 60);
      }

      // Fade out in last 30%
      if (progress > 0.7) {
        setOpacity(1 - (progress - 0.7) / 0.3);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onRemove(item.id);
      }
    };

    requestAnimationFrame(animate);
  }, [item.id, item.isLevelUp, onRemove]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${item.x}px`,
        top: `${item.y + yOffset}px`,
        color: item.color,
        fontSize: `${item.fontSize || (item.isCrit ? 28 : 20)}px`,
        fontWeight: item.isCrit || item.isLevelUp ? 900 : 700,
        textShadow: item.isLevelUp 
          ? '0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8)'
          : item.isCrit
          ? '0 0 10px rgba(255, 0, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8)'
          : '2px 2px 4px rgba(0,0,0,0.8)',
        opacity,
        transform: item.isCrit ? 'scale(1.2)' : item.isLevelUp ? 'scale(1.5)' : 'scale(1)',
        transition: 'transform 0.1s',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        animation: item.isLevelUp ? 'pulse 0.5s ease-in-out infinite' : 'none',
      }}
    >
      {item.text}
    </div>
  );
}
