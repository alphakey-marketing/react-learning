import React, { useState, useEffect } from 'react';

interface TutorialStep {
  title: string;
  icon: string;
  description: React.ReactNode;
  highlightSelector?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'; // Where to position tutorial box
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
        Start by selecting a zone in the <b>Map System</b> (like Beginner Plains). 
        <br/><br/>
        To fight, click the <b>Attack</b> button or press <b>'A'</b> on your keyboard. You can also turn on <b>Auto-Attack</b> for idle farming!
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
    title: "Loot & Equipment",
    icon: "🛡️",
    description: "Monsters have a chance to drop valuable equipment. Check your Inventory to equip Weapons and Armor to boost your combat stats. Unwanted items can be sold in Town for Gold.",
    highlightSelector: '[data-tutorial="inventory"]',
    position: 'left',
  },
  {
    title: "Job Advancement",
    icon: "🧙",
    description: (
      <>
        When you reach <b>Job Level 10</b>, return to Town and speak to the <b>Job Master</b>. 
        <br/><br/>
        You can evolve from a Novice into advanced classes like <b>Swordsman, Mage, or Archer</b>!
      </>
    ),
    highlightSelector: '[data-tutorial="job-master"]',
    position: 'bottom',
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
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const step = steps[currentStep];

  // Update highlight position
  const updateHighlight = () => {
    // Remove previous highlight styling
    if (highlightedElement) {
      highlightedElement.style.position = '';
      highlightedElement.style.zIndex = '';
      highlightedElement.style.pointerEvents = '';
    }

    if (step.highlightSelector) {
      const element = document.querySelector(step.highlightSelector) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
        setHighlightedElement(element);
        
        // Make highlighted element appear above overlay
        element.style.position = 'relative';
        element.style.zIndex = '10001';
        element.style.pointerEvents = 'auto';
      } else {
        setHighlightRect(null);
        setHighlightedElement(null);
      }
    } else {
      setHighlightRect(null);
      setHighlightedElement(null);
    }
  };

  useEffect(() => {
    updateHighlight();
    
    // Update on window resize or scroll
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);
    
    return () => {
      // Cleanup: remove highlight styling
      if (highlightedElement) {
        highlightedElement.style.position = '';
        highlightedElement.style.zIndex = '';
        highlightedElement.style.pointerEvents = '';
      }
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
    if (!highlightRect || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 20;
    const boxWidth = 380;
    const boxHeight = 400; // Approximate height

    switch (step.position) {
      case 'right': {
        const left = highlightRect.right + padding;
        const top = highlightRect.top + highlightRect.height / 2;
        
        // Check if box would overflow right side
        if (left + boxWidth > window.innerWidth) {
          // Position on left instead
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
        
        // Check if box would overflow left side
        if (window.innerWidth - right + boxWidth < boxWidth) {
          // Position on right instead
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
        
        // Check if box would overflow bottom
        if (top + boxHeight > window.innerHeight) {
          // Position on top instead
          return {
            bottom: `${window.innerHeight - highlightRect.top + padding}px`,
            left: `${left}px`,
            transform: 'translateX(-50%)',
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
        
        // Check if box would overflow top
        if (window.innerHeight - bottom + boxHeight < boxHeight) {
          // Position on bottom instead
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
      {/* Dark overlay - everything except highlighted element */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(4px)",
        zIndex: 10000,
        pointerEvents: "none",
      }} />
      
      {/* Glowing border around highlighted element */}
      {highlightRect && (
        <>
          <div 
            style={{
              position: "fixed",
              top: `${highlightRect.top - 8}px`,
              left: `${highlightRect.left - 8}px`,
              width: `${highlightRect.width + 16}px`,
              height: `${highlightRect.height + 16}px`,
              border: "4px solid #3b82f6",
              borderRadius: "12px",
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.8), inset 0 0 40px rgba(59, 130, 246, 0.2)",
              animation: "pulse-border 2s ease-in-out infinite",
              pointerEvents: "none",
              zIndex: 10000,
            }}
          />
          
          {/* Pulsing arrow pointing to element */}
          {step.position === 'right' && highlightRect.right + 80 < window.innerWidth && (
            <div style={{
              position: "fixed",
              top: `${highlightRect.top + highlightRect.height / 2 - 15}px`,
              left: `${highlightRect.right + 25}px`,
              fontSize: "30px",
              animation: "bounce-horizontal 1s ease-in-out infinite",
              zIndex: 10002,
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
        padding: "20px",
        maxWidth: step.position === 'center' ? "500px" : "380px",
        width: step.position === 'center' ? "90%" : "auto",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: "2px solid #3b82f6",
          borderRadius: "16px",
          padding: "30px",
          color: "white",
          boxShadow: "0 10px 40px rgba(59, 130, 246, 0.5)",
          animation: "popupFadeIn 0.3s ease-out",
        }}>
          <div style={{ fontSize: "48px", textAlign: "center", marginBottom: "10px" }}>
            {step.icon}
          </div>
          <h2 style={{ textAlign: "center", color: "#60a5fa", marginTop: 0, marginBottom: "20px", fontSize: "20px" }}>
            {step.title}
          </h2>
          <div style={{ 
            fontSize: "15px", 
            lineHeight: "1.6", 
            color: "#e2e8f0", 
            minHeight: "100px", 
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            {step.description}
          </div>
          
          {/* Progress Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "25px 0" }}>
            {steps.map((_, idx) => (
              <div key={idx} style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: idx === currentStep ? "#3b82f6" : "#475569",
                transition: "background 0.3s",
                boxShadow: idx === currentStep ? "0 0 8px #3b82f6" : "none"
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "15px", marginTop: "20px" }}>
            <button 
              onClick={handleClose}
              style={{
                padding: "10px 16px",
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #475569",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
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
                padding: "10px 16px",
                background: "linear-gradient(45deg, #3b82f6, #2563eb)", 
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
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
        @keyframes pulse-border {
          0%, 100% { 
            border-color: #3b82f6;
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), inset 0 0 40px rgba(59, 130, 246, 0.2);
          }
          50% { 
            border-color: #60a5fa;
            box-shadow: 0 0 60px rgba(96, 165, 250, 1), inset 0 0 60px rgba(96, 165, 250, 0.3);
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
