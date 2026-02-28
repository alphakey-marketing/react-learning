// Job progression tree and requirements
export type JobClass = "Novice" | "Swordsman" | "Mage" | "Archer" | "Knight" | "Wizard" | "Hunter";

export interface JobRequirement {
  minJobLevel: number;
  requiredItems?: { name: string; quantity: number }[];
  questCompleted?: boolean;
}

export interface JobInfo {
  id: JobClass;
  name: string;
  nameZh: string;
  description: string;
  tier: 1 | 2 | 3; // Novice=1, 1st Class=2, 2nd Class=3
  canChangeTo: JobClass[];
  requirements: JobRequirement;
  statRecommendations: {
    primary: string[];
    secondary: string[];
  };
  bonuses: {
    hpMultiplier: number;
    mpMultiplier: number;
    atkBonus: number;
    defBonus: number;
  };
}

export const JOB_DATA: Record<JobClass, JobInfo> = {
  Novice: {
    id: "Novice",
    name: "Novice",
    nameZh: "初心者",
    description: "A beginner adventurer with unlimited potential.",
    tier: 1,
    canChangeTo: ["Swordsman", "Mage", "Archer"],
    requirements: {
      minJobLevel: 1,
    },
    statRecommendations: {
      primary: ["str", "agi", "int"],
      secondary: ["vit", "dex"],
    },
    bonuses: {
      hpMultiplier: 1.0,
      mpMultiplier: 1.0,
      atkBonus: 0,
      defBonus: 0,
    },
  },
  Swordsman: {
    id: "Swordsman",
    name: "Swordsman",
    nameZh: "劍士",
    description: "A melee warrior specializing in close combat and high HP.",
    tier: 2,
    canChangeTo: ["Knight"],
    requirements: {
      minJobLevel: 10,
    },
    statRecommendations: {
      primary: ["str", "vit"],
      secondary: ["agi", "dex"],
    },
    bonuses: {
      hpMultiplier: 1.3,
      mpMultiplier: 0.9,
      atkBonus: 5,
      defBonus: 3,
    },
  },
  Mage: {
    id: "Mage",
    name: "Mage",
    nameZh: "魔法師",
    description: "A magic user with powerful elemental spells.",
    tier: 2,
    canChangeTo: ["Wizard"],
    requirements: {
      minJobLevel: 10,
    },
    statRecommendations: {
      primary: ["int", "dex"],
      secondary: ["vit"],
    },
    bonuses: {
      hpMultiplier: 0.8,
      mpMultiplier: 1.5,
      atkBonus: 0,
      defBonus: 0,
    },
  },
  Archer: {
    id: "Archer",
    name: "Archer",
    nameZh: "弓箭手",
    description: "A ranged attacker with high accuracy and critical rate.",
    tier: 2,
    canChangeTo: ["Hunter"],
    requirements: {
      minJobLevel: 10,
    },
    statRecommendations: {
      primary: ["dex", "agi"],
      secondary: ["str", "luk"],
    },
    bonuses: {
      hpMultiplier: 1.0,
      mpMultiplier: 1.0,
      atkBonus: 3,
      defBonus: 1,
    },
  },
  Knight: {
    id: "Knight",
    name: "Knight",
    nameZh: "騎士",
    description: "An advanced warrior with powerful melee skills and party support.",
    tier: 3,
    canChangeTo: [],
    requirements: {
      minJobLevel: 40,
    },
    statRecommendations: {
      primary: ["str", "vit"],
      secondary: ["agi"],
    },
    bonuses: {
      hpMultiplier: 1.5,
      mpMultiplier: 0.9,
      atkBonus: 10,
      defBonus: 5,
    },
  },
  Wizard: {
    id: "Wizard",
    name: "Wizard",
    nameZh: "巫師",
    description: "A master of magic with devastating AoE spells.",
    tier: 3,
    canChangeTo: [],
    requirements: {
      minJobLevel: 40,
    },
    statRecommendations: {
      primary: ["int", "dex"],
      secondary: ["vit"],
    },
    bonuses: {
      hpMultiplier: 0.7,
      mpMultiplier: 2.0,
      atkBonus: 0,
      defBonus: 0,
    },
  },
  Hunter: {
    id: "Hunter",
    name: "Hunter",
    nameZh: "獵人",
    description: "An expert marksman with traps and enhanced mobility.",
    tier: 3,
    canChangeTo: [],
    requirements: {
      minJobLevel: 40,
    },
    statRecommendations: {
      primary: ["dex", "agi"],
      secondary: ["str", "luk"],
    },
    bonuses: {
      hpMultiplier: 1.1,
      mpMultiplier: 1.1,
      atkBonus: 8,
      defBonus: 2,
    },
  },
};

// Helper functions
export function canChangeJob(currentJob: JobClass, currentJobLevel: number): boolean {
  const jobInfo = JOB_DATA[currentJob];
  const availableJobs = jobInfo.canChangeTo;
  
  if (availableJobs.length === 0) return false;
  
  // Check if any available job's requirements are met
  return availableJobs.some(targetJob => {
    const targetInfo = JOB_DATA[targetJob];
    return currentJobLevel >= targetInfo.requirements.minJobLevel;
  });
}

export function getAvailableJobs(currentJob: JobClass, currentJobLevel: number): JobClass[] {
  const jobInfo = JOB_DATA[currentJob];
  return jobInfo.canChangeTo.filter(targetJob => {
    const targetInfo = JOB_DATA[targetJob];
    return currentJobLevel >= targetInfo.requirements.minJobLevel;
  });
}

export function getJobBonuses(job: JobClass) {
  return JOB_DATA[job].bonuses;
}
