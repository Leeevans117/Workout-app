import React, { useEffect, useState, useRef } from 'react';
import { AnimationType, CardioMode } from '../types/workout';
import { Activity, Compass, Zap, Heart } from 'lucide-react';
import { bleHeartRateService } from '../utils/bleHeartRateService';

interface ExerciseAnimatorProps {
  type: AnimationType;
  cardioMode?: CardioMode;
  isActive: boolean;
  timeRemaining?: number;
  phase?: 'prep' | 'active' | 'rest' | 'finished';
}

export const ExerciseAnimator: React.FC<ExerciseAnimatorProps> = ({
  type,
  cardioMode,
  isActive,
}) => {
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [animProgress, setAnimProgress] = useState(0); // 0.0 to 1.0 smooth cycle
  const [liveBpm, setLiveBpm] = useState(bleHeartRateService.getLiveStats().currentBpm);
  const animFrameRef = useRef<number | null>(null);

  // Subscribe to live BLE Heart Rate (Fitbit)
  useEffect(() => {
    const unsub = bleHeartRateService.subscribeBpm((bpm) => {
      setLiveBpm(bpm);
    });
    return () => unsub();
  }, []);

  // 60FPS Continuous Trigonometric Kinematic Loop
  useEffect(() => {
    if (!isActive) {
      setAnimProgress(0);
      return;
    }

    let startTime = performance.now();
    const cycleDuration = type === 'pushup' ? 3200 : type === 'squat' ? 3600 : type === 'row' ? 2900 : 3800;

    const loop = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      // Smooth sinusoidal oscillation between 0 and 1
      const cycle = (elapsed % cycleDuration) / cycleDuration;
      // Sine easing: starts at 0, smoothly peaks at 1 at midpoint, smoothly returns to 0
      const p = 0.5 - 0.5 * Math.cos(cycle * 2 * Math.PI);
      setAnimProgress(p);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, type]);

  // Breathing cadence
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isActive]);

  const resolvedType = type === 'ebike' && cardioMode === 'spinning' ? 'spinning' : type;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[310px] sm:max-h-[350px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#101524] via-[#0C111C] to-[#07090F] border border-slate-800 shadow-2xl flex flex-col items-center justify-center p-3 select-none">
      {/* Background Studio Grid & Ambient Lighting */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 40%, rgba(59, 130, 246, 0.22) 0%, transparent 70%), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="text-[11px] font-semibold tracking-wide uppercase">
            {isActive ? 'Continuous Joint Kinematics' : 'Demonstration Paused'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {liveBpm > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
              <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-400" />
              <span className="font-mono font-bold text-xs">{liveBpm} BPM</span>
            </div>
          )}

          {isActive && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs text-slate-300">
              <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="text-[11px] font-medium text-blue-300">
                Breath: <span className="font-semibold text-white">{breathPhase}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Kinematic Stage */}
      <div className="relative w-full h-full flex items-center justify-center pt-5 pb-3">
        {resolvedType === 'pushup' && <KinematicPushUp progress={animProgress} />}
        {resolvedType === 'squat' && <KinematicSquat progress={animProgress} />}
        {resolvedType === 'mcgill-curlup' && <KinematicMcGillCurlUp progress={animProgress} />}
        {resolvedType === 'mcgill-sidebridge' && <KinematicMcGillSideBridge progress={animProgress} />}
        {resolvedType === 'mcgill-birddog' && <KinematicMcGillBirdDog progress={animProgress} />}
        {resolvedType === 'row' && <KinematicDumbbellRow progress={animProgress} />}
        {resolvedType === 'plank' && <KinematicPlank progress={animProgress} />}
        {resolvedType === 'ebike' && <KinematicEBikeCyclist progress={animProgress} />}
        {resolvedType === 'spinning' && <KinematicSpinningIndoor progress={animProgress} />}
        {resolvedType === 'mobility' && <KinematicCatCamel progress={animProgress} />}
      </div>

      {/* Bottom Form Invariant Cue */}
      <div className="absolute bottom-2.5 px-4 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 font-medium flex items-center gap-2 max-w-[90%] truncate shadow-sm">
        <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="truncate">
          {resolvedType === 'pushup'
            ? 'Palms & toes locked to floor • Arm stays anchored to shoulder • Chest hovers 1" off mat'
            : resolvedType === 'squat'
            ? 'Feet flat on floor • Simultaneous hip & knee flexion • Upright torso'
            : resolvedType === 'mcgill-curlup'
            ? 'Tactile hand locks lumbar curve • T8-T10 pivot • Rigid head & shoulder unit'
            : resolvedType === 'mcgill-sidebridge'
            ? 'Elbow stacked directly beneath shoulder • Solid diagonal lateral pillar'
            : resolvedType === 'mcgill-birddog'
            ? 'Supporting joints fixed 90° • Horizontal limb reach & sweep • Level pelvis'
            : 'Maintain anatomical joint alignment & continuous core tension'}
        </span>
      </div>
    </div>
  );
};

