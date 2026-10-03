import { WorkoutRoutine, Exercise } from '../types/workout';

// 1. PURE McGILL BIG 3 (Strictly the 3 core stability exercises, Cat-Camel removed)
export const MCGILL_BIG_3_ROUTINE: WorkoutRoutine = {
  id: 'mcgill-big-3',
  title: 'McGill Big 3',
  subtitle: 'Dr. Stuart McGill Spine Stability Protocol',
  tag: 'Spine Hygiene',
  category: 'mcgill',
  durationMinutes: 15,
  estimatedCalories: 95,
  accentColor: 'purple',
  isMcGillSpecial: true,
  image: '/src/assets/images/mcgill_spine_anatomy_1791025454520.jpg',
  exercises: [
    {
      id: 'mcgill-curl-up',
      name: 'McGill Modified Curl-Up',
      category: 'mcgill',
      animationType: 'mcgill-curlup',
      defaultSets: 4,
      defaultReps: 5,
      defaultHoldSeconds: 10,
      defaultRestSeconds: 25,
      prepCountdownSeconds: 10, // Mandatory 10s prep countdown
      description: 'Activates the rectus abdominis while strictly maintaining lumbar lordosis. Hands stay under lower back.',
      formCues: [
        'Hands palms-down under lumbar spine to ensure spine does NOT flatten',
        'One knee bent at 90°, other leg extended flat on floor',
        'Lift only head and upper shoulders as a solid block; pivot around thoracic spine',
        'Hold each repetition for exactly 10 seconds while breathing normally',
        'No chin poking; maintain tongue on roof of mouth'
      ],
      targetedMuscles: ['Rectus Abdominis', 'External Obliques', 'Deep Cervical Flexors']
    },
    {
      id: 'mcgill-side-bridge',
      name: 'McGill Side Bridge',
      category: 'mcgill',
      animationType: 'mcgill-sidebridge',
      defaultSets: 4,
      defaultReps: 5,
      defaultHoldSeconds: 10,
      defaultRestSeconds: 25,
      prepCountdownSeconds: 10, // Mandatory 10s prep countdown
      description: 'Strengthens quadratus lumborum and lateral obliques with minimal spinal compression.',
      formCues: [
        'Prop on elbow directly under shoulder; knees bent at 90° or stacked feet',
        'Bridge hips upward until body forms an unbroken straight diagonal line',
        'Brace abdominal wall firmly before lifting; avoid any pelvic rotation',
        'Hold for 10 seconds with calm controlled breathing'
      ],
      targetedMuscles: ['Quadratus Lumborum', 'Internal & External Obliques', 'Gluteus Medius']
    },
    {
      id: 'mcgill-bird-dog',
      name: 'McGill Bird Dog',
      category: 'mcgill',
      animationType: 'mcgill-birddog',
      defaultSets: 4,
      defaultReps: 5,
      defaultHoldSeconds: 10,
      defaultRestSeconds: 25,
      prepCountdownSeconds: 10, // Mandatory 10s prep countdown
      description: 'Strengthens posterior chain (erectors, glutes, lats) while maintaining anti-rotational stiffness.',
      formCues: [
        'Start in quadruped: hands under shoulders, knees under hips with neutral spine',
        'Clench opposite fist and kick opposite heel straight back without arching lower back',
        'Raise arm and leg parallel to floor; hold solid for 10 seconds',
        'Sweep back to touch hand and knee gently before extending or alternating'
      ],
      targetedMuscles: ['Erector Spinae', 'Gluteus Maximus', 'Latissimus Dorsi', 'Posterior Deltoid']
    }
  ]
};

