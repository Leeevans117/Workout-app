import React, { useState, useEffect, useRef } from 'react';
import { Exercise, WorkoutRoutine, CardioMode, TimerPhase, HeartRateData } from '../types/workout';
import { ExerciseAnimator } from './ExerciseAnimator';
import { soundEngine } from '../utils/audioNotification';
import { bleHeartRateService } from '../utils/bleHeartRateService';
import { FitbitHeartRateModal } from './FitbitHeartRateModal';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  Layers,
  ArrowRight,
  Heart,
  Watch,
  Gauge
} from 'lucide-react';

interface WorkoutTimerScreenProps {
  routine: WorkoutRoutine;
  initialExerciseIndex?: number;
  cardioMode?: CardioMode;
  onExit: () => void;
  onWorkoutComplete: (durationSeconds: number, cardioMode?: CardioMode, heartRate?: HeartRateData) => void;
}

export const WorkoutTimerScreen: React.FC<WorkoutTimerScreenProps> = ({
  routine,
  initialExerciseIndex = 0,
  cardioMode,
  onExit,
  onWorkoutComplete,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(initialExerciseIndex);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<TimerPhase>('prep'); // Start with mandatory prep
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [showFormCues, setShowFormCues] = useState(false);

  // Heart Rate tracking state
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [liveBpm, setLiveBpm] = useState(bleHeartRateService.getLiveStats().currentBpm);
  const [liveZone, setLiveZone] = useState(bleHeartRateService.getLiveStats().currentZone);
  const [manualAvgBpm, setManualAvgBpm] = useState('142');
  const [manualMaxBpm, setManualMaxBpm] = useState('165');
  const [manualRpe, setManualRpe] = useState(7);

  // Time tracking
  const currentExercise = routine.exercises[currentExerciseIndex] || routine.exercises[0];
  const prepDuration = currentExercise.prepCountdownSeconds ?? 10;
  const holdDuration = currentExercise.defaultHoldSeconds ?? 10;
  const restDuration = currentExercise.defaultRestSeconds ?? 30;

  const [timeRemaining, setTimeRemaining] = useState(prepDuration);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  // Refs for tracking transitions without stale closures
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const timeRef = useRef(timeRemaining);
  timeRef.current = timeRemaining;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Listen to BLE Heart Rate
  useEffect(() => {
    const unsub = bleHeartRateService.subscribeBpm((bpm, zone) => {
      setLiveBpm(bpm);
      setLiveZone(zone);
    });
    return () => unsub();
  }, []);

  // Sync initial phase & time for current exercise
  useEffect(() => {
    const prep = currentExercise.prepCountdownSeconds ?? 10;
    setPhase('prep');
    setTimeRemaining(prep);
  }, [currentExerciseIndex]);

  // Main high-precision interval loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPausedRef.current || phaseRef.current === 'finished') return;

      setTotalElapsedTime((t) => t + 1);

      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer expired for current phase!
          handlePhaseExpiration();
          return 0;
        }

        // Play 3, 2, 1 prep countdown beeps
        if (phaseRef.current === 'prep' && prev <= 4 && prev > 1) {
          soundEngine.playPrepCountdownBeep(prev === 2);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExerciseIndex, currentSet]);

  const handlePhaseExpiration = () => {
    const currentPhase = phaseRef.current;

    if (currentPhase === 'prep') {
      // Transition from prep to active
      soundEngine.playStartWorkBeep();
      setPhase('active');
      setTimeRemaining(holdDuration);
    } else if (currentPhase === 'active') {
      // Active hold or rep block ended
      soundEngine.playExerciseEndSound();

      // Check if more sets remain for this exercise
      if (currentSet < currentExercise.defaultSets) {
        // Transition to rest period
        soundEngine.playRestStartSound();
        setPhase('rest');
        setTimeRemaining(restDuration);
      } else {
        // All sets finished for this exercise
        if (currentExerciseIndex < routine.exercises.length - 1) {
          // Move to next exercise (begins with 10s prep)
          setCurrentExerciseIndex((prev) => prev + 1);
          setCurrentSet(1);
          setPhase('prep');
          setTimeRemaining(10);
        } else {
          // Whole routine finished!
          soundEngine.playWorkoutCompleteFanfare();
          setPhase('finished');
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#3B82F6', '#10B981', '#A855F7', '#F59E0B'],
          });
        }
      }
    } else if (currentPhase === 'rest') {
      // Rest period finished!
      soundEngine.playRestEndSound();
      setCurrentSet((prev) => prev + 1);
      // Advance to prep for next set
      setPhase('prep');
      setTimeRemaining(prepDuration);
    }
  };

  const handleManualSkip = () => {
    handlePhaseExpiration();
  };

  const handleResetCurrent = () => {
    if (phase === 'prep') setTimeRemaining(prepDuration);
    else if (phase === 'active') setTimeRemaining(holdDuration);
    else if (phase === 'rest') setTimeRemaining(restDuration);
  };

  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const getPhaseDetails = () => {
    switch (phase) {
      case 'prep':
        return {
          title: 'GET INTO POSITION • 10s PREPARATION',
          subtitle: 'Brace abdominal wall circumferentially & stabilize joints',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          strokeColor: '#F59E0B',
          glowColor: 'shadow-amber-500/20',
          maxTime: prepDuration,
        };
      case 'active':
        return {
          title: currentExercise.defaultHoldSeconds
            ? `HOLD ISOMETRIC • SET ${currentSet} OF ${currentExercise.defaultSets}`
            : `PERFORM EXERCISE • SET ${currentSet} OF ${currentExercise.defaultSets}`,
          subtitle: 'Maintain neutral spine & smooth continuous breathing',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          strokeColor: '#10B981',
          glowColor: 'shadow-emerald-500/20',
          maxTime: holdDuration,
        };
      case 'rest':
        return {
          title: 'REST & RECOVERY',
          subtitle: `Next: ${currentSet < currentExercise.defaultSets ? `Set ${currentSet + 1}` : 'Next Exercise'}`,
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          strokeColor: '#3B82F6',
          glowColor: 'shadow-blue-500/20',
          maxTime: restDuration,
        };
      case 'finished':
        return {
          title: 'ROUTINE COMPLETE',
          subtitle: 'Excellent work maintaining consistency!',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          strokeColor: '#A855F7',
          glowColor: 'shadow-purple-500/20',
          maxTime: 1,
        };
    }
  };

  const phaseDetails = getPhaseDetails();
  const progressRatio = Math.max(0, Math.min(1, timeRemaining / phaseDetails.maxTime));
  const circleCircumference = 2 * Math.PI * 88;
  const strokeDashoffset = circleCircumference - progressRatio * circleCircumference;

  const isCardio = routine.isCardioSpecial || routine.category === 'cardio';

  if (phase === 'finished') {
    const bleStats = bleHeartRateService.getLiveStats();
    const hasBleData = bleStats.samplesCount > 0 && bleStats.avgBpm > 0;

    const buildFinalHeartRateData = (): HeartRateData | undefined => {
      if (!isCardio) return undefined;

      if (hasBleData) {
        return {
          avgBpm: bleStats.avgBpm,
          maxBpm: bleStats.maxBpm,
          source: 'ble',
          zone: bleStats.currentZone,
          rpe: manualRpe,
        };
      }

      const avg = parseInt(manualAvgBpm, 10);
      const max = parseInt(manualMaxBpm, 10);
      if (!isNaN(avg) && avg > 40) {
        return {
          avgBpm: avg,
          maxBpm: !isNaN(max) ? max : undefined,
          source: 'manual',
          zone: bleHeartRateService.calculateZone(avg),
          rpe: manualRpe,
        };
      }
      return undefined;
    };

    return (
      <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
        <div className="pt-6 text-center max-w-md mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Workout Complete!</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Completed <span className="text-white font-semibold">{routine.title}</span>
          </p>

          <div className="grid grid-cols-2 gap-3 my-5">
            <div className="bg-[#121622] border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 block mb-1">Time Elapsed</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400">
                {Math.floor(totalElapsedTime / 60)}m {totalElapsedTime % 60}s
              </span>
            </div>
            <div className="bg-[#121622] border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 block mb-1">Total Sets</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                {routine.exercises.reduce((acc, ex) => acc + ex.defaultSets, 0)} Sets
              </span>
            </div>
          </div>

          {/* Cardio Intensity & Heart Rate Input Card */}
          {isCardio && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/30 via-[#10131E] to-[#0A0D15] border border-rose-500/40 text-left my-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Heart className="w-4 h-4 fill-current animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Fitbit / Heart Rate Intensity
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {hasBleData ? 'Captured via Bluetooth (BLE)' : 'Input from your Fitbit watch'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsHrModalOpen(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline"
                >
                  {hasBleData ? 'Re-pair' : 'Pair BLE'}
                </button>
              </div>

              {hasBleData ? (
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Average HR</span>
                    <span className="text-2xl font-black font-mono text-rose-400">{bleStats.avgBpm} <span className="text-xs text-slate-400">BPM</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Peak HR</span>
                    <span className="text-2xl font-black font-mono text-white">{bleStats.maxBpm} <span className="text-xs text-slate-400">BPM</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Intensity Zone</span>
                    <span className="text-xs font-bold text-emerald-400">{bleStats.currentZone.split(' ')[0]}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Average BPM
                      </label>
                      <input
                        type="number"
                        value={manualAvgBpm}
                        onChange={(e) => setManualAvgBpm(e.target.value)}
                        placeholder="142"
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Peak / Max BPM
                      </label>
                      <input
                        type="number"
                        value={manualMaxBpm}
                        onChange={(e) => setManualMaxBpm(e.target.value)}
                        placeholder="165"
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Calculated Zone Preview */}
                  {parseInt(manualAvgBpm, 10) > 40 && (
                    <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Zone Calculation:</span>
                      <span className="font-bold text-rose-400">
                        {bleHeartRateService.calculateZone(parseInt(manualAvgBpm, 10))}
                      </span>
                    </div>
                  )}

                  {/* RPE Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Rate of Perceived Exertion (RPE):</span>
                      <span className="font-bold text-white font-mono">{manualRpe} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={manualRpe}
                      onChange={(e) => setManualRpe(parseInt(e.target.value, 10))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-left text-xs text-blue-200">
            <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Consistency Logged
            </div>
            A completion checkmark has been automatically recorded to your progress calendar for today!
          </div>
        </div>

        <div className="max-w-md mx-auto w-full pb-6 pt-4">
          <button
            onClick={() => {
              const hrData = buildFinalHeartRateData();
              onWorkoutComplete(totalElapsedTime, cardioMode, hrData);
            }}
            className="w-full py-4 px-6 rounded-full bg-blue-600 hover:bg-blue-500 font-bold text-base shadow-xl shadow-blue-600/30 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Save & View Calendar Tracker</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <FitbitHeartRateModal
          isOpen={isHrModalOpen}
          onClose={() => setIsHrModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between p-4 sm:p-6 pb-8">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="text-center truncate px-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block truncate">
            {routine.title}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Ex {currentExerciseIndex + 1} of {routine.exercises.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Heart Rate / Fitbit Header Button (if Cardio) */}
          {isCardio && (
            <button
              onClick={() => setIsHrModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-500/40 text-xs font-semibold text-rose-300 hover:text-white transition-colors"
              title="Connect Fitbit / BLE Heart Rate"
            >
              <Heart className={`w-3.5 h-3.5 fill-current ${liveBpm > 0 ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`} />
              <span className="font-mono">{liveBpm > 0 ? `${liveBpm} BPM` : 'Fitbit HR'}</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${
              isMuted
                ? 'bg-slate-900 text-slate-500 border-slate-800'
                : 'bg-blue-600/20 text-blue-400 border-blue-500/40'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 w-full max-w-lg mx-auto">
        {/* Phase Pill Badge */}
        <div className="mb-3 text-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border shadow-sm ${phaseDetails.badgeColor}`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {phaseDetails.title}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 truncate max-w-sm mx-auto">
            {currentExercise.name}
          </h2>
        </div>

        {/* Dynamic Exercise Looping Animation */}
        <div className="w-full mb-3">
          <ExerciseAnimator
            type={currentExercise.animationType}
            cardioMode={cardioMode}
            isActive={!isPaused && phase === 'active'}
            phase={phase}
            timeRemaining={timeRemaining}
          />
        </div>

        {/* Active Muscle Complex & Joint Alignment Focus */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 px-2">
          {currentExercise.targetedMuscles.map((muscle) => (
            <span
              key={muscle}
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 flex items-center gap-1.5 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{muscle}</span>
            </span>
          ))}
        </div>

        {/* Central Circular Timer Gauge */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-52 h-52 sm:w-60 sm:h-60 transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r="88"
              stroke="#1E293B"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="100"
              cy="100"
              r="88"
              stroke={phaseDetails.strokeColor}
              strokeWidth="9"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-500 ease-linear"
            />
          </svg>

          {/* Digital Timer Readout inside gauge */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
              {timeRemaining}
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
              {phase === 'prep' ? 'Prep Seconds' : phase === 'active' ? 'Hold Seconds' : 'Rest Seconds'}
            </span>
          </div>
        </div>

        {/* Subtitle guidance message */}
        <p className="text-xs text-slate-400 text-center max-w-xs mt-2 min-h-[32px] leading-relaxed">
          {phaseDetails.subtitle}
        </p>
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="w-full max-w-md mx-auto pt-2">
        <div className="flex items-center justify-between gap-3 bg-[#111624] border border-slate-800 p-2.5 rounded-full shadow-2xl backdrop-blur-md">
          {/* Reset Current Set / Phase */}
          <button
            onClick={handleResetCurrent}
            className="w-11 h-11 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            title="Reset Phase Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-1 py-3 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Skip to Next Phase */}
          <button
            onClick={handleManualSkip}
            className="w-11 h-11 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            title="Skip to Next Phase"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Fitbit Heart Rate Modal */}
      <FitbitHeartRateModal
        isOpen={isHrModalOpen}
        onClose={() => setIsHrModalOpen(false)}
      />
    </div>
  );
};
