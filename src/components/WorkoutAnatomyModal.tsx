import React, { useState } from 'react';
import { WorkoutRoutine, Exercise, CardioMode } from '../types/workout';
import { ExerciseAnimator } from './ExerciseAnimator';
import {
  Compass,
  Play,
  CheckCircle2,
  X,
  Layers,
  Activity,
  ShieldCheck,
  Dumbbell,
  Zap,
  Info
} from 'lucide-react';

interface WorkoutAnatomyModalProps {
  routine: WorkoutRoutine | null;
  isOpen: boolean;
  onClose: () => void;
  onStartExercise: (routine: WorkoutRoutine, exerciseIndex: number) => void;
}

export const WorkoutAnatomyModal: React.FC<WorkoutAnatomyModalProps> = ({
  routine,
  isOpen,
  onClose,
  onStartExercise,
}) => {
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [selectedCardioMode, setSelectedCardioMode] = useState<CardioMode>('ebike');

  if (!isOpen || !routine) return null;

  const currentExercise = routine.exercises[selectedExerciseIndex] || routine.exercises[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F131D] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              routine.category === 'mcgill'
                ? 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                : routine.category === 'strength'
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-600/20 text-blue-400 border-blue-500/30'
            }`}>
              {routine.category === 'mcgill' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : routine.category === 'strength' ? (
                <Dumbbell className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{routine.title}</h3>
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Anatomy & Motion
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Biomechanical joint kinematic models & muscle complexes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exercise Tabs Selector */}
        {routine.exercises.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-slate-800/80 scrollbar-none">
            {routine.exercises.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setSelectedExerciseIndex(idx)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedExerciseIndex === idx
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {idx + 1}. {ex.name}
              </button>
            ))}
          </div>
        )}

        {/* Cardio Modality Selector (if Cardio session) */}
        {routine.isCardioSpecial && (
          <div className="flex items-center gap-2 pt-3 pb-1">
            <span className="text-xs text-slate-400 font-medium">Modality View:</span>
            <button
              onClick={() => setSelectedCardioMode('ebike')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedCardioMode === 'ebike'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              E-Bike Outdoor
            </button>
            <button
              onClick={() => setSelectedCardioMode('spinning')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedCardioMode === 'spinning'
                  ? 'bg-orange-600 text-white border-orange-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Spinning Indoors
            </button>
          </div>
        )}

        {/* Main Anatomical Vector Animation Stage */}
        <div className="my-4">
          <ExerciseAnimator
            type={currentExercise.animationType}
            cardioMode={selectedCardioMode}
            isActive={true}
            phase="active"
          />
        </div>

        {/* Details & Muscle Complex */}
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-bold text-white">{currentExercise.name}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentExercise.description}
            </p>
          </div>

          {/* Targeted Muscles Badges */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Target Muscle Activation Map:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentExercise.targetedMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Form Cues Checklist */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Biomechanical Execution Cues:
            </span>
            {currentExercise.formCues.map((cue, cIdx) => (
              <div key={cIdx} className="flex items-start gap-2 text-slate-300">
                <span className="text-blue-400 font-bold shrink-0">•</span>
                <span>{cue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {currentExercise.defaultSets} sets • {currentExercise.defaultReps ? `${currentExercise.defaultReps} reps` : `${currentExercise.defaultHoldSeconds}s hold`}
          </span>

          <button
            onClick={() => {
              onStartExercise(routine, selectedExerciseIndex);
              onClose();
            }}
            className="py-3 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-transform active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch with Live Timers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
