import React from 'react';

export type MobileTab = 'combat' | 'stats' | 'map' | 'inventory' | 'more';

interface NavItem {
  id: MobileTab;
  icon: string;
  label: string;
  badge?: number;
}

interface BottomNavBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  statPointsBadge?: number;
  canChangeJob?: boolean;
  inventoryBadge?: number;
}

export function BottomNavBar({
  activeTab,
  onTabChange,
  statPointsBadge = 0,
  canChangeJob = false,
  inventoryBadge = 0,
}: BottomNavBarProps) {
  const tabs: NavItem[] = [
    { id: 'combat',    icon: '⚔️',  label: 'Battle' },
    { id: 'stats',     icon: '📊',  label: 'Stats', badge: statPointsBadge },
    { id: 'map',       icon: '🗺️',  label: 'Map' },
    { id: 'inventory', icon: '🎒',  label: 'Bag', badge: inventoryBadge },
    { id: 'more',      icon: '☰',   label: 'More' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        borderTop: '1px solid rgba(255,215,0,0.3)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 950,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const showJobBadge = tab.id === 'stats' && canChangeJob;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#fbbf24' : '#64748b',
              borderTop: isActive ? '2px solid #fbbf24' : '2px solid transparent',
              transition: 'color 0.2s',
              position: 'relative',
              padding: '4px 0',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 'bold' : 'normal' }}>
              {tab.label}
            </span>

            {/* Red badge for unspent stat points */}
            {(tab.badge ?? 0) > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: 'calc(50% - 14px)',
                  background: '#ef4444',
                  borderRadius: '10px',
                  fontSize: '9px',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  minWidth: '16px',
                  textAlign: 'center',
                }}
              >
                {tab.badge}
              </div>
            )}

            {/* Gold pulse for job change available */}
            {showJobBadge && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: 'calc(50% - 14px)',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  animation: 'pulseButton 1.5s infinite',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