// 2. STRENGTH (All non-McGill exercises unified under 1 single session name "Strength")
export const STRENGTH_ROUTINE: WorkoutRoutine = {
  id: 'strength',
  title: 'Strength',
  subtitle: 'Full-Body Resistance & Postural Stability',
  tag: 'Strength',
  category: 'strength',
  durationMinutes: 32,
  estimatedCalories: 310,
  accentColor: 'emerald',
  image: '/src/assets/images/workout_hero_banner_1791025439820.jpg',
  exercises: [
    {
      id: 'pushup-press',
      name: 'Push-Ups / Floor Press',
      category: 'strength',
      animationType: 'pushup',
      defaultSets: 3,
      defaultReps: 10,
      defaultHoldSeconds: 30,
      defaultRestSeconds: 45,
      prepCountdownSeconds: 10,
      description: 'Horizontal pressing with strict spinal plank stiffness and 45° elbow alignment.',
      formCues: [
        'Hands slightly wider than shoulders, screw palms into floor',
        'Lower body as a rigid plank until chest hovers 1 inch off floor',
        'Drive through palms to press back up without sagging hips'
      ],
      targetedMuscles: ['Pectoralis Major', 'Triceps Brachii', 'Anterior Deltoid', 'Core Stabilizers']
    },
    {
      id: 'bent-over-row',
      name: 'Dumbbell Rows',
      category: 'strength',
      animationType: 'row',
      defaultSets: 3,
      defaultReps: 12,
      defaultHoldSeconds: 35,
      defaultRestSeconds: 45,
      prepCountdownSeconds: 10,
      description: 'Hinged posterior pull targeting lats and rhomboids with spine in safe neutral posture.',
      formCues: [
        'Hinge at hips with flat back; torso at 45° angle',
        'Pull elbows toward hips and squeeze shoulder blades at top',
        'Control descent smoothly; do not round thoracic spine'
      ],
      targetedMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Biceps']
    },
    {
      id: 'goblet-squats',
      name: 'Goblet Squats',
      category: 'strength',
      animationType: 'squat',
      defaultSets: 3,
      defaultReps: 12,
      defaultHoldSeconds: 40,
      defaultRestSeconds: 60,
      prepCountdownSeconds: 10,
      description: 'Upright torso squat pattern reinforcing knee tracking and hip mobility.',
      formCues: [
        'Hold weight snug against chest at collarbone level',
        'Push knees out over toes; descend to parallel with flat spine',
        'Drive through whole foot to stand; lock glutes at top'
      ],
      targetedMuscles: ['Quadriceps', 'Gluteus Maximus', 'Adductors', 'Core Bracing']
    },
    {
      id: 'glute-bridges',
      name: 'Glute Bridges',
      category: 'strength',
      animationType: 'plank',
      defaultSets: 3,
      defaultReps: 12,
      defaultHoldSeconds: 30,
      defaultRestSeconds: 45,
      prepCountdownSeconds: 10,
      description: 'Isolated glute extension without hyperextending lumbar spine.',
      formCues: [
        'Feet flat on floor hip-width apart; drive through heels',
        'Lift hips until thighs and torso align; squeeze glutes tight for 2 seconds',
        'Keep ribs down and core engaged'
      ],
      targetedMuscles: ['Gluteus Maximus', 'Hamstrings', 'Lower Back Stabilizers']
    },
    {
      id: 'plank-lock',
      name: 'Forearm Pillar Plank',
      category: 'strength',
      animationType: 'plank',
      defaultSets: 3,
      defaultReps: 1,
      defaultHoldSeconds: 45,
      defaultRestSeconds: 45,
      prepCountdownSeconds: 10,
      description: 'Anti-extension static isometric hold reinforcing total torso stiffness.',
      formCues: [
        'Elbows directly below shoulders, forearms parallel',
        'Squeeze glutes and quads; isometrically pull elbows toward toes',
        'Breathe calmly while maintaining 100% stiffness'
      ],
      targetedMuscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Gluteals']
    }
  ]
};

// 3. CARDIO SESSION (E-Bike vs. Spinning Indoors)
export const CARDIO_ROUTINE: WorkoutRoutine = {
  id: 'cardio-session',
  title: 'Cardio',
  subtitle: 'E-Bike Outdoor or Spinning Indoors',
  tag: 'Cardio & Stamina',
  category: 'cardio',
  durationMinutes: 35,
  estimatedCalories: 340,
  accentColor: 'blue',
  isCardioSpecial: true,
  image: '/src/assets/images/ebike_outdoor_trail_1791025466648.jpg',
  exercises: [
    {
      id: 'cardio-ride',
      name: 'E-Bike / Spinning Workout',
      category: 'cardio',
      animationType: 'ebike',
      cardioChoiceRequired: true,
      defaultSets: 3,
      defaultHoldSeconds: 600, // 10 min intervals
      defaultRestSeconds: 90,
      prepCountdownSeconds: 10,
      description: 'Low-impact cardiovascular conditioning with selectable outdoor E-Bike or indoor Spinning setup.',
      formCues: [
        'Maintain relaxed shoulders and light grip on handlebars',
        'Pedal in smooth 360-degree circles; engage hamstrings on upstroke',
        'Maintain abdominal brace to prevent lower back sway',
        'Target cadence 80 - 100 RPM for optimal efficiency'
      ],
      targetedMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Cardiovascular System']
    }
  ]
};

