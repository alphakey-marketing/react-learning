import React from "react";

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  canChangeJob: boolean;
  skillPoints: number;
  isInTown: boolean;
  onOpenSkills: () => void;
  onOpenJobMaster: () => void;
  onOpenBlacksmith: () => void;
  onOpenShop: () => void;
  onOpenEquippedGear: () => void;
}

export function MoreMenu({
  isOpen,
  onClose,
  canChangeJob,
  skillPoints,
  isInTown,
  onOpenSkills,
  onOpenJobMaster,
  onOpenBlacksmith,
  onOpenShop,
  onOpenEquippedGear,
}: MoreMenuProps) {
  if (!isOpen) return null;

  const handleAction = (fn: () => void) => {
    fn();
    onClose();
  };

  const menuItems = [
    {
      icon: "📖",
      label: skillPoints > 0 ? `Skills (${skillPoints} pts!)` : "Skills",
      onClick: () => handleAction(onOpenSkills),
      bg: skillPoints > 0 ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "linear-gradient(135deg, #374151, #1f2937)",
      border: skillPoints > 0 ? "1px solid #8b5cf6" : "1px solid #374151",
      glow: skillPoints > 0 ? "0 0 12px rgba(124,58,237,0.5)" : "none",
    },
    {
      icon: "🧙",
      label: canChangeJob ? "Job Change!" : "Job Master",
      onClick: () => handleAction(onOpenJobMaster),
      bg: canChangeJob ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #374151, #1f2937)",
      border: canChangeJob ? "1px solid #fbbf24" : "1px solid #374151",
      glow: canChangeJob ? "0 0 12px rgba(251,191,36,0.5)" : "none",
    },
    {
      icon: "🔨",
      label: "Blacksmith",
      onClick: () => handleAction(onOpenBlacksmith),
      bg: "linear-gradient(135deg, #374151, #1f2937)",
      border: "1px solid #374151",
      glow: "none",
      disabled: !isInTown,
    },
    {
      icon: "🛒",
      label: "Shop",
      onClick: () => handleAction(onOpenShop),
      bg: "linear-gradient(135deg, #0369a1, #075985)",
      border: "1px solid #0ea5e9",
      glow: "none",
      disabled: !isInTown,
    },
    {
      icon: "⚔️",
      label: "Equipped Gear",
      onClick: () => handleAction(onOpenEquippedGear),
      bg: "linear-gradient(135deg, #374151, #1f2937)",
      border: "1px solid #374151",
      glow: "none",
    },
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 1000,
        }}
      />

      <div
        style={{
          position: "fixed",
          bottom: "64px",
          left: 0,
          right: 0,
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          borderTop: "1px solid rgba(255,215,0,0.3)",
          borderRadius: "16px 16px 0 0",
          zIndex: 1001,
          padding: "16px 12px 12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "#334155",
            borderRadius: "2px",
            margin: "0 auto 16px",
          }}
        />

        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            textAlign: "center",
            marginBottom: "12px",
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Menu
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 12px",
                background: item.disabled ? "#1e293b" : item.bg,
                border: item.disabled ? "1px solid #1e293b" : item.border,
                borderRadius: "10px",
                cursor: item.disabled ? "not-allowed" : "pointer",
                opacity: item.disabled ? 0.4 : 1,
                color: "white",
                fontSize: "13px",
                fontWeight: "bold",
                textAlign: "left",
                boxShadow: item.disabled ? "none" : item.glow,
                touchAction: "manipulation",
              }}
            >
              <span style={{ fontSize: "22px", lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}