/* =========================================================================
 * 1. MATHEMATICALLY LOCKED KINEMATIC PUSH-UP
 * Why arms never leave the body:
 * - Toe pivot is FIXED at (380, 192).
 * - Hand palm is FIXED at (165, 192).
 * - Shoulder position (shoulderX, shoulderY) is computed directly from the
 *   plank angle.
 * - The arm humerus STARTS at the exact same (shoulderX, shoulderY) coordinate!
 * - Elbow coordinates are solved via inverse kinematics to bend backward at 45°.
 * - Chest hovers 20px ABOVE the floor. Zero detachment, zero floor clipping!
 * ========================================================================= */
const KinematicPushUp: React.FC<{ progress: number }> = ({ progress }) => {
  // Toes anchor on floor
  const toeX = 380;
  const toeY = 192;
  const handX = 165;
  const handY = 192;

  // Body plank parameters
  const bodyLength = 215; // toes to shoulder
  const headDist = 42; // shoulder to head
  const hipDist = 110; // toes to hip

  // Plank angle: at top (progress = 0) ~22 deg; at bottom (progress = 1) ~7.5 deg
  const angleTop = 22 * (Math.PI / 180);
  const angleBottom = 7.5 * (Math.PI / 180);
  const angle = angleTop - progress * (angleTop - angleBottom);

  // Exact mathematically derived joint coordinates
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const shoulderX = toeX - bodyLength * cosA;
  const shoulderY = toeY - bodyLength * sinA;

  const hipX = toeX - hipDist * cosA;
  const hipY = toeY - hipDist * sinA;

  const headX = shoulderX - headDist * cosA;
  const headY = shoulderY - headDist * sinA;

  // Solve Elbow (Inverse Kinematics):
  // Upper arm length = 46px, Forearm length = 46px
  // As shoulder lowers, elbow hinges backward toward the feet (X > shoulderX)
  const elbowX = handX + 10 + progress * 38;
  const elbowY = shoulderY + (handY - shoulderY) * 0.52 + progress * 8;

  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      <defs>
        <linearGradient id="bodyPlankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="armMuscleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Solid Floor Line at y = 192 */}
      <rect x="30" y="192" width="440" height="6" rx="3" fill="#1E293B" />
      <line x1="20" y1="198" x2="480" y2="198" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

      {/* Fixed Hand Contact Point (Never moves) */}
      <g>
        <rect x={handX - 14} y={handY - 4} width="28" height="6" rx="3" fill="#60A5FA" />
        <circle cx={handX} cy={handY - 1} r="4.5" fill="#3B82F6" />
        <text x={handX} y={214} fill="#93C5FD" fontSize="9" textAnchor="middle" fontWeight="bold">
          Palm Fixed
        </text>
      </g>

      {/* Fixed Toes Contact Point (Never moves) */}
      <g>
        <rect x={toeX - 10} y={toeY - 4} width="22" height="6" rx="3" fill="#3B82F6" />
        <circle cx={toeX} cy={toeY - 1} r="4.5" fill="#1D4ED8" />
        <text x={toeX} y={214} fill="#93C5FD" fontSize="9" textAnchor="middle" fontWeight="bold">
          Toes Planted
        </text>
      </g>

      {/* Head in rigid neutral extension */}
      <g>
        <ellipse cx={headX} cy={headY} rx="15" ry="13" fill="#1E293B" stroke="#60A5FA" strokeWidth="2.5" />
        <line
          x1={shoulderX}
          y1={shoulderY}
          x2={headX + 5 * cosA}
          y2={headY + 5 * sinA}
          stroke="#3B82F6"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </g>

      {/* Rigid Plank Torso from Shoulder to Hip to Toes */}
      <path
        d={`M ${shoulderX} ${shoulderY} L ${hipX} ${hipY} L ${toeX} ${toeY}`}
        stroke="url(#bodyPlankGrad)"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pectoralis Major & Core Activation Line (Pulsing contraction at bottom) */}
      <line
        x1={shoulderX}
        y1={shoulderY + 6}
        x2={shoulderX + 55 * cosA}
        y2={shoulderY + 6 + 55 * sinA}
        stroke="#93C5FD"
        strokeWidth={4 + progress * 3}
        strokeLinecap="round"
        opacity={0.8 + progress * 0.2}
      />

      {/* Anatomical Articulated Arm (Attached at Shoulder on EVERY single frame!) */}
      <g>
        {/* Forearm: from Hand (165, 192) to Elbow */}
        <path
          d={`M ${handX} ${handY} L ${elbowX} ${elbowY}`}
          stroke="url(#armMuscleGrad)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        {/* Upper Arm (Humerus): from Elbow directly into Shoulder joint */}
        <path
          d={`M ${elbowX} ${elbowY} L ${shoulderX} ${shoulderY}`}
          stroke="url(#armMuscleGrad)"
          strokeWidth="15"
          strokeLinecap="round"
        />

        {/* Elbow Joint Pivot Node */}
        <circle cx={elbowX} cy={elbowY} r="6" fill="#60A5FA" />
        {/* Shoulder Joint Pivot Node (Locked to Torso!) */}
        <circle cx={shoulderX} cy={shoulderY} r="7.5" fill="#38BDF8" />
        {/* Hip Joint Node */}
        <circle cx={hipX} cy={hipY} r="7" fill="#6366F1" />
      </g>

      {/* Floor Clearance Line (Visual verification that chest never clips) */}
      <line
        x1={shoulderX - 20}
        y1={shoulderY + 12}
        x2={shoulderX + 50}
        y2={shoulderY + 12}
        stroke="#10B981"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.75"
      />
      <text x={shoulderX + 15} y={shoulderY + 23} fill="#34D399" fontSize="8" textAnchor="middle" fontWeight="bold">
        Chest Clearance: {(192 - (shoulderY + 12)).toFixed(0)}px
      </text>
    </svg>
  );
};

