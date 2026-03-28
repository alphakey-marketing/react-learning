import React, { useState, useEffect } from 'react';

interface TutorialStep {
  title: string;
  icon: string;
  description: React.ReactNode;
  highlightSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: TutorialStep[] = [
  {
    title: "Welcome to Mini RPG!",
    icon: "🌟",
    description: "Welcome to your nostalgic RO-style adventure! Let's quickly cover the basics to get you started on your journey.",
    position: 'center',
  },
  {
    title: "Combat & Exploration",
    icon: "⚔️",
    description: (
      <>
        <b>First, equip your free Novice weapon from Inventory!</b>
        <br/><br/>
        Then select a zone in the <b>Map System</b> (like Beginner Plains). 
        <br/><br/>
        To fight, click the <b>Attack</b> button. You can also turn on <b>Auto-Attack</b> for idle farming!
      </>
    ),
    highlightSelector: '[data-tutorial="map-system"]',
    position: 'left',
  },
  {
    title: "Stats & Growth",
    icon: "📈",
    description: (
      <>
        As you defeat enemies, you'll earn <b>Base EXP</b> and <b>Job EXP</b>. 
        <br/><br/>
        Base level ups give you <b>Stat Points</b> (STR, AGI, INT, etc.) to increase your power. Job level ups give you <b>Skill Points</b> to learn new abilities!
      </>
    ),
    highlightSelector: '[data-tutorial="character-stats"]',
    position: 'right',
  },
  {
    title: "Job Advancement System",
    icon: "🧙",
    description: (
      <>
        <b>1st Job Change</b>: At Job Level 10 as a Novice, become a Swordsman, Mage, or Archer!
        <br/><br/>
        <b>2nd Job Change</b>: At Job Level 15 in your 1st job, advance to Knight, Wizard, or Hunter for powerful skills and bonuses!
        <br/><br/>
        Visit the <b>Job Master</b> in Town when you're ready.
      </>
    ),
    highlightSelector: '[data-tutorial="job-master"]',
    position: 'bottom',
  },
  {
    title: "Loot & Equipment",
    icon: "🛡️",
    description: "Monsters have a chance to drop valuable equipment. Check your Inventory to equip Weapons and Armor to boost your combat stats. Unwanted items can be sold in Town for Gold.",
    highlightSelector: '[data-tutorial="inventory"]',
    position: 'left',
  },
  {
    title: "Town & Survival",
    icon: "🏛️",
    description: "Town is your safe haven. Here you slowly regenerate HP and MP for free. Don't forget to buy Potions from the Shop before challenging dangerous Bosses. Good luck!",
    highlightSelector: '[data-tutorial="shop"]',
    position: 'left',
  }
];

export function TutorialOverlay({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const step = steps[currentStep];

  const updateHighlight = () => {
    setIsMobile(window.innerWidth < 768);
    
    if (step.highlightSelector) {
      const element = document.querySelector(step.highlightSelector) as HTMLElement;
      if (element) {
        // Scroll the element into view, then measure after the animation settles.
        // 'auto' skips animation so the rect is accurate immediately.
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  };

  useEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);
    
    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [currentStep, step.highlightSelector]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenTutorial", "true");
    }
    onClose();
  };

  const getBoxPosition = (): React.CSSProperties => {
    // Force center position on mobile devices because directional positioning
    // breaks when UI elements stack vertically, causing overflow or off-screen bugs.
    if (!highlightRect || step.position === 'center' || isMobile) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 20;
    const boxWidth = 380;
    const boxHeight = 450; 

    switch (step.position) {
      case 'right': {
        const left = highlightRect.right + padding;
        const top = highlightRect.top + highlightRect.height / 2;
        
        if (left + boxWidth > window.innerWidth) {
          return {
            top: `${top}px`,
            right: `${window.innerWidth - highlightRect.left + padding}px`,
            transform: 'translateY(-50%)',
          };
        }
        
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translateY(-50%)',
        };
      }
      
      case 'left': {
        const right = window.innerWidth - highlightRect.left + padding;
        const top = highlightRect.top + highlightRect.height / 2;
        
        if (window.innerWidth - right + boxWidth < boxWidth) {
          return {
            top: `${top}px`,
            left: `${highlightRect.right + padding}px`,
            transform: 'translateY(-50%)',
          };
        }
        
        return {
          top: `${top}px`,
          right: `${right}px`,
          transform: 'translateY(-50%)',
        };
      }
      
      case 'bottom': {
        const top = highlightRect.bottom + padding;
        const left = highlightRect.left + highlightRect.width / 2;
        
        // If box would overflow bottom, fallback to center
        if (top + boxHeight > window.innerHeight) {
          return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          };
        }
        
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
        };
      }
      
