import React from 'react';
import { Character } from '../types/character';
import { getAvailableStatPoints } from '../logic/progression';

interface CharacterSheetProps {
  character: Character;
  onAllocateStat?: (stat: keyof Character['stats']) => void;
  combatStats: {
    minAtk: number;
    maxAtk: number;
    softDef: number;
    hardDefPercent: number;
    maxHp: number;
    maxMp: number;
    aspd: number;
    crit: number;
    matk: number;
  };
}

export function CharacterSheet({ character, onAllocateStat, combatStats }: CharacterSheetProps) {
  const availablePoints = getAvailableStatPoints(character);

  const renderStatRow = (
    stat: keyof Character['stats'],
    label: string,
    value: number,
    tooltip: string
  ) => {
    // Highlight when a stat reaches a major power spike (multiple of 10)
    const isSpike = value > 1 && value % 10 === 0;
    const isNearSpike = value % 10 === 9;

    return (
      <div className="flex items-center justify-between py-1 group relative">
        <div className="flex items-center gap-2">
          <span className="font-medium w-12 text-gray-300" title={tooltip}>
            {label}
          </span>
          <span className={`w-8 text-right font-mono ${isSpike ? 'text-yellow-400 font-bold' : ''}`}>
            {value}
          </span>
          {isSpike && (
            <span className="text-xs text-yellow-500 ml-1" title="Power Spike Reached!">
              ⭐
            </span>
          )}
          {isNearSpike && (
            <span className="text-xs text-blue-400 ml-1 animate-pulse" title="1 point away from Power Spike!">
              ⬆️
            </span>
          )}
        </div>
        
        {onAllocateStat && (
          <button
            onClick={() => onAllocateStat(stat)}
            disabled={availablePoints <= 0}
            className={`
              w-6 h-6 flex items-center justify-center rounded text-sm font-bold
              ${availablePoints > 0 
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            +
          </button>
        )}

        {/* Custom Tooltip */}
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 border border-gray-700 rounded shadow-xl text-xs text-gray-300 z-10">
          {tooltip}
          {['str', 'int', 'dex'].includes(stat) && (
            <div className="mt-1 pt-1 border-t border-gray-700 text-blue-400 font-medium">
              Tip: Reaching multiples of 10 (20, 30, 40...) unlocks massive bonus damage!
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{character.jobClass}</h2>
          <div className="text-gray-400 text-sm">
            Lv. {character.level} {character.jobClass}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Gold</div>
          <div className="text-yellow-400 font-bold">{character.gold.toLocaleString()} g</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column: Core Stats */}
        <div className="bg-gray-900 p-3 rounded border border-gray-800">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
            <h3 className="font-bold text-gray-300">Stats</h3>
            {availablePoints > 0 && (
              <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full animate-pulse">
                {availablePoints} Pts
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {renderStatRow('str', 'STR', character.stats.str, 'Strength: Increases physical attack power. Highly effective for Swordsmen and Merchants.')}
            {renderStatRow('agi', 'AGI', character.stats.agi, 'Agility: Increases attack speed and dodge rate.')}
            {renderStatRow('vit', 'VIT', character.stats.vit, 'Vitality: Increases Max HP and reduces physical damage taken.')}
            {renderStatRow('int', 'INT', character.stats.int, 'Intelligence: Increases magic attack and Max MP. Essential for Mages.')}
            {renderStatRow('dex', 'DEX', character.stats.dex, 'Dexterity: Increases accuracy, attack speed, and stabilizes weapon damage. Crucial for Archers.')}
            {renderStatRow('luk', 'LUK', character.stats.luk, 'Luck: Increases critical hit rate and perfect dodge.')}
          </div>

          {/* Educational Note about Stat Breakpoints */}
          <div className="mt-4 p-2 bg-blue-900/30 border border-blue-800 rounded text-xs text-blue-200">
            <span className="block font-bold text-blue-400 mb-1">💡 Pro Tip: Stat Breakpoints</span>
            Focus your main stats! Hitting multiples of 10 (30, 40, 50) grants massive bonus power.
            <br/><span className="text-gray-400 mt-1 block">Example: STR 49 gives +16 Attack, but STR 50 jumps to +25 Attack!</span>
          </div>
        </div>

        {/* Right Column: Combat Stats */}
        <div className="bg-gray-900 p-3 rounded border border-gray-800">
          <h3 className="font-bold text-gray-300 mb-2 pb-2 border-b border-gray-800">Combat</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">HP</span>
              <span className="font-mono text-green-400">{combatStats.maxHp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MP</span>
              <span className="font-mono text-blue-400">{combatStats.maxMp}</span>
            </div>
            
            <div className="my-2 border-t border-gray-800 pt-2"></div>
            
            <div className="flex justify-between group relative">
              <span className="text-gray-400 cursor-help border-b border-gray-600 border-dotted">ATK</span>
              <span className="font-mono text-white">
                {combatStats.minAtk === combatStats.maxAtk 
                  ? combatStats.maxAtk 
                  : `${combatStats.minAtk} ~ ${combatStats.maxAtk}`}
              </span>
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-gray-800 text-xs text-gray-300 rounded shadow-lg z-10">
                Physical Damage. High DEX reduces the gap between minimum and maximum damage.
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">MATK</span>
              <span className="font-mono text-purple-400">{combatStats.matk}</span>
            </div>
            
            <div className="flex justify-between group relative">
              <span className="text-gray-400 cursor-help border-b border-gray-600 border-dotted">DEF</span>
              <span className="font-mono text-orange-300">
                {combatStats.softDef} + {combatStats.hardDefPercent}%
              </span>
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-gray-800 text-xs text-gray-300 rounded shadow-lg z-10">
                Reduces physical damage. Left number (from VIT) subtracts flat damage. Right number (from Armor) reduces damage by a percentage.
              </div>
            </div>
            
            <div className="my-2 border-t border-gray-800 pt-2"></div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">ASPD</span>
              <span className="font-mono text-yellow-200">{combatStats.aspd.toFixed(2)}/s</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">CRIT</span>
              <span className="font-mono text-red-400">{combatStats.crit}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}