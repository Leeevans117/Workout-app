export type ExerciseCategory = 'mcgill' | 'strength' | 'cardio' | 'mobility';

export type AnimationType =
  | 'mcgill-curlup'
  | 'mcgill-sidebridge'
  | 'mcgill-birddog'
  | 'ebike'
  | 'spinning'
  | 'squat'
  | 'pushup'
  | 'row'
  | 'plank'
  | 'mobility';

export type CardioMode = 'ebike' | 'spinning';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  animationType: AnimationType;
  defaultSets: number;
  defaultReps?: number;
  defaultHoldSeconds?: number;
  defaultRestSeconds: number;
  prepCountdownSeconds?: number; // Mandatory 10s for McGill Big 3
  description: string;
  formCues: string[];
  targetedMuscles: string[];
  cardioChoiceRequired?: boolean;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  category: ExerciseCategory;
  durationMinutes: number;
  estimatedCalories: number;
  accentColor: 'blue' | 'emerald' | 'purple' | 'orange';
  isMcGillSpecial?: boolean;
  isCardioSpecial?: boolean;
  image?: string;
  exercises: Exercise[];
}

export type TimerPhase = 'prep' | 'active' | 'rest' | 'finished';

export interface HeartRateData {
  avgBpm: number;
  maxBpm?: number;
  source: 'ble' | 'manual';
  zone?: 'Zone 1 (Warmup)' | 'Zone 2 (Aerobic)' | 'Zone 3 (Tempo)' | 'Zone 4 (Threshold)' | 'Zone 5 (Peak)';
  rpe?: number; // 1-10 Rate of Perceived Exertion
}

export interface WorkoutLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  routineId: string;
  routineTitle: string;
  category: ExerciseCategory;
  durationSeconds: number;
  completedExercisesCount: number;
  cardioMode?: CardioMode;
  heartRate?: HeartRateData;
  notes?: string;
  timestamp: number;
}