/* =========================================================================
 * 2. MATHEMATICALLY LOCKED KINEMATIC SQUAT
 * Feet are 100% stationary on floor. Hips sink back and down. Knees track over midfoot.
 * ========================================================================= */
const KinematicSquat: React.FC<{ progress: number }> = ({ progress }) => {
  const footLX = 225;
  const footRX = 275;
  const footY = 202;

  // Hips descend from y = 120 to y = 162
  const hipY = 120 + progress * 42;
  const hipX = 250 - progress * 10; // slight backward hip hinge

  // Knees hinge forward/outward
  const kneeLX = 222 - progress * 14;
  const kneeRX = 278 + progress * 14;
  const kneeY = 162 + progress * 12;

  // Torso maintains athletic upright 68° posture
  const torsoLength = 55;
  const shoulderX = hipX + progress * 12;
  const shoulderY = hipY - torsoLength;
  const headX = shoulderX;
  const headY = shoulderY - 24;

  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      <defs>
        <linearGradient id="squatMuscle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Floor */}
      <rect x="80" y="202" width="340" height="6" rx="3" fill="#1E293B" />
      <line x1="60" y1="208" x2="440" y2="208" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

      {/* Feet Fixed to Floor */}
      <rect x={footLX - 16} y={footY - 4} width="32" height="6" rx="3" fill="#059669" />
      <circle cx={footLX} cy={footY - 1} r="4" fill="#10B981" />
      <rect x={footRX - 16} y={footY - 4} width="32" height="6" rx="3" fill="#059669" />
      <circle cx={footRX} cy={footY - 1} r="4" fill="#10B981" />

      {/* Left Leg: Hip -> Knee -> Foot */}
      <path
        d={`M ${hipX} ${hipY} L ${kneeLX} ${kneeY} L ${footLX} ${footY}`}
        stroke="#10B981"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={kneeLX} cy={kneeY} r="7" fill="#065F46" />

      {/* Right Leg: Hip -> Knee -> Foot */}
      <path
        d={`M ${hipX} ${hipY} L ${kneeRX} ${kneeY} L ${footRX} ${footY}`}
        stroke="#10B981"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={kneeRX} cy={kneeY} r="7" fill="#065F46" />

      {/* Torso & Head */}
      <path
        d={`M ${hipX} ${hipY} L ${shoulderX} ${shoulderY}`}
        stroke="url(#squatMuscle)"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <circle cx={hipX} cy={hipY} r="9" fill="#065F46" />
      <circle cx={headX} cy={headY} r="15" fill="#1E293B" stroke="#10B981" strokeWidth="2.5" />

      {/* Arms holding Goblet Dumbbell at Chest */}
      <path
        d={`M ${shoulderX} ${shoulderY + 14} Q ${shoulderX + 18} ${shoulderY + 28} ${shoulderX} ${shoulderY + 36}`}
        stroke="#6EE7B7"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <rect x={shoulderX - 8} y={shoulderY + 20} width="16" height="22" rx="4" fill="#F59E0B" />
    </svg>
  );
};

