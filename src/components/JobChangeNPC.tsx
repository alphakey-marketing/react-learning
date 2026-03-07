import React from "react";
import { JobClass, JOB_DATA, getAvailableJobs } from "../data/jobs";

interface JobChangeNPCProps {
  currentJob: JobClass;
  currentJobLevel: number;
  onJobChange: (newJob: JobClass) => void;
  onClose: () => void;
}

export function JobChangeNPC({
  currentJob,
  currentJobLevel,
  onJobChange,
  onClose,
}: JobChangeNPCProps) {
  const availableJobs = getAvailableJobs(currentJob, currentJobLevel);
  const currentJobInfo = JOB_DATA[currentJob];

  const [selectedJob, setSelectedJob] = React.useState<JobClass | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleSelectJob = (job: JobClass) => {
    setSelectedJob(job);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedJob) {
      onJobChange(selectedJob);
    }
  };

  const renderJobMap = () => (
    <div style={{ marginBottom: "20px", background: "#1a1a1a", padding: "15px", borderRadius: "8px", border: "1px solid #444" }}>
      <h3 style={{ fontSize: "14px", color: "#fbbf24", margin: "0 0 10px 0", textAlign: "center" }}>Job Progression Map</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { base: "Novice", first: "Swordsman", second: "Knight" },
          { base: "Novice", first: "Archer", second: "Hunter" },
          { base: "Novice", first: "Mage", second: "Wizard" },
        ].map((path, idx) => {
          // Highlight logic
          const isCurrentPath = currentJob === path.first || currentJob === path.second;
          const isBase = currentJob === "Novice";
          const opacity = isBase || isCurrentPath ? 1 : 0.4;
          
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "12px", opacity }}>
              <span style={{ 
                color: currentJob === path.base ? "#10b981" : "#888",
                fontWeight: currentJob === path.base ? "bold" : "normal" 
              }}>
                {JOB_DATA[path.base as JobClass].nameZh}
              </span>
              <span style={{ color: "#444" }}>→</span>
              <span style={{ 
                color: currentJob === path.first ? "#10b981" : availableJobs.includes(path.first as JobClass) ? "#fbbf24" : "#bbb",
                fontWeight: currentJob === path.first || availableJobs.includes(path.first as JobClass) ? "bold" : "normal"
              }}>
                {JOB_DATA[path.first as JobClass].nameZh}
              </span>
              <span style={{ color: "#444" }}>→</span>
              <span style={{ 
                color: currentJob === path.second ? "#10b981" : availableJobs.includes(path.second as JobClass) ? "#fbbf24" : "#bbb",
                fontWeight: currentJob === path.second || availableJobs.includes(path.second as JobClass) ? "bold" : "normal"
              }}>
                {JOB_DATA[path.second as JobClass].nameZh}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (availableJobs.length === 0) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            border: "2px solid #fbbf24",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            color: "white",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px 0",
              fontSize: "24px",
              color: "#fbbf24",
              textAlign: "center",
            }}
          >
            🧙 Job Change Master
          </h2>
          <p style={{ fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
            Greetings, {currentJobInfo.nameZh}!
          </p>

          {renderJobMap()}

          <p style={{ fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
            You need to reach <strong>Job Level {currentJob === 'Novice' ? 10 : 15}</strong> before you can change jobs.
          </p>
          <p style={{ fontSize: "12px", textAlign: "center", color: "#aaa" }}>
            Current Job Level: {currentJobLevel}
          </p>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "20px",
              background: "#444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation && selectedJob) {
    const selectedJobInfo = JOB_DATA[selectedJob];
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            border: "2px solid #dc2626",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            color: "white",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px 0",
              fontSize: "24px",
              color: "#dc2626",
              textAlign: "center",
            }}
          >
            ⚠️ Confirm Job Change
          </h2>
          <p style={{ fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
            Are you sure you want to become a <strong>{selectedJobInfo.nameZh}</strong>?
          </p>
          <div
            style={{
              background: "rgba(220, 38, 38, 0.1)",
              padding: "15px",
              borderRadius: "6px",
              marginBottom: "20px",
              border: "1px solid #dc2626",
            }}
          >
            <p style={{ fontSize: "13px", margin: "0 0 10px 0", fontWeight: "bold" }}>
              ⚠️ Classic RO Rules:
            </p>
            <ul style={{ fontSize: "12px", margin: 0, paddingLeft: "20px" }}>
              <li>Your Base Level will reset to 1</li>
              <li>Your Job Level will reset to 1</li>
              <li>Your stats will be reset (you'll get all stat points back)</li>
              <li>You'll keep your equipment and gold</li>
              <li>You'll unlock new skills for {selectedJobInfo.nameZh}</li>
            </ul>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowConfirmation(false)}
              style={{
                flex: 1,
                padding: "12px",
                background: "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                padding: "12px",
                background: "linear-gradient(45deg, #dc2626, #991b1b)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Confirm
            </button>
          </div>
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
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "2px solid #fbbf24",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "600px",
          width: "90%",
          color: "white",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: "24px",
            color: "#fbbf24",
            textAlign: "center",
          }}
        >
          🧙 Job Change Master
        </h2>
        
        {renderJobMap()}

        <p style={{ fontSize: "14px", textAlign: "center", marginBottom: "25px" }}>
          Congratulations on reaching <strong>Job Level {currentJobLevel}</strong>!
          <br />
          Choose your path:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {availableJobs.map((job) => {
            const jobInfo = JOB_DATA[job];
            return (
              <div
                key={job}
                style={{
                  background: "#2a2a2a",
                  border: "2px solid #444",
                  borderRadius: "8px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#fbbf24";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#444";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={() => handleSelectJob(job)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#fbbf24" }}>
                    {jobInfo.nameZh} ({jobInfo.name})
                  </h3>
                  <span
                    style={{
                      background: "#7c3aed",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Tier {jobInfo.tier}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#bbb", marginBottom: "15px" }}>
                  {jobInfo.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      background: "#1a1a1a",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
                      HP Bonus
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ef4444" }}>
                      {jobInfo.bonuses.hpMultiplier > 1
                        ? `+${((jobInfo.bonuses.hpMultiplier - 1) * 100).toFixed(0)}%`
                        : jobInfo.bonuses.hpMultiplier < 1
                        ? `${((jobInfo.bonuses.hpMultiplier - 1) * 100).toFixed(0)}%`
                        : "Normal"}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#1a1a1a",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
                      MP Bonus
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#3b82f6" }}>
                      {jobInfo.bonuses.mpMultiplier > 1
                        ? `+${((jobInfo.bonuses.mpMultiplier - 1) * 100).toFixed(0)}%`
                        : jobInfo.bonuses.mpMultiplier < 1
                        ? `${((jobInfo.bonuses.mpMultiplier - 1) * 100).toFixed(0)}%`
                        : "Normal"}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#1a1a1a",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
                      ATK Bonus
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#f59e0b" }}>
                      +{jobInfo.bonuses.atkBonus}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#1a1a1a",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
                      DEF Bonus
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#10b981" }}>
                      +{jobInfo.bonuses.defBonus}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
                    Recommended Stats:
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {jobInfo.statRecommendations.primary.map((stat) => (
                      <span
                        key={stat}
                        style={{
                          background: "#22c55e",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        {stat}
                      </span>
                    ))}
                    {jobInfo.statRecommendations.secondary.map((stat) => (
                      <span
                        key={stat}
                        style={{
                          background: "#6b7280",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "10px",
                          textTransform: "uppercase",
                        }}
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectJob(job);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
                    color: "#1a1a1a",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Choose {jobInfo.nameZh}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: "#444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Not Yet
        </button>
      </div>
    </div>
  );
}
