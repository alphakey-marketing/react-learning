import React, { useEffect, useState } from 'react';
import { Equipment } from '../types/equipment';

interface RareDropBannerProps {
  item: Equipment | null;
  onDismiss: () => void;
}

export function RareDropBanner({ item, onDismiss }: RareDropBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (item) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [item, onDismiss]);

  if (!item) return null;

  const rarityColor = item.rarity === 'epic' ? '#a335ee' : '#4a9eff';
  const rarityText = item.rarity === 'epic' ? 'EPIC DROP!' : 'RARE DROP!';

  return (
    <div
      style={{
        position: 'fixed',
        top: visible ? '20%' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `linear-gradient(135deg, ${rarityColor}22, ${rarityColor}44)`,
        border: `3px solid ${rarityColor}`,
        borderRadius: '15px',
        padding: '20px 40px',
        zIndex: 10000,
        transition: 'top 0.3s ease-out',
        boxShadow: `0 0 30px ${rarityColor}aa, inset 0 0 20px ${rarityColor}33`,
        animation: 'pulse 0.5s ease-in-out infinite',
        textAlign: 'center',
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
        {item.name}
      </div>
      <div style={{
        fontSize: '16px',
        color: '#ffd700',
        marginTop: '5px',
      }}>
        +{item.stat} {item.type === 'weapon' ? 'ATK' : 'DEF'}
      </div>
    </div>
  );
}