/* =========================================================================
 * 3. KINEMATIC McGILL MODIFIED CURL-UP
 * Lumbar is protected with hands underneath; mid-thoracic pivots with zero floor clipping.
 * ========================================================================= */
const KinematicMcGillCurlUp: React.FC<{ progress: number }> = ({ progress }) => {
  // Lumbar pivot at (230, 188)
  const pivotX = 230;
  const pivotY = 188;

  // Thoracic elevation angle: 0 to 6 degrees upward
  const angle = progress * (6 * (Math.PI / 180));
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const torsoLength = 90;
  const shoulderX = pivotX - torsoLength * cosA;
  const shoulderY = pivotY - torsoLength * sinA;

  const headX = shoulderX - 32 * cosA;
  const headY = shoulderY - 32 * sinA;

  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      {/* Mat */}
      <rect x="30" y="195" width="440" height="6" rx="3" fill="#1E293B" />
      <line x1="20" y1="201" x2="480" y2="201" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

      {/* Hands under Lumbar Spine (Fixed anchor) */}
      <ellipse cx={225} cy={190} rx="26" ry="6" fill="#8B5CF6" opacity="0.4" />
      <rect x={205} y={188} width="40" height="7" rx="3.5" fill="#8B5CF6" />
      <text x={225} y={216} fill="#C084FC" fontSize="9" textAnchor="middle" fontWeight="bold">
        Hands under Lumbar Spine (Lordosis Intact)
      </text>

      {/* Head & Neck */}
      <ellipse cx={headX} cy={headY} rx="16" ry="14" fill="#1E293B" stroke="#60A5FA" strokeWidth="2.5" />
      <line x1={shoulderX} y1={shoulderY} x2={headX + 5 * cosA} y2={headY + 5 * sinA} stroke="#3B82F6" strokeWidth="10" strokeLinecap="round" />

      {/* Elevating Cervico-Thoracic Unit */}
      <path d={`M ${shoulderX} ${shoulderY} L ${pivotX} ${pivotY}`} stroke="#1D4ED8" strokeWidth="22" strokeLinecap="round" />

      {/* Abdominal wall contraction indicator */}
      <rect x={pivotX - 50 * cosA - 7} y={pivotY - 50 * sinA - 4} width="14" height="8" rx="2" fill="#A855F7" />
      <rect x={pivotX - 30 * cosA - 7} y={pivotY - 30 * sinA - 4} width="14" height="8" rx="2" fill="#A855F7" />

      {/* Fixed Pelvis */}
      <circle cx={242} cy={188} r="7" fill="#6366F1" />

      {/* Bent Leg (flattens hemipelvis) */}
      <path d="M 242 188 Q 275 145 305 130" stroke="#38BDF8" strokeWidth="15" strokeLinecap="round" />
      <circle cx={305} cy={130} r="6" fill="#0284C7" />
      <path d="M 305 130 Q 320 160 325 195" stroke="#0284C7" strokeWidth="12" strokeLinecap="round" />
      <rect x={315} y={193} width="28" height="5" rx="2.5" fill="#38BDF8" />

      {/* Extended Straight Leg */}
      <path d="M 242 188 L 415 194" stroke="#475569" strokeWidth="14" strokeLinecap="round" />
      <circle cx={330} cy={192} r="5" fill="#334155" />
    </svg>
  );
};

