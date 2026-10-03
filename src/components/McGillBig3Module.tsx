import React, { useState } from 'react';
import { WorkoutRoutine, Exercise } from '../types/workout';
import { ExerciseAnimator } from './ExerciseAnimator';
import {
  ShieldCheck,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Layers,
  HeartPulse
} from 'lucide-react';

interface McGillBig3ModuleProps {
  routine: WorkoutRoutine;
  onStartFullRoutine: () => void;
  onStartSingleExercise: (exerciseIndex: number) => void;
}

export const McGillBig3Module: React.FC<McGillBig3ModuleProps> = ({
  routine,
  onStartFullRoutine,
  onStartSingleExercise,
}) => {
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0); // 0: McGill Curl-Up
  const selectedExercise = routine.exercises[selectedExerciseIndex] || routine.exercises[0];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A102E] via-[#130E24] to-[#0A0D14] border border-purple-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Spine Hygiene Gold Standard
              </span>
              <span className="text-xs text-purple-300/80 font-mono">Dr. Stuart McGill</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              The McGill Big 3
            </h1>
            <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
              Clinically engineered to spare the lumbar spine from harmful compressive forces while maximizing circumferential torso stiffness. Includes the mandatory 10-second preparation countdown before each movement.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> 10s Prep Countdown
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> 10s Isometric Holds
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> True Spine Neutrality
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2.5">
            <button
              onClick={onStartFullRoutine}
              className="py-4 px-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-purple-600/30 transition-transform active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start All 3 Exercises</span>
            </button>
            <span className="text-[11px] text-center text-purple-300/70">
              Includes 10s prep timer before each exercise
            </span>
          </div>
        </div>
      </div>

      {/* The 3 Essential Exercises Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">The 3 Big Movements</h2>
          <span className="text-xs text-slate-400">Click to preview animation & cues</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routine.exercises.map((ex, idx) => {
            const isSelected = selectedExerciseIndex === idx;

            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExerciseIndex(idx)}
                className={`relative rounded-3xl p-5 cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-950/25 border-purple-500 ring-2 ring-purple-500/20 shadow-xl shadow-purple-950/40'
                    : 'bg-[#10131B] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      Exercise 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      10s Prep • 10s Holds
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{ex.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {ex.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-purple-400 font-medium">
                    {isSelected ? 'Viewing Demonstration' : 'Click to Inspect'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartSingleExercise(idx);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Timer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Exercise Stage with Looping Animation & Form Cues */}
      <div className="bg-[#0E121B] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
              <span>EXERCISE PREVIEW & CLINICAL POSTURE</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{selectedExercise.name}</h3>
          </div>

          <button
            onClick={() => onStartSingleExercise(selectedExerciseIndex)}
            className="py-3 px-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-[0.98] self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch with 10s Prep Countdown</span>
          </button>
        </div>

        {/* Looping Vector Animation */}
        <ExerciseAnimator
          type={selectedExercise.animationType}
          isActive={true}
          phase="active"
        />

        {/* Clinical Form Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Dr. McGill Form Checklist
            </h4>
            <div className="space-y-2">
              {selectedExercise.formCues.map((cue, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 font-mono text-[10px] flex items-center justify-center shrink-0 border border-purple-800/60">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{cue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Why the 10-Second Prep is Mandatory
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-2xl bg-amber-950/20 border border-amber-900/30">
                Dr. McGill stresses that rushing into an isometric spine hold induces micro-rotations and shearing. The 10-second prep countdown forces you to establish neutral lordosis, set the hands/forearms in place, and lock your abdominal wall brace before holding tension.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Target Muscle Complex
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.targetedMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-medium"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
