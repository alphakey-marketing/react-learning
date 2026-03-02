import React, { useState } from 'react';

interface TutorialStep {
  title: string;
  icon: string;
  description: React.ReactNode;
}

const steps: TutorialStep[] = [
  {
    title: "Welcome to Mini RPG!",
    icon: "🌟",
    description: "Welcome to your nostalgic RO-style adventure! Let's quickly cover the basics to get you started on your journey.",
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
  },
  {
    title: "Loot & Equipment",
    icon: "🛡️",
    description: "Monsters have a chance to drop valuable equipment. Check your Inventory to equip Weapons and Armor to boost your combat stats. Unwanted items can be sold in Town for Gold.",
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
  },
  {
    title: "Town & Survival",
    icon: "🏛️",
    description: "Town is your safe haven. Here you slowly regenerate HP and MP for free. Don't forget to buy Potions from the Shop before challenging dangerous Bosses. Good luck!",
  }
];

export function TutorialOverlay({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

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

  const step = steps[currentStep];

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      zIndex: 10000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backdropFilter: "blur(4px)",
      padding: "20px"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: "2px solid #3b82f6",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "500px",
        padding: "30px",
        color: "white",
        boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)",
        position: "relative",
        animation: "popupFadeIn 0.3s ease-out"
      }}>
        <div style={{ fontSize: "48px", textAlign: "center", marginBottom: "10px" }}>
          {step.icon}
        </div>
        <h2 style={{ textAlign: "center", color: "#60a5fa", marginTop: 0, marginBottom: "20px" }}>
          {step.title}
        </h2>
        <div style={{ 
          fontSize: "16px", 
          lineHeight: "1.6", 
          color: "#e2e8f0", 
          minHeight: "120px", 
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
              padding: "12px 20px",
              background: "transparent",
              color: "#94a3b8",
              border: "1px solid #475569",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              flex: 1,
              transition: "all 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            Skip Tutorial
          </button>
          <button 
            onClick={handleNext}
            style={{
              padding: "12px 20px",
              background: "linear-gradient(45deg, #3b82f6, #2563eb)", 
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              flex: 2,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
              transition: "transform 0.1s"
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {currentStep < steps.length - 1 ? "Next ➡️" : "Start Playing! 🎮"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popupFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