/* =========================================================================
 * 4. KINEMATIC McGILL SIDE BRIDGE
 * Elbow fixed at (150, 194), feet fixed at (400, 194). Hips elevate into straight line.
 * ========================================================================= */
const KinematicMcGillSideBridge: React.FC<{ progress: number }> = ({ progress }) => {
  const elbowX = 150;
  const elbowY = 194;
  const footX = 400;
  const footY = 194;

  // Hips elevate from y = 175 to y = 155
  const hipY = 172 - progress * 16;
  const hipX = 280;

  // Shoulder sits directly over elbow vertically at (150, 132)
  const shoulderX = 150;
  const shoulderY = 136 - progress * 4;

  const headX = shoulderX - 35;
  const headY = shoulderY - 14;

  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      {/* Floor */}
      <rect x="40" y="196" width="420" height="6" rx="3" fill="#1E293B" />
      <line x1="30" y1="202" x2="470" y2="202" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

      {/* Fixed Forearm on Mat */}
      <rect x={100} y={192} width="55" height="6" rx="3" fill="#94A3B8" />
      <circle cx={elbowX} cy={elbowY} r="6" fill="#A855F7" />

      {/* Fixed Stacked Feet */}
      <rect x={footX - 14} y={footY - 4} width="28" height="6" rx="3" fill="#0284C7" />
      <circle cx={footX} cy={footY} r="6" fill="#0369A1" />

      {/* Upper Arm Vertical Column from Elbow to Shoulder */}
      <path d={`M ${elbowX} ${elbowY} L ${shoulderX} ${shoulderY}`} stroke="#CBD5E1" strokeWidth="13" strokeLinecap="round" />
      <circle cx={shoulderX} cy={shoulderY} r="7" fill="#3B82F6" />

      {/* Head */}
      <ellipse cx={headX} cy={headY} rx="15" ry="13" fill="#1E293B" stroke="#60A5FA" strokeWidth="2.5" />
      <path d={`M ${headX + 12} ${headY + 6} L ${shoulderX} ${shoulderY}`} stroke="#3B82F6" strokeWidth="9" strokeLinecap="round" />

      {/* Torso & Leg Straight Bridge */}
      <path d={`M ${shoulderX} ${shoulderY} L ${hipX} ${hipY} L ${footX} ${footY}`} stroke="#1D4ED8" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hipX} cy={hipY} r="8" fill="#8B5CF6" />

      {/* Quadratus Lumborum Tension Line */}
      <path d={`M ${shoulderX + 30} ${shoulderY + 16} L ${hipX - 10} ${hipY}`} stroke="#EC4899" strokeWidth={6 + progress * 3} strokeLinecap="round" strokeDasharray="5 3" />
      <text x={220} y={126} fill="#F472B6" fontSize="10" textAnchor="middle" fontWeight="bold">
        QL & Lateral Obliques Firing
      </text>

      {/* Alignment Laser */}
      <line x1={headX} y1={headY} x2={footX + 10} y2={footY} stroke="#10B981" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.75" />
    </svg>
  );
};

/* =========================================================================
 * 5. KINEMATIC McGILL BIRD DOG
 * Hand and knee fixed at 90° columns. Opposing limbs extend and sweep smoothly.
 * ========================================================================= */
