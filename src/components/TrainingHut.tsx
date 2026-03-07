import { useState } from "react";
import { Character } from "../types/character";
import { Enemy } from "../types/enemy";
import { EquippedItems } from "../types/equipment";
import { calculateDamage } from "../logic/combat";
import { SKILLS_DB } from "../data/skills";

interface TrainingHutProps {
  character: Character;
  equipped: EquippedItems;
  onClose: () => void;
}

interface CombatLog {
  skillName: string;
  finalDamage: number;
  isCrit: boolean;
  timestamp: number;
}

export function TrainingHut({ character, equipped, onClose }: TrainingHutProps) {
  const [enemyLevel, setEnemyLevel] = useState(character.level);
  const [enemyHP, setEnemyHP] = useState(100);
  const [enemyMaxHP, setEnemyMaxHP] = useState(100);
  const [enemyATK, setEnemyATK] = useState(20);
  const [enemySoftDef, setEnemySoftDef] = useState(10);
  const [enemyHardDefPercent, setEnemyHardDefPercent] = useState(20);
  const [enemySoftMdef, setEnemySoftMdef] = useState(10);
  const [enemyHardMdefPercent, setEnemyHardMdefPercent] = useState(20);
  const [enemyFlee, setEnemyFlee] = useState(100);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("basic_attack");
  
  const availableSkills = SKILLS_DB[character.jobClass].filter(
    (skill) => character.learnedSkills[skill.id] && character.learnedSkills[skill.id] > 0
  );
  
  const testEnemy: Enemy = {
    name: "Training Dummy",
    level: enemyLevel,
    hp: enemyHP,
    maxHp: enemyMaxHP,
    atk: enemyATK,
    softDef: enemySoftDef,
    hardDefPercent: enemyHardDefPercent,
    softMdef: enemySoftMdef,
    hardMdefPercent: enemyHardMdefPercent,
    flee: enemyFlee,
    attackSpeed: 0,
    count: 1,
  };
  
  const handleTestAttack = () => {
    const skill = SKILLS_DB[character.jobClass].find((s) => s.id === selectedSkill);
    if (!skill) return;
    
    const skillLevel = character.learnedSkills[selectedSkill] || 1;
    const result = calculateDamage(character, testEnemy, skill, skillLevel, equipped);
    
    const log: CombatLog = {
      skillName: `${skill.nameZh} Lv.${skillLevel}`,
      finalDamage: result.damage,
      isCrit: result.isCrit,
      timestamp: Date.now(),
    };
    
    setCombatLogs((prev) => [log, ...prev].slice(0, 10));
    setEnemyHP(Math.max(0, enemyHP - result.damage));
  };
  
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "3px solid #f59e0b",
          borderRadius: "12px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          color: "white",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "2px solid #f59e0b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#fbbf24", fontSize: "24px" }}>
            🎯 Training Hut
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
        
        <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <h3 style={{ color: "#fbbf24", marginTop: 0 }}>🎭 Dummy Stats</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px" }}>HP: {enemyHP} / {enemyMaxHP}</span>
              </div>
              <div style={{ width: "100%", height: "20px", background: "#333", borderRadius: "4px" }}>
                <div
                  style={{
                    width: `${(enemyHP / enemyMaxHP) * 100}%`,
                    height: "100%",
                    background: "#22c55e",
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label>Max HP: {enemyMaxHP}</label>
                <input type="range" min={50} max={2000} step={50} value={enemyMaxHP}
                  onChange={(e) => { setEnemyMaxHP(Number(e.target.value)); setEnemyHP(Number(e.target.value)); }}
                  style={{ width: "100%" }} />
              </div>
              <div>
                <label>ATK: {enemyATK}</label>
                <input type="range" min={5} max={500} step={5} value={enemyATK}
                  onChange={(e) => setEnemyATK(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label>Soft DEF: {enemySoftDef}</label>
                <input type="range" min={0} max={200} step={5} value={enemySoftDef}
                  onChange={(e) => setEnemySoftDef(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label>Hard DEF %: {enemyHardDefPercent}</label>
                <input type="range" min={0} max={99} step={1} value={enemyHardDefPercent}
                  onChange={(e) => setEnemyHardDefPercent(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label>Soft MDEF: {enemySoftMdef}</label>
                <input type="range" min={0} max={200} step={5} value={enemySoftMdef}
                  onChange={(e) => setEnemySoftMdef(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label>Hard MDEF %: {enemyHardMdefPercent}</label>
                <input type="range" min={0} max={99} step={1} value={enemyHardMdefPercent}
                  onChange={(e) => setEnemyHardMdefPercent(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div>
                <label>Flee: {enemyFlee}</label>
                <input type="range" min={0} max={500} step={10} value={enemyFlee}
                  onChange={(e) => setEnemyFlee(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
            </div>
          </div>
          
          <div>
            <h3 style={{ color: "#fbbf24", marginTop: 0 }}>⚔️ Combat Test</h3>
            
            <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
              {availableSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>{skill.nameZh}</option>
              ))}
            </select>
            
            <button onClick={handleTestAttack} disabled={enemyHP <= 0}
              style={{ width: "100%", padding: "12px", background: "#f59e0b", marginBottom: "10px" }}>
              Test Attack
            </button>
            
            <button onClick={() => { setEnemyHP(enemyMaxHP); setCombatLogs([]); }}
              style={{ width: "100%", padding: "12px", background: "#22c55e" }}>
              Reset
            </button>
            
            <div style={{ marginTop: "20px" }}>
              <h4>Combat Log</h4>
              {combatLogs.map((log) => (
                <div key={log.timestamp} style={{ padding: "8px", background: "#2a2a2a", marginBottom: "4px" }}>
                  {log.skillName}: {log.finalDamage} dmg {log.isCrit && "CRIT!"}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