      case 'top': {
        const bottom = window.innerHeight - highlightRect.top + padding;
        const left = highlightRect.left + highlightRect.width / 2;
        
        if (window.innerHeight - bottom + boxHeight < boxHeight) {
          return {
            top: `${highlightRect.bottom + padding}px`,
            left: `${left}px`,
            transform: 'translateX(-50%)',
          };
        }
        
        return {
          bottom: `${bottom}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
        };
      }
      
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <>
      {/* SVG overlay with cutout mask */}
      <svg
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10000,
          pointerEvents: "none",
        }}
      >
        <defs>
          <mask id="spotlight-mask">
            {/* White = visible, Black = hidden */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Dark overlay with cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.85)"
          mask="url(#spotlight-mask)"
        />
        
        {/* Glowing border around cutout */}
        {highlightRect && (
          <rect
            x={highlightRect.left - 8}
            y={highlightRect.top - 8}
            width={highlightRect.width + 16}
            height={highlightRect.height + 16}
            rx="12"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            filter="url(#glow)"
            style={{ animation: "pulse-stroke 2s ease-in-out infinite" }}
          />
        )}
      </svg>
      
      {/* Pulsing arrows - Hide on mobile since the box is centered */}
      {highlightRect && !isMobile && (
        <>
          {step.position === 'right' && highlightRect.right + 80 < window.innerWidth && (
            <div style={{
              position: "fixed",
              top: `${highlightRect.top + highlightRect.height / 2 - 15}px`,
              left: `${highlightRect.right + 25}px`,
              fontSize: "30px",
              animation: "bounce-horizontal 1s ease-in-out infinite",
              zIndex: 10002,
              pointerEvents: "none",
            }}>
              ⬅️
            </div>
          )}
          {step.position === 'left' && highlightRect.left > 80 && (
            <div style={{
              position: "fixed",
              top: `${highlightRect.top + highlightRect.height / 2 - 15}px`,
              right: `${window.innerWidth - highlightRect.left + 25}px`,
              fontSize: "30px",
              animation: "bounce-horizontal 1s ease-in-out infinite",
              zIndex: 10002,
              pointerEvents: "none",
            }}>
              ➡️
            </div>
          )}
          {step.position === 'bottom' && highlightRect.bottom + 80 < window.innerHeight && (
            <div style={{
              position: "fixed",
              top: `${highlightRect.bottom + 30}px`,
              left: `${highlightRect.left + highlightRect.width / 2 - 15}px`,
              fontSize: "30px",
              animation: "bounce-vertical 1s ease-in-out infinite",
              zIndex: 10002,
              pointerEvents: "none",
            }}>
              ⬆️
            </div>
          )}
        </>
      )}

      {/* Tutorial box */}
      <div style={{
        position: "fixed",
        ...getBoxPosition(),
        zIndex: 10003,
        padding: "15px",
        maxWidth: step.position === 'center' || isMobile ? "500px" : "380px",
        width: "90%", // Always use 90% width to prevent overflow
        maxHeight: "90vh",
        overflow: "auto",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: "2px solid #3b82f6",
          borderRadius: "16px",
          padding: "clamp(15px, 4vw, 30px)", // Responsive padding
          color: "white",
          boxShadow: "0 10px 40px rgba(59, 130, 246, 0.5)",
          animation: "popupFadeIn 0.3s ease-out",
        }}>
          <div style={{ 
            fontSize: "clamp(32px, 8vw, 48px)", // Responsive icon
            textAlign: "center", 
            marginBottom: "10px" 
          }}>
            {step.icon}
          </div>
          <h2 style={{ 
            textAlign: "center", 
            color: "#60a5fa", 
            marginTop: 0, 
            marginBottom: "clamp(10px, 3vw, 20px)", 
            fontSize: "clamp(18px, 5vw, 20px)" // Responsive title
          }}>
            {step.title}
          </h2>
          <div style={{ 
            fontSize: "clamp(13px, 3.5vw, 15px)", // Responsive description text
            lineHeight: "1.6", 
            color: "#e2e8f0", 
            minHeight: "60px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            {step.description}
          </div>
          
          {/* Progress Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "clamp(15px, 4vw, 25px) 0" }}>
            {steps.map((_, idx) => (
              <div key={idx} style={{
                width: "clamp(8px, 2vw, 10px)", 
                height: "clamp(8px, 2vw, 10px)", 
                borderRadius: "50%",
                background: idx === currentStep ? "#3b82f6" : "#475569",
                transition: "background 0.3s",
                boxShadow: idx === currentStep ? "0 0 8px #3b82f6" : "none"
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            gap: "clamp(10px, 3vw, 15px)", 
            marginTop: "15px" 
          }}>
            <button 
              onClick={handleClose}
              style={{
                padding: "clamp(8px, 2vw, 10px) clamp(10px, 3vw, 16px)",
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #475569",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "clamp(11px, 3vw, 13px)",
                flex: 1,
                transition: "all 0.2s",
                pointerEvents: "auto",
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              Skip Tutorial
            </button>
            <button 
              onClick={handleNext}
              style={{
                padding: "clamp(8px, 2vw, 10px) clamp(10px, 3vw, 16px)",
                background: "linear-gradient(45deg, #3b82f6, #2563eb)", 
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "clamp(11px, 3vw, 13px)",
                flex: 2,
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                transition: "transform 0.1s",
                pointerEvents: "auto",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {currentStep < steps.length - 1 ? "Next ➡️" : "Start Playing! 🎮"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-stroke {
          0%, 100% { 
            stroke: #3b82f6;
            stroke-width: 4;
          }
          50% { 
            stroke: #60a5fa;
            stroke-width: 5;
          }
        }
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
        @keyframes bounce-vertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