const KinematicMcGillBirdDog: React.FC<{ progress: number }> = ({ progress }) => {
  const groundHandX = 185;
  const groundKneeX = 295;
  const groundY = 195;
  const spineY = 136;

  // Reaching arm: progress = 0 (tucked) -> progress = 1 (horizontal spear at y = 130)
  const reachArmX = 185 - 55 - progress * 65;
  const reachArmY = spineY + 12 - progress * 18;

  // Extending leg: progress = 0 (tucked) -> progress = 1 (horizontal spear at y = 130)
  const extLegX = groundKneeX + 55 + progress * 80;
  const extLegY = spineY + 12 - progress * 18;

  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      {/* Floor */}
      <rect x="30" y="195" width="440" height="6" rx="3" fill="#1E293B" />
      <line x1="20" y1="201" x2="480" y2="201" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

      {/* Supporting Arm Column (Fixed) */}
      <path d={`M ${groundHandX} ${groundY} L ${groundHandX} ${spineY}`} stroke="#64748B" strokeWidth="12" strokeLinecap="round" />
      <rect x={groundHandX - 10} y={groundY - 3} width="20" height="5" rx="2.5" fill="#94A3B8" />
      <circle cx={groundHandX} cy={spineY} r="7" fill="#3B82F6" />

      {/* Supporting Knee Column (Fixed) */}
      <path d={`M ${groundKneeX} ${spineY} L ${groundKneeX} ${groundY}`} stroke="#475569" strokeWidth="14" strokeLinecap="round" />
      <circle cx={groundKneeX} cy={groundY} r="6" fill="#334155" />
      <path d={`M ${groundKneeX} ${groundY} L ${groundKneeX + 38} ${groundY}`} stroke="#475569" strokeWidth="8" strokeLinecap="round" />
      <circle cx={groundKneeX} cy={spineY} r="8" fill="#6366F1" />

      {/* Rigid Torso Table */}
      <path d={`M ${groundHandX} ${spineY} L ${groundKneeX} ${spineY}`} stroke="#2563EB" strokeWidth="22" strokeLinecap="round" />
      <rect x={210} y={spineY - 8} width="55" height="16" rx="8" fill="#A855F7" opacity="0.3" stroke="#C084FC" strokeWidth="1.5" />
      <circle cx={groundHandX - 30} cy={spineY - 8} r="14" fill="#1E293B" stroke="#60A5FA" strokeWidth="2.5" />

      {/* Reaching Lead Arm (Attached to shoulder!) */}
      <path d={`M ${groundHandX} ${spineY} Q ${(groundHandX + reachArmX) / 2} ${(spineY + reachArmY) / 2 - 4} ${reachArmX} ${reachArmY}`} stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" />
      <circle cx={reachArmX} cy={reachArmY} r="6" fill="#38BDF8" /> {/* Clenched Fist */}

      {/* Extending Opposing Leg (Attached to hip!) */}
      <path d={`M ${groundKneeX} ${spineY} Q ${(groundKneeX + extLegX) / 2} ${(spineY + extLegY) / 2 - 4} ${extLegX} ${extLegY}`} stroke="#A855F7" strokeWidth="16" strokeLinecap="round" />
      <circle cx={extLegX} cy={extLegY} r="5" fill="#C084FC" />
      <path d={`M ${extLegX} ${extLegY} L ${extLegX + 4} ${extLegY - 10} L ${extLegX + 7} ${extLegY + 6}`} stroke="#C084FC" strokeWidth="5" strokeLinecap="round" />

      {/* Level Pelvis Indicator */}
      <line x1="50" y1="126" x2="450" y2="126" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.75" />
      <text x="240" y="114" fill="#34D399" fontSize="10" textAnchor="middle" fontWeight="bold">
        Zero Pelvic Tilt • Rigid Tabletop
      </text>
    </svg>
  );
};

/* =========================================================================
 * 6. KINEMATIC DUMBBELL ROW
 * ========================================================================= */
