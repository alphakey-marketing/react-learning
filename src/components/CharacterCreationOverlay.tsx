import { useState } from "react";

interface CharacterCreationOverlayProps {
  onComplete: (name: string, avatarSeed: string) => void;
}

export function CharacterCreationOverlay({ onComplete }: CharacterCreationOverlayProps) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [step, setStep] = useState<"name" | "avatar">("name");
  
  // Generate 12 random avatar seeds
  const avatarSeeds = Array.from({ length: 12 }, (_, i) => `adventurer-${Date.now()}-${i}`);
  
  const handleNameSubmit = () => {
    if (name.trim().length >= 1 && name.trim().length <= 15) {
      setStep("avatar");
    }
  };
  
  const handleAvatarSelect = (seed: string) => {
    setSelectedAvatar(seed);
  };
  
  const handleComplete = () => {
    if (selectedAvatar && name.trim()) {
      localStorage.setItem("characterName", name.trim());
      localStorage.setItem("characterAvatar", selectedAvatar);
      onComplete(name.trim(), selectedAvatar);
    }
  };
  
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "3px solid #fbbf24",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "600px",
          width: "90%",
          color: "white",
          textAlign: "center",
          boxShadow: "0 0 50px rgba(251, 191, 36, 0.5)",
        }}
      >
        {step === "name" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>
              ⚔️
            </div>
            <h1
              style={{
                margin: "0 0 10px 0",
                fontSize: "36px",
                background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              Create Your Character
            </h1>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "30px",
                color: "#9ca3af",
              }}
            >
              Begin your adventure in the world of Mini RPG
            </p>
            
            <div style={{ marginBottom: "30px", textAlign: "left" }}>
              <label
                htmlFor="character-name"
                style={{
                  display: "block",
                  marginBottom: "10px",
                  color: "#fbbf24",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Character Name
              </label>
              <input
                id="character-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSubmit();
                }}
                maxLength={15}
                placeholder="Enter your name (1-15 characters)"
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  background: "#1a1a1a",
                  border: "2px solid #444",
                  borderRadius: "8px",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: name.trim().length > 15 ? "#ef4444" : "#6b7280",
                  textAlign: "right",
                }}
              >
                {name.length}/15 characters
              </div>
            </div>
            
            <button
              onClick={handleNameSubmit}
              disabled={name.trim().length < 1 || name.trim().length > 15}
              style={{
                width: "100%",
                padding: "15px",
                background:
                  name.trim().length >= 1 && name.trim().length <= 15
                    ? "linear-gradient(45deg, #fbbf24, #f59e0b)"
                    : "#555",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor:
                  name.trim().length >= 1 && name.trim().length <= 15
                    ? "pointer"
                    : "not-allowed",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow:
                  name.trim().length >= 1 && name.trim().length <= 15
                    ? "0 4px 15px rgba(251, 191, 36, 0.4)"
                    : "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (name.trim().length >= 1 && name.trim().length <= 15) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(251, 191, 36, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  name.trim().length >= 1 && name.trim().length <= 15
                    ? "0 4px 15px rgba(251, 191, 36, 0.4)"
                    : "none";
              }}
            >
              Next: Choose Avatar →
            </button>
          </>
        )}
        
        {step === "avatar" && (
          <>
            <button
              onClick={() => setStep("name")}
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                padding: "8px 16px",
                background: "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ← Back
            </button>
            
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>
              🎭
            </div>
            <h2
              style={{
                margin: "0 0 10px 0",
                fontSize: "28px",
                background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              Choose Your Avatar
            </h2>
            <p
              style={{
                fontSize: "14px",
                marginBottom: "25px",
                color: "#9ca3af",
              }}
            >
              Select an avatar for <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{name}</span>
            </p>
            
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "25px",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "10px",
              }}
            >
              {avatarSeeds.map((seed) => (
                <button
                  key={seed}
                  onClick={() => handleAvatarSelect(seed)}
                  style={{
                    padding: "10px",
                    background: selectedAvatar === seed ? "#fbbf24" : "#2a2a2a",
                    border: selectedAvatar === seed ? "3px solid #f59e0b" : "2px solid #444",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAvatar !== seed) {
                      e.currentTarget.style.background = "#3a3a3a";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAvatar !== seed) {
                      e.currentTarget.style.background = "#2a2a2a";
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`}
                    alt={`Avatar ${seed}`}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                    }}
                  />
                </button>
              ))}
            </div>
            
            <button
              onClick={handleComplete}
              disabled={!selectedAvatar}
              style={{
                width: "100%",
                padding: "15px",
                background: selectedAvatar
                  ? "linear-gradient(45deg, #10b981, #059669)"
                  : "#555",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: selectedAvatar ? "pointer" : "not-allowed",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: selectedAvatar ? "0 4px 15px rgba(16, 185, 129, 0.4)" : "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (selectedAvatar) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = selectedAvatar
                  ? "0 4px 15px rgba(16, 185, 129, 0.4)"
                  : "none";
              }}
            >
              🎮 Start Adventure!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
