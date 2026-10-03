import React, { useState } from 'react';
import { WorkoutRoutine, WorkoutLogEntry } from '../types/workout';
import { WEEKLY_SCHEDULE } from '../data/workoutPlan';
import { soundEngine } from '../utils/audioNotification';
import { DailyNotificationModal } from './DailyNotificationModal';
import { AndroidInstallModal } from './AndroidInstallModal';
import { WorkoutAnatomyModal } from './WorkoutAnatomyModal';
import { FitbitHeartRateModal } from './FitbitHeartRateModal';
import { HeartRateTrendChart } from './HeartRateTrendChart';
import { EditRoutineModal } from './EditRoutineModal';
import { notificationService } from '../utils/notificationService';
import {
  Play,
  ShieldCheck,
  Zap,
  Flame,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Volume2,
  VolumeX,
  ChevronRight,
  BellRing,
  Bell,
  Dumbbell,
  Sparkles,
  ArrowRight,
  Trophy,
  Target,
  Compass,
  Smartphone,
  Heart,
  Edit3
} from 'lucide-react';

interface MainDashboardProps {
  routines: WorkoutRoutine[];
  logs: WorkoutLogEntry[];
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onSelectMcGillTab: () => void;
  onSelectCalendarTab: () => void;
  onUpdateRoutine?: (routine: WorkoutRoutine) => void;
  onResetRoutines?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  routines,
  logs,
  onStartRoutine,
  onSelectMcGillTab,
  onSelectCalendarTab,
  onUpdateRoutine,
  onResetRoutines,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [showSoundTest, setShowSoundTest] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isFitbitModalOpen, setIsFitbitModalOpen] = useState(false);
  const [anatomyModalRoutine, setAnatomyModalRoutine] = useState<WorkoutRoutine | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const notifSettings = notificationService.loadSettings();

  const toggleSound = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const todayStr = today.toISOString().split('T')[0];

  // Today's scheduled plan from weekly schedule
  const todaySchedule = WEEKLY_SCHEDULE[dayOfWeek];

  // Check which workouts from today's plan have been completed today
  const todayLogs = logs.filter((l) => l.date === todayStr);
  const isTodayFullyCompleted = todayLogs.length > 0;

  // Find corresponding routine objects
  const mcgillRoutine = routines.find((r) => r.id === 'mcgill-big-3') || routines[0];
  const strengthRoutine = routines.find((r) => r.id === 'strength') || routines[1];
  const cardioRoutine = routines.find((r) => r.id === 'cardio-session') || routines[2];

  // Primary routine to recommend right now
  const nextRecommendedRoutine = (() => {
    // If today schedule has multiple, pick the one not yet logged today
    for (const item of todaySchedule.plannedRoutines) {
      const alreadyDone = todayLogs.some((l) => l.routineId === item.routineId);
      if (!alreadyDone) {
        return routines.find((r) => r.id === item.routineId) || mcgillRoutine;
      }
    }
    return mcgillRoutine;
  })();

  // 7 Days of the week Monday to Sunday
  const currentDayIndex = today.getDay(); // 0 is Sun
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const weekOverview = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const dow = d.getDay();
    const sched = WEEKLY_SCHEDULE[dow];
    const isCompleted = logs.some((l) => l.date === dStr);
    const isCurrentToday = dStr === todayStr;

    return {
      dateStr: dStr,
      dayNum: d.getDate(),
      dayShort: sched.dayShort,
      dayName: sched.dayName,
      routinesSummary: sched.plannedRoutines.map((p) => p.routineTitle).join(' + '),
      plannedList: sched.plannedRoutines,
      isCompleted,
      isCurrentToday,
    };
  });

  // Gamified metrics: Current Streak & Total Workouts This Week
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date(today);
    const logsByDate = new Set(logs.map((l) => l.date));

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (logsByDate.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (logsByDate.has(yesterdayStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Total workouts logged this week (from Monday to Sunday)
  const weekDatesSet = new Set(weekOverview.map((w) => w.dateStr));
  const currentWeekLogs = logs.filter((l) => weekDatesSet.has(l.date));
  const totalWorkoutsThisWeek = currentWeekLogs.length;
  const weeklyTarget = 5; // Standard 5-session weekly milestone
  const weeklyProgressPercent = Math.min(100, Math.round((totalWorkoutsThisWeek / weeklyTarget) * 100));

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header & Quick Audio Status */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Daily Workout Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Fitbit Heart Rate button */}
          <button
            onClick={() => setIsFitbitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/40 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors"
            title="Pair Fitbit Watch / BLE Heart Rate"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span className="hidden sm:inline">Fitbit HR</span>
          </button>

          {/* Android App Install button */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-xs font-semibold text-blue-300 hover:text-white hover:bg-blue-600/30 transition-colors"
            title="Install as Android App"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Install on Android</span>
          </button>

          {/* Daily Schedule Notifications button */}
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Configure Daily Workout Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Daily Reminders</span>
          </button>

          {/* Audio Notifications Test button */}
          <button
            onClick={() => setShowSoundTest(!showSoundTest)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <BellRing className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Sound Cues</span>
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
        </div>
      </div>

      {/* Sound Testing Drawer */}
      {showSoundTest && (
        <div className="p-4 rounded-3xl bg-[#10141F] border border-blue-500/30 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <BellRing className="w-4 h-4" />
              <span>Integrated Workout Sound Notifications</span>
            </div>
            <button onClick={() => setShowSoundTest(false)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The app automatically triggers these distinct synthesized sounds as you train:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => soundEngine.playExerciseEndSound()}
              className="py-2.5 px-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left hover:bg-emerald-900/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-300">1. Exercise Ends</span>
                <Play className="w-3 h-3 text-emerald-400 fill-current" />
              </div>
              <span className="text-[10px] text-slate-400 block">Tri-tone ascending chord</span>
            </button>

            <button
              onClick={() => soundEngine.playRestStartSound()}
              className="py-2.5 px-3 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-left hover:bg-blue-900/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-300">2. Rest Begins</span>
                <Play className="w-3 h-3 text-blue-400 fill-current" />
              </div>
              <span className="text-[10px] text-slate-400 block">Gentle descending bell chime</span>
            </button>

            <button
              onClick={() => soundEngine.playRestEndSound()}
              className="py-2.5 px-3 rounded-2xl bg-orange-950/40 border border-orange-500/40 text-left hover:bg-orange-900/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-orange-300">3. Rest Ends</span>
                <Play className="w-3 h-3 text-orange-400 fill-current" />
              </div>
              <span className="text-[10px] text-slate-400 block">Energetic double alert</span>
            </button>
          </div>
        </div>
      )}

      {/* Notification Opt-In Banner (Shown if not enabled yet) */}
      {!notifSettings.enabled && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Never miss your daily routine</h4>
              <p className="text-[11px] text-slate-300">
                Receive a daily morning reminder with what's scheduled for today and estimated completion time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="py-2 px-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-transform active:scale-[0.98] whitespace-nowrap self-start sm:self-center"
          >
            Enable Daily Notifications
          </button>
        </div>
      )}

      {/* ========================================================
          GAMIFIED PROGRESS SUMMARY: Current Streak & Total Workouts This Week
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Current Streak */}
        <div 
          onClick={onSelectCalendarTab}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A120A] via-[#140E0A] to-[#0A0D14] border border-orange-500/40 p-5 shadow-xl cursor-pointer hover:border-orange-400/80 transition-all group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
                <Flame className="w-6 h-6 fill-current animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
                  Current Streak
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-white tabular-nums tracking-tight">
                    {currentStreak}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
              {currentStreak >= 3 ? '🔥 On Fire' : 'Active Streak'}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-orange-950/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              {currentStreak > 0
                ? 'Consistency locked in • Tap to view tracker'
                : 'Complete today to begin your streak!'}
            </span>
            <span className="text-orange-400 text-xs font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Tracker <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Total Workouts This Week */}
        <div 
          onClick={onSelectCalendarTab}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1A12] via-[#08140E] to-[#0A0D14] border border-emerald-500/40 p-5 shadow-xl cursor-pointer hover:border-emerald-400/80 transition-all group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Total Workouts This Week
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-white tabular-nums tracking-tight">
                    {totalWorkoutsThisWeek}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">
                    / {weeklyTarget} Target
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              {weeklyProgressPercent}% of Goal
            </span>
          </div>

          {/* Gamified Weekly Progress Bar */}
          <div className="mt-4 pt-3 border-t border-emerald-950/60 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.min(100, weeklyProgressPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{Math.max(0, weeklyTarget - totalWorkoutsThisWeek)} session{weeklyTarget - totalWorkoutsThisWeek === 1 ? '' : 's'} remaining this week</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Calendar <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          INTUITIVE "WHAT'S EXPECTED TODAY" HERO CARD
          ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#121828] via-[#0E1320] to-[#0A0D14] border-2 border-blue-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                What's Expected Today • {todaySchedule.dayName}
              </span>

              {isTodayFullyCompleted ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Completed ✓
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30">
                  Ready to Start
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {todaySchedule.plannedRoutines.map((p) => p.routineTitle).join(' + ')}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {todaySchedule.plannedRoutines.length > 1
                ? 'Your scheduled split today combines the McGill Big 3 for spine endurance with your full Strength session. Complete both to lock in your daily checkmark.'
                : todaySchedule.plannedRoutines[0].category === 'cardio'
                ? 'Cardio endurance day: Select between outdoor E-Bike or indoor Spinning before starting your interval session.'
                : 'Spine hygiene maintenance day: McGill Modified Curl-Up, Side Bridge, and Bird Dog with 10-second preparation timers.'}
            </p>

            {/* List of Expected Sessions Today with Status */}
            <div className="flex flex-wrap gap-2.5 mt-4">
              {todaySchedule.plannedRoutines.map((planned) => {
                const isRoutineDone = todayLogs.some((l) => l.routineId === planned.routineId);
                const rObj = routines.find((r) => r.id === planned.routineId);

                return (
                  <div
                    key={planned.routineId}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-medium ${
                      isRoutineDone
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/80 border-slate-700 text-white'
                    }`}
                  >
                    {isRoutineDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    )}
                    <span>{planned.routineTitle}</span>
                    <span className="text-slate-400 text-[11px] font-mono">({planned.durationMinutes}m)</span>
                    {!isRoutineDone && rObj && (
                      <button
                        onClick={() => onStartRoutine(rObj)}
                        className="ml-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 underline"
                      >
                        Start
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Start Action: Pill button matching reference */}
          <div className="shrink-0 flex flex-col gap-2.5">
            <button
              onClick={() => onStartRoutine(nextRecommendedRoutine)}
              className="py-4 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 transition-transform active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {isTodayFullyCompleted
                  ? 'Repeat Workout'
                  : `Start ${nextRecommendedRoutine.title}`}
              </span>
            </button>
            <span className="text-[11px] text-center text-slate-400 font-mono">
              Auto-marks calendar upon completion
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          7-DAY WEEKLY SCHEDULE OVERVIEW
          ======================================================== */}
      <div className="bg-[#0F131D] border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Weekly Schedule: Expected Workouts
            </h3>
          </div>
          <button
            onClick={onSelectCalendarTab}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>Full Month Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {weekOverview.map((item) => (
            <div
              key={item.dateStr}
              onClick={onSelectCalendarTab}
              className={`cursor-pointer rounded-2xl p-3 flex flex-col justify-between transition-all border ${
                item.isCurrentToday
                  ? 'bg-blue-950/30 border-blue-500/80 ring-2 ring-blue-500/20'
                  : item.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold ${item.isCurrentToday ? 'text-blue-400' : 'text-slate-400'}`}>
                    {item.dayShort} {item.dayNum}
                  </span>
                  {item.isCurrentToday && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-blue-500 text-white">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1.5">
                  {item.plannedList.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className={`text-[10px] font-semibold block leading-tight truncate px-1.5 py-0.5 rounded ${
                        p.category === 'mcgill'
                          ? 'bg-purple-950/50 text-purple-300 border border-purple-800/40'
                          : p.category === 'strength'
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                          : 'bg-blue-950/50 text-blue-300 border border-blue-800/40'
                      }`}
                    >
                      {p.routineTitle}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.plannedList.reduce((acc, p) => acc + p.durationMinutes, 0)}m
                </span>
                {item.isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-400/20" />
                  </div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Heart Rate Trends Performance Chart */}
      <HeartRateTrendChart
        logs={logs}
        onOpenFitbitModal={() => setIsFitbitModalOpen(true)}
      />

      {/* ========================================================
          THE 3 CORE SESSIONS (McGill Big 3, Strength, Cardio)
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Your Workout Sessions</h3>
            <p className="text-xs text-slate-400">All non-McGill movements unified under Strength</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: McGill Big 3 */}
          <div className="bg-[#0F131D] border-2 border-purple-900/40 hover:border-purple-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  Spine Protocol
                </span>
                <span className="text-xs font-mono text-purple-300">15 mins</span>
              </div>

              <h4 className="text-xl font-bold text-white mb-1">{mcgillRoutine.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Curl-Up, Side Bridge, and Bird Dog with mandatory 10-second preparation timers.
              </p>

              <div className="p-2.5 rounded-2xl bg-purple-950/20 border border-purple-900/30 text-[11px] text-purple-200 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                  <span>3 Exercises Included:</span>
                </div>
                <div className="text-slate-300 text-[10px]">
                  1. Curl-Up • 2. Side Bridge • 3. Bird Dog
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => setAnatomyModalRoutine(mcgillRoutine)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 transition-colors"
                title="Inspect McGill Spine Biomechanics"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Anatomy Model</span>
              </button>

              <button
                onClick={() => onStartRoutine(mcgillRoutine)}
                className="py-2 px-5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-transform active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Big 3</span>
              </button>
            </div>
          </div>

          {/* Card 2: Strength (Unified all non-McGill exercises) */}
          <div className="bg-[#0F131D] border-2 border-emerald-900/40 hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-emerald-400" />
                  Full Body
                </span>
                <span className="text-xs font-mono text-emerald-300">32 mins</span>
              </div>

              <h4 className="text-xl font-bold text-white mb-1">{strengthRoutine.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Complete resistance session with automatic rest timers between sets.
              </p>

              <div className="p-2.5 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 text-[11px] text-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-300">
                  <span>{strengthRoutine.exercises.length} Exercises Included:</span>
                  <button
                    onClick={() => setEditingRoutine(strengthRoutine)}
                    className="text-[10px] text-emerald-400 hover:text-white underline font-semibold flex items-center gap-1"
                    title="Edit exercises to match your spreadsheet"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Match Spreadsheet</span>
                  </button>
                </div>
                <div className="text-slate-300 text-[10px] leading-tight">
                  {strengthRoutine.exercises.length > 0
                    ? strengthRoutine.exercises.map((e) => e.name).join(' • ')
                    : 'No exercises added yet'}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => setAnatomyModalRoutine(strengthRoutine)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors"
                title="Inspect Strength Joint Kinematics"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Anatomy Model</span>
              </button>

              <button
                onClick={() => onStartRoutine(strengthRoutine)}
                className="py-2 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-transform active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Strength</span>
              </button>
            </div>
          </div>

          {/* Card 3: Cardio (E-Bike / Spinning) */}
          <div className="bg-[#0F131D] border-2 border-blue-900/40 hover:border-blue-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  Cardio
                </span>
                <span className="text-xs font-mono text-blue-300">35 mins</span>
              </div>

              <h4 className="text-xl font-bold text-white mb-1">{cardioRoutine.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Aerobic interval conditioning. Choose between outdoor E-Bike or indoor Spinning.
              </p>

              <div className="p-2.5 rounded-2xl bg-blue-950/20 border border-blue-900/30 text-[11px] text-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                  <span>Modality Options:</span>
                </div>
                <div className="text-slate-300 text-[10px]">
                  • E-Bike (Trail/Road) • Spinning Indoors (RPM Tempo)
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => setAnatomyModalRoutine(cardioRoutine)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
                title="Inspect Cardio Kinetic Cadence"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Anatomy Model</span>
              </button>

              <button
                onClick={() => onStartRoutine(cardioRoutine)}
                className="py-2 px-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-transform active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Select & Start</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Notification Reminder Configuration Modal */}
      <DailyNotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* Android PWA Install Guidance Modal */}
      <AndroidInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Workout Biomechanical Anatomy Model Inspector Modal */}
      <WorkoutAnatomyModal
        routine={anatomyModalRoutine}
        isOpen={!!anatomyModalRoutine}
        onClose={() => setAnatomyModalRoutine(null)}
        onStartExercise={(routine, exIdx) => {
          onStartRoutine(routine);
        }}
      />

      {/* Fitbit & BLE Heart Rate Modal */}
      <FitbitHeartRateModal
        isOpen={isFitbitModalOpen}
        onClose={() => setIsFitbitModalOpen(false)}
      />

      {/* Edit Routine Modal for Customizing / Matching Spreadsheet */}
      {editingRoutine && (
        <EditRoutineModal
          routine={editingRoutine}
          isOpen={!!editingRoutine}
          onClose={() => setEditingRoutine(null)}
          onSaveRoutine={(updated) => {
            if (onUpdateRoutine) onUpdateRoutine(updated);
            setEditingRoutine(null);
          }}
          onResetToDefault={() => {
            if (onResetRoutines) onResetRoutines();
            setEditingRoutine(null);
          }}
        />
      )}
    </div>
  );
};
