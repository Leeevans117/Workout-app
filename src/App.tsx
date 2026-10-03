import React, { useState, useEffect } from 'react';
import { WorkoutRoutine, WorkoutLogEntry, CardioMode, HeartRateData } from './types/workout';
import { WORKOUT_ROUTINES } from './data/workoutPlan';
import { MainDashboard } from './components/MainDashboard';
import { McGillBig3Module } from './components/McGillBig3Module';
import { CalendarDashboard } from './components/CalendarDashboard';
import { WorkoutTimerScreen } from './components/WorkoutTimerScreen';
import { CardioSelectorModal } from './components/CardioSelectorModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { soundEngine } from './utils/audioNotification';
import {
  Activity,
  ShieldCheck,
  Calendar as CalendarIcon,
  Play,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Sparkles,
  Smartphone
} from 'lucide-react';

const STORAGE_KEY = 'apex_pulse_workout_logs';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mcgill' | 'calendar'>('dashboard');
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<WorkoutRoutine | null>(null);
  const [initialExerciseIndex, setInitialExerciseIndex] = useState(0);
  const [isCardioModalOpen, setIsCardioModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [pendingCardioRoutine, setPendingCardioRoutine] = useState<WorkoutRoutine | null>(null);
  const [selectedCardioMode, setSelectedCardioMode] = useState<CardioMode>('ebike');
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  // Dynamic Routines State (persisted to localStorage)
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const saved = localStorage.getItem('apex_routines');
      if (saved) return JSON.parse(saved);
    } catch {}
    return WORKOUT_ROUTINES;
  });

  const handleUpdateRoutine = (updated: WorkoutRoutine) => {
    setRoutines((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      try {
        localStorage.setItem('apex_routines', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleResetRoutines = () => {
    setRoutines(WORKOUT_ROUTINES);
    try {
      localStorage.removeItem('apex_routines');
    } catch {}
  };

  // Workout Logs State (initialized from localStorage with realistic starter logs)
  const [logs, setLogs] = useState<WorkoutLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }

    // Default starter logs for instant active consistency
    const today = new Date();
    const result: WorkoutLogEntry[] = [];

    // Log yesterday and 3 days ago
    for (const offset of [1, 2, 4, 6]) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        id: `seed-${dateStr}`,
        date: dateStr,
        routineId: offset % 2 === 0 ? 'mcgill-big-3' : 'cardio-session',
        routineTitle: offset % 2 === 0 ? 'McGill Big 3 Core Protocol' : 'E-Bike Outdoor Session',
        category: offset % 2 === 0 ? 'mcgill' : 'cardio',
        durationSeconds: offset % 2 === 0 ? 1080 : 2100,
        completedExercisesCount: 3,
        cardioMode: offset % 2 === 0 ? undefined : 'ebike',
        heartRate: offset % 2 !== 0 ? {
          avgBpm: offset === 1 ? 138 : 144,
          maxBpm: offset === 1 ? 162 : 168,
          source: 'ble',
          zone: offset === 1 ? 'Zone 2 (Aerobic)' : 'Zone 3 (Tempo)',
          rpe: 7,
        } : undefined,
        timestamp: d.getTime(),
      });
    }

    return result;
  });

  // Save logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  // Handle starting a routine
  const handleStartRoutine = (routine: WorkoutRoutine, exerciseIndex: number = 0) => {
    if (routine.isCardioSpecial) {
      // Present user with selectable option between E-bike or Spinning Indoors!
      setPendingCardioRoutine(routine);
      setIsCardioModalOpen(true);
    } else {
      setInitialExerciseIndex(exerciseIndex);
      setActiveWorkoutRoutine(routine);
    }
  };

  // Launch cardio after modality selection
  const handleSelectCardioMode = (mode: CardioMode) => {
    setSelectedCardioMode(mode);
    if (pendingCardioRoutine) {
      setInitialExerciseIndex(0);
      setActiveWorkoutRoutine(pendingCardioRoutine);
      setPendingCardioRoutine(null);
    }
  };

  // On workout completed: automatically places a tick / checkmark on that day in the calendar
  const handleWorkoutComplete = (
    durationSeconds: number,
    cardioMode?: CardioMode,
    heartRate?: HeartRateData
  ) => {
    if (!activeWorkoutRoutine) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: WorkoutLogEntry = {
      id: `log-${Date.now()}`,
      date: todayStr,
      routineId: activeWorkoutRoutine.id,
      routineTitle: activeWorkoutRoutine.title,
      category: activeWorkoutRoutine.category,
      durationSeconds,
      completedExercisesCount: activeWorkoutRoutine.exercises.length,
      cardioMode,
      heartRate,
      timestamp: Date.now(),
    };

    setLogs((prev) => [newLog, ...prev]);
    setActiveWorkoutRoutine(null);
    setActiveTab('calendar'); // Show progress tracker with newly placed tick!
  };

  // Manual calendar toggle
  const handleToggleDateCompletion = (dateStr: string) => {
    setLogs((prev) => {
      const existing = prev.filter((l) => l.date === dateStr);
      if (existing.length > 0) {
        return prev.filter((l) => l.date !== dateStr);
      } else {
        const manualLog: WorkoutLogEntry = {
          id: `manual-${Date.now()}`,
          date: dateStr,
          routineId: 'mcgill-big-3',
          routineTitle: 'McGill Big 3 Routine',
          category: 'mcgill',
          durationSeconds: 1200,
          completedExercisesCount: 3,
          timestamp: Date.now(),
        };
        return [manualLog, ...prev];
      }
    });
  };

  const handleAddCustomLog = (dateStr: string, title: string, durationMinutes: number) => {
    const newLog: WorkoutLogEntry = {
      id: `custom-${Date.now()}`,
      date: dateStr,
      routineId: 'custom',
      routineTitle: title,
      category: 'strength',
      durationSeconds: durationMinutes * 60,
      completedExercisesCount: 3,
      timestamp: Date.now(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  // Active fullscreen Workout Timer screen
  if (activeWorkoutRoutine) {
    return (
      <WorkoutTimerScreen
        routine={activeWorkoutRoutine}
        initialExerciseIndex={initialExerciseIndex}
        cardioMode={selectedCardioMode}
        onExit={() => setActiveWorkoutRoutine(null)}
        onWorkoutComplete={handleWorkoutComplete}
      />
    );
  }

  const mcgillRoutine = routines.find((r) => r.isMcGillSpecial) || routines[0];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract: Exactly 3 Zones */}
      <header className="sticky top-0 z-30 bg-[#0B0E14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            <span className="text-lg font-black tracking-tight text-white uppercase font-display">
              ApexPulse
            </span>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-white transition-colors ${
                activeTab === 'dashboard' ? 'text-blue-400' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('mcgill')}
              className={`hover:text-white transition-colors ${
                activeTab === 'mcgill' ? 'text-purple-400' : ''
              }`}
            >
              McGill Big 3
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`hover:text-white transition-colors ${
                activeTab === 'calendar' ? 'text-emerald-400' : ''
              }`}
            >
              Calendar Tracker
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              title="Install as Android App"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Install App</span>
            </button>

            <button
              onClick={toggleSound}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${
                isMuted
                  ? 'bg-slate-900 text-slate-500 border-slate-800'
                  : 'bg-blue-600/20 text-blue-400 border-blue-500/40'
              }`}
              title={isMuted ? 'Sound Notifications Muted' : 'Sound Notifications Active'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Quick start CTA button: Heavily rounded pill shape */}
            <button
              onClick={() => handleStartRoutine(mcgillRoutine)}
              className="py-2 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-transform active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Start McGill 3</span>
              <span className="sm:hidden">Start</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <MainDashboard
            routines={routines}
            logs={logs}
            onStartRoutine={handleStartRoutine}
            onSelectMcGillTab={() => setActiveTab('mcgill')}
            onSelectCalendarTab={() => setActiveTab('calendar')}
            onUpdateRoutine={handleUpdateRoutine}
            onResetRoutines={handleResetRoutines}
          />
        )}

        {activeTab === 'mcgill' && (
          <McGillBig3Module
            routine={mcgillRoutine}
            onStartFullRoutine={() => handleStartRoutine(mcgillRoutine, 0)}
            onStartSingleExercise={(idx) => handleStartRoutine(mcgillRoutine, idx)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarDashboard
            logs={logs}
            onToggleDateCompletion={handleToggleDateCompletion}
            onAddCustomLog={handleAddCustomLog}
            onDeleteLog={handleDeleteLog}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Bar: Mobile & Touch First Ergonomics */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto grid grid-cols-3 items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('mcgill')}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              activeTab === 'mcgill' ? 'text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">McGill Big 3</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              activeTab === 'calendar' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Consistency</span>
          </button>
        </div>
      </nav>

      {/* Cardio Modality Selector Modal Sheet */}
      <CardioSelectorModal
        isOpen={isCardioModalOpen}
        onClose={() => {
          setIsCardioModalOpen(false);
          setPendingCardioRoutine(null);
        }}
        onSelectCardio={handleSelectCardioMode}
      />

      {/* Android PWA Install Modal */}
      <AndroidInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
