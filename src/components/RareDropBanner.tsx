import React, { useEffect, useState } from 'react';
import { Equipment } from '../types/equipment';

interface RareDropBannerProps {
  item: Equipment | null;
  onDismiss: () => void;
}

export function RareDropBanner({ item, onDismiss }: RareDropBannerProps) {
  const [visible, setVisible] = useState(false);
  const [displayItem, setDisplayItem] = useState<Equipment | null>(null);

  // We need local state so the banner doesn't instantly snap out when 'item' becomes null
  // We want to animate it out smoothly.
  useEffect(() => {
    if (item) {
      setDisplayItem(item);
      // Small delay to ensure displayItem is set before animating in
      setTimeout(() => setVisible(true), 50);

      // Auto dismiss sequence:
      // 1. Start slide-out animation after 2.5s
      const slideOutTimer = setTimeout(() => {
        setVisible(false);
        // 2. Trigger parent cleanup after animation finishes (0.5s)
        setTimeout(() => {
          onDismiss();
        }, 500); 
      }, 2500);

      return () => clearTimeout(slideOutTimer);
    }
  }, [item, onDismiss]);

  // Use the cached display item so we can still render it while animating out
  const targetItem = item || displayItem;

  if (!targetItem) return null;

  const rarityColor = targetItem.rarity === 'epic' ? '#a335ee' : '#4a9eff';
  const rarityText = targetItem.rarity === 'epic' ? 'EPIC DROP!' : 'RARE DROP!';

  return (
    <div
      style={{
        position: 'fixed',
        top: visible ? '20%' : '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `linear-gradient(135deg, ${rarityColor}22, ${rarityColor}44)`,
        border: `3px solid ${rarityColor}`,
        borderRadius: '15px',
        padding: '20px 40px',
        zIndex: 10000,
        transition: 'top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy slide in
        boxShadow: `0 0 30px ${rarityColor}aa, inset 0 0 20px ${rarityColor}33`,
        animation: visible ? 'pulse 1s ease-in-out infinite' : 'none',
        textAlign: 'center',
        pointerEvents: 'none', // Allow clicking through
      }}
    >
      <div style={{
        fontSize: '32px',
        fontWeight: 900,
        color: rarityColor,
        textShadow: `0 0 20px ${rarityColor}, 2px 2px 4px #000`,
        marginBottom: '10px',
        letterSpacing: '3px',
      }}>
        {rarityText}
      </div>
      <div style={{
        fontSize: '24px',
        color: '#fff',
        fontWeight: 700,
        textShadow: '2px 2px 4px #000',
      }}>
        {targetItem.name}
      </div>
      <div style={{
        fontSize: '16px',
        color: '#ffd700',
        marginTop: '5px',
        fontWeight: 'bold',
      }}>
        +{targetItem.stat} {targetItem.type === 'weapon' ? 'ATK' : 'DEF'}
      </div>
    </div>
  );
}
