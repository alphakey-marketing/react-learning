import { useState } from "react";

interface CharacterCreationProps {
  onComplete: (name: string, avatarSeed: string) => void;
}

const RANDOM_NAMES = [
  "Aldric", "Theron", "Lysandra", "Kaelen", "Seraphina",
  "Varian", "Elara", "Magnus", "Aria", "Draven",
  "Isolde", "Rowan", "Celestia", "Alaric", "Freya",
  "Thaddeus", "Nyx", "Percival", "Luna", "Cassius"
];

const AVATAR_STYLES = [
  "adventurer", "adventurer-neutral", "avataaars", 
  "big-ears", "big-smile", "bottts", "lorelei"
];

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [name, setName] = useState("");
  const [avatarStyle, setAvatarStyle] = useState("adventurer");
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
  const [step, setStep] = useState<"name" | "avatar">("name");

  const generateRandomName = () => {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setName(randomName);
  };

  const generateRandomAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  const handleNameSubmit = () => {
    if (name.trim().length === 0) {
      return;
    }
    setStep("avatar");
  };

  const handleComplete = () => {
    const finalSeed = avatarStyle + "-" + avatarSeed;
    onComplete(name.trim(), finalSeed);
  };

  const getAvatarUrl = () => {
    return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=transparent`;
  };

  if (step === "name") {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)",
            border: "3px solid #fbbf24",
            borderRadius: "16px",
            padding: "40px",
            maxWidth: "500px",
            width: "90%",
            color: "white",
            textAlign: "center",
            boxShadow: "0 0 50px rgba(251, 191, 36, 0.5)",
          }}
        >
          <div style={{ fontSize: "72px", marginBottom: "20px" }}>
            ⚔️
          </div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "32px",
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
              fontSize: "14px",
              marginBottom: "30px",
              color: "#bbb",
            }}
          >
            Enter your character's name to begin your adventure
          </p>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleNameSubmit();
                }
              }}
              placeholder="Enter character name..."
              maxLength={20}
              style={{
                width: "100%",
                padding: "15px",
                fontSize: "18px",
                borderRadius: "8px",
                border: "2px solid #444",
                background: "#1a1a1a",
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
                outline: "none",
              }}
              autoFocus
            />
          </div>

          <button
            onClick={generateRandomName}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              background: "linear-gradient(to right, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            🎲 Generate Random Name
          </button>

          <button
            onClick={handleNameSubmit}
            disabled={name.trim().length === 0}
            style={{
              width: "100%",
              padding: "15px",
              background: name.trim().length > 0
                ? "linear-gradient(to right, #10b981, #059669)"
                : "#333",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: name.trim().length > 0 ? "pointer" : "not-allowed",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (name.trim().length > 0) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (name.trim().length > 0) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            Next: Choose Avatar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)",
          border: "3px solid #fbbf24",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "500px",
          width: "90%",
          color: "white",
          textAlign: "center",
          boxShadow: "0 0 50px rgba(251, 191, 36, 0.5)",
        }}
      >
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
            marginBottom: "20px",
            color: "#bbb",
          }}
        >
          Welcome, <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{name}</span>!
        </p>

        {/* Avatar Preview */}
        <div
          style={{
            width: "150px",
            height: "150px",
            margin: "0 auto 20px",
            background: "#111",
            borderRadius: "50%",
            border: "3px solid #fbbf24",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)",
          }}
        >
          <img
            src={getAvatarUrl()}
            alt="Avatar"
            style={{ width: "160%", height: "160%", objectFit: "cover" }}
          />
        </div>

        {/* Avatar Style Selector */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#bbb" }}>
            Avatar Style:
          </label>
          <select
            value={avatarStyle}
            onChange={(e) => setAvatarStyle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "2px solid #444",
              background: "#1a1a1a",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {AVATAR_STYLES.map((style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1).replace("-", " ")}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={generateRandomAvatar}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            background: "linear-gradient(to right, #6366f1, #8b5cf6)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          🎲 Randomize Avatar
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setStep("name")}
            style={{
              flex: 1,
              padding: "12px",
              background: "#444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleComplete}
            style={{
              flex: 2,
              padding: "15px",
              background: "linear-gradient(to right, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ✅ Start Adventure!
          </button>
        </div>
      </div>
    </div>
  );
}
