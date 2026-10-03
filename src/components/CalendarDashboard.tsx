import React, { useState } from 'react';
import { WorkoutLogEntry } from '../types/workout';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Flame,
  Clock,
  Trophy,
  Plus,
  Trash2,
  Activity,
  Zap,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface CalendarDashboardProps {
  logs: WorkoutLogEntry[];
  onToggleDateCompletion: (dateStr: string) => void;
  onAddCustomLog: (dateStr: string, routineTitle: string, durationMinutes: number) => void;
  onDeleteLog: (id: string) => void;
}

export const CalendarDashboard: React.FC<CalendarDashboardProps> = ({
  logs,
  onToggleDateCompletion,
  onAddCustomLog,
  onDeleteLog,
}) => {
  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [quickLogTitle, setQuickLogTitle] = useState('McGill Big 3 Routine');
  const [quickLogDuration, setQuickLogDuration] = useState('20');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in current month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create a map of dateStr -> logs
  const logsByDate: Record<string, WorkoutLogEntry[]> = {};
  logs.forEach((log) => {
    if (!logsByDate[log.date]) {
      logsByDate[log.date] = [];
    }
    logsByDate[log.date].push(log);
  });

  // Calculate Streak & Stats
  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    const checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (logsByDate[dateStr] && logsByDate[dateStr].length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today hasn't been done yet, check if yesterday was done
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (logsByDate[yesterdayStr] && logsByDate[yesterdayStr].length > 0) {
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

  // Monthly stats
  const currentMonthLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalMonthlyMinutes = Math.round(
    currentMonthLogs.reduce((acc, l) => acc + l.durationSeconds, 0) / 60
  );

  const daysWithWorkoutsInMonth = new Set(currentMonthLogs.map((l) => l.date)).size;
  const consistencyRate = Math.round((daysWithWorkoutsInMonth / daysInMonth) * 100);

  // Selected date logs
  const selectedDayLogs = logsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Header & Consistency Highlights */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Consistency & Progress Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Every completed workout automatically places a verified tick on your calendar.
          </p>
        </div>

        {/* Quick Streak Card */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-orange-950/30 border border-orange-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-400 block tracking-wider">
                Current Streak
              </span>
              <span className="text-lg font-extrabold font-mono text-white">
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Consistency
              </span>
              <span className="text-lg font-extrabold font-mono text-white">
                {consistencyRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0F131D] border border-slate-800 rounded-3xl p-6 shadow-xl">
          {/* Calendar Header with Month/Year Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {monthNames[month]} {year}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset cells for start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-2xl opacity-20 pointer-events-none" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayLogs = logsByDate[dateStr] || [];
              const hasWorkouts = dayLogs.length > 0;
              const isSelected = selectedDateStr === dateStr;
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              // Check if McGill workout was completed
              const hasMcGill = dayLogs.some((l) => l.category === 'mcgill' || l.routineTitle.toLowerCase().includes('mcgill'));
              const hasCardio = dayLogs.some((l) => l.category === 'cardio' || l.routineTitle.toLowerCase().includes('bike') || l.routineTitle.toLowerCase().includes('spin'));

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`group relative aspect-square rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all duration-150 border text-left ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/20'
                      : hasWorkouts
                      ? 'border-emerald-500/50 bg-emerald-950/15 hover:border-emerald-400'
                      : isToday
                      ? 'border-slate-700 bg-slate-900/90 hover:border-slate-600'
                      : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  {/* Day Number */}
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold font-mono ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                          : hasWorkouts
                          ? 'text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Tiny category indicator dot if multiple */}
                    <div className="flex gap-1">
                      {hasMcGill && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                      {hasCardio && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </div>
                  </div>

                  {/* Centered Green/Neon Checkmark Tick when Workout Completed */}
                  <div className="flex-1 flex items-center justify-center">
                    {hasWorkouts ? (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border border-emerald-400/80 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/40 animate-in zoom-in-50 duration-200">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-400/20" />
                      </div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Workout Completed (✓)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> McGill Big 3
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> E-Bike / Spinning
            </span>
          </div>
        </div>

        {/* Selected Day Details Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0F131D] border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedDayLogs.length} Completed Session(s)
                </span>
              </div>

              {/* Fast Toggle Button */}
              <button
                onClick={() => onToggleDateCompletion(selectedDateStr)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  selectedDayLogs.length > 0
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{selectedDayLogs.length > 0 ? 'Marked ✓' : 'Mark Done'}</span>
              </button>
            </div>

            {/* List of Workouts on Selected Day */}
            <div className="mt-4 space-y-2.5">
              {selectedDayLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No workout logged on this date. Click "Mark Done" or add a session below.
                </div>
              ) : (
                selectedDayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        {log.cardioMode ? <Zap className="w-4 h-4 text-blue-400" /> : <ShieldCheck className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">
                          {log.routineTitle}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {Math.round(log.durationSeconds / 60)} mins • {log.cardioMode ? `Mode: ${log.cardioMode}` : 'Sets Complete'}
                        </span>
                        {log.heartRate && (
                          <div className="flex items-center gap-1.5 text-[10px] text-rose-300 mt-0.5">
                            <Heart className="w-3 h-3 text-rose-400 fill-current" />
                            <span className="font-mono font-bold">{log.heartRate.avgBpm} BPM</span>
                            {log.heartRate.zone && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-800/40 text-[9px] font-semibold text-rose-300">
                                {log.heartRate.zone.split(' ')[0]}
                              </span>
                            )}
                            {log.heartRate.rpe && (
                              <span className="text-slate-400 text-[9px]">RPE {log.heartRate.rpe}/10</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors opacity-60 hover:opacity-100"
                      title="Remove Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Session Log */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Log Past Session
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={quickLogTitle}
                  onChange={(e) => setQuickLogTitle(e.target.value)}
                  placeholder="Routine name..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quickLogDuration}
                    onChange={(e) => setQuickLogDuration(e.target.value)}
                    placeholder="Mins"
                    className="w-24 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (!quickLogTitle.trim()) return;
                      onAddCustomLog(selectedDateStr, quickLogTitle, Number(quickLogDuration) || 20);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log to {selectedDateStr}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Month Summary Stats Box */}
          <div className="p-4 rounded-3xl bg-[#0F131D] border border-slate-800 text-xs space-y-2">
            <span className="text-slate-400 font-medium block">Monthly Total</span>
            <div className="flex items-center justify-between text-white font-mono">
              <span>Time Trained:</span>
              <span className="font-bold text-blue-400">{totalMonthlyMinutes} minutes</span>
            </div>
            <div className="flex items-center justify-between text-white font-mono">
              <span>Sessions Completed:</span>
              <span className="font-bold text-emerald-400">{currentMonthLogs.length} workouts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