export const WORKOUT_ROUTINES: WorkoutRoutine[] = [
  MCGILL_BIG_3_ROUTINE,
  STRENGTH_ROUTINE,
  CARDIO_ROUTINE
];

// Weekly Schedule configuration mapping 0 (Sunday) to 6 (Saturday)
export interface DaySchedule {
  dayName: string;
  dayShort: string;
  plannedRoutines: {
    routineId: string;
    routineTitle: string;
    tag: string;
    category: 'mcgill' | 'strength' | 'cardio';
    durationMinutes: number;
    color: string;
  }[];
  isRestDay?: boolean;
}

export const WEEKLY_SCHEDULE: Record<number, DaySchedule> = {
  0: { // Sunday
    dayName: 'Sunday',
    dayShort: 'Sun',
    plannedRoutines: [
      {
        routineId: 'mcgill-big-3',
        routineTitle: 'McGill Big 3',
        tag: 'Spine Hygiene',
        category: 'mcgill',
        durationMinutes: 15,
        color: 'purple'
      }
    ],
    isRestDay: false
  },
  1: { // Monday
    dayName: 'Monday',
    dayShort: 'Mon',
    plannedRoutines: [
      {
        routineId: 'mcgill-big-3',
        routineTitle: 'McGill Big 3',
        tag: 'Spine Hygiene',
        category: 'mcgill',
        durationMinutes: 15,
        color: 'purple'
      },
      {
        routineId: 'strength',
        routineTitle: 'Strength',
        tag: 'Resistance',
        category: 'strength',
        durationMinutes: 32,
        color: 'emerald'
      }
    ]
  },
  2: { // Tuesday
    dayName: 'Tuesday',
    dayShort: 'Tue',
    plannedRoutines: [
      {
        routineId: 'cardio-session',
        routineTitle: 'Cardio (E-Bike / Spinning)',
        tag: 'Cardio',
        category: 'cardio',
        durationMinutes: 35,
        color: 'blue'
      }
    ]
  },
  3: { // Wednesday
    dayName: 'Wednesday',
    dayShort: 'Wed',
    plannedRoutines: [
      {
        routineId: 'mcgill-big-3',
        routineTitle: 'McGill Big 3',
        tag: 'Spine Hygiene',
        category: 'mcgill',
        durationMinutes: 15,
        color: 'purple'
      }
    ]
  },
  4: { // Thursday
    dayName: 'Thursday',
    dayShort: 'Thu',
    plannedRoutines: [
      {
        routineId: 'strength',
        routineTitle: 'Strength',
        tag: 'Resistance',
        category: 'strength',
        durationMinutes: 32,
        color: 'emerald'
      }
    ]
  },
  5: { // Friday
    dayName: 'Friday',
    dayShort: 'Fri',
    plannedRoutines: [
      {
        routineId: 'mcgill-big-3',
        routineTitle: 'McGill Big 3',
        tag: 'Spine Hygiene',
        category: 'mcgill',
        durationMinutes: 15,
        color: 'purple'
      },
      {
        routineId: 'cardio-session',
        routineTitle: 'Cardio (E-Bike / Spinning)',
        tag: 'Cardio',
        category: 'cardio',
        durationMinutes: 35,
        color: 'blue'
      }
    ]
  },
  6: { // Saturday
    dayName: 'Saturday',
    dayShort: 'Sat',
    plannedRoutines: [
      {
        routineId: 'mcgill-big-3',
        routineTitle: 'McGill Big 3',
        tag: 'Spine Hygiene',
        category: 'mcgill',
        durationMinutes: 15,
        color: 'purple'
      },
      {
        routineId: 'strength',
        routineTitle: 'Strength',
        tag: 'Resistance',
        category: 'strength',
        durationMinutes: 32,
        color: 'emerald'
      }
    ]
  }
};