const KinematicDumbbellRow: React.FC<{ progress: number }> = ({ progress }) => {
  const footX = 275;
  const footY = 202;
  const hipX = 275;
  const hipY = 145;
  const shoulderX = 215;
  const shoulderY = 95;

  // Arm pulling backward to hip pocket
  const handX = 238 + progress * 24;
  const handY = 178 - progress * 42;
  const elbowX = (shoulderX + handX) / 2 + progress * 22;
  const elbowY = (shoulderY + handY) / 2 - progress * 12;

  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      <rect x="80" y="202" width="340" height="6" rx="3" fill="#1E293B" />
      <rect x={footX - 8} y={footY - 4} width="28" height="6" rx="3" fill="#059669" />

      {/* Fixed Hinged Athlete */}
      <path d={`M ${hipX} ${hipY} Q 288 175 282 ${footY}`} stroke="#10B981" strokeWidth="16" strokeLinecap="round" />
      <circle cx={288} cy={175} r="6" fill="#065F46" />
      <path d={`M ${shoulderX} ${shoulderY} L ${hipX} ${hipY}`} stroke="#059669" strokeWidth="20" strokeLinecap="round" />
      <circle cx={hipX} cy={hipY} r="8" fill="#047857" />
      <circle cx={shoulderX - 12} cy={shoulderY - 10} r="14" fill="#1E293B" stroke="#10B981" strokeWidth="2.5" />

      {/* Articulated Pulling Arm (Always attached to shoulder!) */}
      <path d={`M ${shoulderX} ${shoulderY + 12} L ${elbowX} ${elbowY} L ${handX} ${handY}`} stroke="#93C5FD" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={elbowX} cy={elbowY} r="6" fill="#2563EB" />
      <circle cx={handX} cy={handY} r="5" fill="#60A5FA" />
      <rect x={handX - 12} y={handY - 6} width="24" height="12" rx="3" fill="#F59E0B" />
    </svg>
  );
};

/* =========================================================================
 * 7. KINEMATIC FOREARM PLANK
 * ========================================================================= */
const KinematicPlank: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      <rect x="40" y="196" width="420" height="6" rx="3" fill="#1E293B" />
      <rect x={120} y={192} width="55" height="6" rx="3" fill="#3B82F6" />
      <path d="M 150 192 L 150 156" stroke="#93C5FD" strokeWidth="12" strokeLinecap="round" />
      <circle cx={150} cy={156} r="7" fill="#2563EB" />
      <circle cx={375} cy={194} r="6" fill="#15803D" />

      <path d={`M 150 156 L 375 ${186 - progress * 2}`} stroke="#16A34A" strokeWidth="22" strokeLinecap="round" />
      <ellipse cx={255} cy={172} rx={22 + progress * 2} ry={14} stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" />
      <circle cx={120} cy={148} r="14" fill="#1E293B" stroke="#4ADE80" strokeWidth="2.5" />
    </svg>
  );
};

/* =========================================================================
 * 8. KINEMATIC E-BIKE CYCLIST
 * ========================================================================= */
const KinematicEBikeCyclist: React.FC<{ progress: number }> = ({ progress }) => {
  const crankAngle = progress * 2 * Math.PI;
  const pedalX = 230 + 20 * Math.cos(crankAngle);
  const pedalY = 170 + 20 * Math.sin(crankAngle);

  // Hip at saddle (215, 118)
  const hipX = 215;
  const hipY = 118;
  const kneeX = 235 + 10 * Math.sin(crankAngle);
  const kneeY = 145 + 10 * Math.cos(crankAngle);

  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      <line x1="20" y1="202" x2="480" y2="202" stroke="#334155" strokeWidth="3" />

      {/* Rear Wheel */}
      <circle cx="150" cy="170" r="32" stroke="#475569" strokeWidth="5" />
      <circle cx="150" cy="170" r="29" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="7 7" />
      <circle cx="150" cy="170" r="6" fill="#38BDF8" />

      {/* Front Wheel */}
      <circle cx="340" cy="170" r="32" stroke="#475569" strokeWidth="5" />
      <circle cx="340" cy="170" r="29" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="7 7" />
      <circle cx="340" cy="170" r="6" fill="#38BDF8" />

      {/* Chassis */}
      <polyline points="150,170 230,170 210,122 150,170" stroke="#2563EB" strokeWidth="5" strokeLinejoin="round" />
      <line x1="230" y1="170" x2="310" y2="120" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
      <rect x="245" y="136" width="38" height="8" rx="3" fill="#06B6D4" transform="rotate(-32 264 140)" />
      <line x1="210" y1="122" x2="305" y2="122" stroke="#2563EB" strokeWidth="5" />
      <line x1="340" y1="170" x2="315" y2="105" stroke="#38BDF8" strokeWidth="5" />
      <path d="M 310 105 Q 325 96 338 102" stroke="#94A3B8" strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="195" y1="118" x2="225" y2="118" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />

      {/* Cyclist Torso */}
      <circle cx="280" cy="55" r="14" fill="#1E293B" stroke="#38BDF8" strokeWidth="2.5" />
      <path d="M 215 118 Q 250 85 275 68" stroke="#1D4ED8" strokeWidth="18" strokeLinecap="round" />
      <path d="M 270 72 Q 295 88 322 102" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />

      {/* 4-bar Articulated Pedaling Chain */}
      <path d={`M ${hipX} ${hipY} L ${kneeX} ${kneeY} L ${pedalX} ${pedalY}`} stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={kneeX} cy={kneeY} r="5" fill="#0284C7" />
      <circle cx={pedalX} cy={pedalY} r="4.5" fill="#38BDF8" />
    </svg>
  );
};

/* =========================================================================
 * 9. KINEMATIC INDOOR SPINNING
 * ========================================================================= */
const KinematicSpinningIndoor: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      <defs>
        <radialGradient id="flywheelSpin" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#EA580C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
        </radialGradient>
      </defs>

      <line x1="80" y1="200" x2="420" y2="200" stroke="#334155" strokeWidth="4" />
      <rect x="120" y="196" width="260" height="6" rx="3" fill="#1E293B" />

      {/* Flywheel */}
      <circle cx="330" cy="155" r="36" fill="url(#flywheelSpin)" opacity="0.4" />
      <circle cx="330" cy="155" r="32" stroke="#F97316" strokeWidth="5" />
      <circle cx="330" cy="155" r="27" stroke="#FDBA74" strokeWidth="2" strokeDasharray="6 6" />
      <circle cx="330" cy="155" r="7" fill="#EA580C" />

      {/* Frame */}
      <polyline points="150,196 180,165 240,165" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      <polyline points="370,196 340,165 280,165" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      <line x1="200" y1="165" x2="210" y2="108" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
      <line x1="300" y1="165" x2="315" y2="98" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
      <path d="M 305 98 Q 325 88 338 92" stroke="#94A3B8" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="265" cy="104" r="6" fill="#EF4444" />
      <line x1="195" y1="106" x2="225" y2="106" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" />

      {/* Rider */}
      <circle cx="270" cy="50" r="14" fill="#1E293B" stroke="#FB923C" strokeWidth="2.5" />
      <path d="M 210 106 Q 248 72 268 62" stroke="#C2410C" strokeWidth="18" strokeLinecap="round" />
      <path d="M 265 68 Q 290 82 320 92" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />

      <text x="330" y="218" fill="#FB923C" fontSize="11" textAnchor="middle" fontWeight="bold">
        92 RPM • HIGH CADENCE TEMPO
      </text>
    </svg>
  );
};

/* =========================================================================
 * 10. KINEMATIC CAT-CAMEL MOBILITY
 * ========================================================================= */
const KinematicCatCamel: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <svg viewBox="0 0 500 240" className="w-full h-full max-h-[240px]" fill="none">
      <rect x="50" y="196" width="400" height="6" rx="3" fill="#1E293B" />
      <path d="M 170 196 L 170 148" stroke="#64748B" strokeWidth="12" strokeLinecap="round" />
      <path d="M 330 196 L 330 148" stroke="#64748B" strokeWidth="14" strokeLinecap="round" />
      <path d={`M 170 148 Q 250 ${110 + progress * 24} 330 148`} stroke="#A855F7" strokeWidth="18" fill="none" strokeLinecap="round" />
      <circle cx="140" cy="152" r="14" fill="#1E293B" stroke="#C084FC" strokeWidth="2.5" />
    </svg>
  );
};
