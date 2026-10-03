import React from 'react';
import { WorkoutLogEntry } from '../types/workout';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { Heart, Activity, Flame, Zap, TrendingUp, Watch } from 'lucide-react';

interface HeartRateTrendChartProps {
  logs: WorkoutLogEntry[];
  onOpenFitbitModal: () => void;
}

interface ChartDataPoint {
  dateStr: string;
  dayLabel: string;
  fullDate: string;
  avgBpm: number | null;
  maxBpm: number | null;
  routineTitle?: string;
  zone?: string;
  hasWorkout: boolean;
}

export const HeartRateTrendChart: React.FC<HeartRateTrendChartProps> = ({
  logs,
  onOpenFitbitModal,
}) => {
  // Generate the last 7 days window (from 6 days ago up to today)
  const today = new Date();
  const last7Days: ChartDataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Look for workout logs on this date with heart rate data
    const dayLogs = logs.filter((l) => l.date === dateStr);
    const hrLog = dayLogs.find((l) => l.heartRate && l.heartRate.avgBpm > 0);

    if (hrLog && hrLog.heartRate) {
      last7Days.push({
        dateStr,
        dayLabel,
        fullDate,
        avgBpm: hrLog.heartRate.avgBpm,
        maxBpm: hrLog.heartRate.maxBpm ?? Math.round(hrLog.heartRate.avgBpm * 1.15),
        routineTitle: hrLog.routineTitle,
        zone: hrLog.heartRate.zone,
        hasWorkout: true,
      });
    } else if (dayLogs.length > 0) {
      // Completed workout but no explicit heart rate logged; provide estimated aerobic baseline
      last7Days.push({
        dateStr,
        dayLabel,
        fullDate,
        avgBpm: 125,
        maxBpm: 145,
        routineTitle: dayLogs[0].routineTitle,
        zone: 'Zone 2 (Aerobic)',
        hasWorkout: true,
      });
    } else {
      // Rest day: connect trend smoothly with resting base
      last7Days.push({
        dateStr,
        dayLabel,
        fullDate,
        avgBpm: null,
        maxBpm: null,
        hasWorkout: false,
      });
    }
  }

  // Calculate 7-day stats
  const validAvgPoints = last7Days.filter((p) => p.avgBpm !== null);
  const avgWeeklyBpm =
    validAvgPoints.length > 0
      ? Math.round(validAvgPoints.reduce((acc, p) => acc + (p.avgBpm || 0), 0) / validAvgPoints.length)
      : 136;

  const validMaxPoints = last7Days.filter((p) => p.maxBpm !== null);
  const peakWeeklyBpm =
    validMaxPoints.length > 0
      ? Math.max(...validMaxPoints.map((p) => p.maxBpm || 0))
      : 168;

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-[#0B0E17]/95 border border-rose-500/40 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white">{data.dayLabel}, {data.fullDate}</span>
            {data.hasWorkout && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Logged
              </span>
            )}
          </div>

          {data.routineTitle && (
            <div className="text-[11px] text-slate-300 truncate">
              {data.routineTitle}
            </div>
          )}

          {data.avgBpm ? (
            <>
              <div className="flex items-center justify-between text-rose-400 font-mono">
                <span className="text-slate-400">Avg HR:</span>
                <span className="font-bold text-sm">{data.avgBpm} BPM</span>
              </div>
              {data.maxBpm && (
                <div className="flex items-center justify-between text-orange-400 font-mono">
                  <span className="text-slate-400">Peak HR:</span>
                  <span className="font-bold">{data.maxBpm} BPM</span>
                </div>
              )}
              {data.zone && (
                <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
                  Intensity: {data.zone}
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500 text-[11px] italic py-1">
              Rest day (No cardio logged)
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0F131D] border-2 border-rose-900/30 hover:border-rose-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Heart Rate Trends (7-Day)</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold">
                Fitbit / BLE
              </span>
            </div>
            <p className="text-xs text-slate-400">Continuous cardiovascular intensity & recovery curves</p>
          </div>
        </div>

        {/* Quick Pair / Log HR button */}
        <button
          onClick={onOpenFitbitModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/40 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors self-start sm:self-center"
        >
          <Watch className="w-3.5 h-3.5 text-rose-400" />
          <span>Connect / Log HR</span>
        </button>
      </div>

      {/* 3 Metric Summary Stats Pills */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">7-Day Avg HR</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-400">{avgWeeklyBpm}</span>
            <span className="text-[10px] text-slate-400 font-mono">BPM</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Peak Session HR</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-orange-400">{peakWeeklyBpm}</span>
            <span className="text-[10px] text-slate-400 font-mono">BPM</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Target Zone</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-400 block truncate mt-1">
            Zone 2 Aerobic
          </span>
        </div>
      </div>

      {/* Recharts LineChart Visualizer */}
      <div className="w-full h-56 sm:h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last7Days} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="avgHrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

            <XAxis
              dataKey="dayLabel"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />

            <YAxis
              domain={[90, 185]}
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Aerobic Zone Reference Line (135 BPM) */}
            <ReferenceLine
              y={135}
              stroke="#10B981"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: 'Zone 2 Base (135)',
                position: 'right',
                fill: '#10B981',
                fontSize: 9,
                fontWeight: 600,
              }}
            />

            {/* Threshold Zone Reference Line (160 BPM) */}
            <ReferenceLine
              y={160}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: 'Threshold (160)',
                position: 'right',
                fill: '#F59E0B',
                fontSize: 9,
                fontWeight: 600,
              }}
            />

            {/* Max / Peak BPM Line (Orange dotted) */}
            <Line
              type="monotone"
              dataKey="maxBpm"
              stroke="#FB923C"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#FB923C', strokeWidth: 0 }}
              connectNulls={true}
              name="Peak HR"
            />

            {/* Average Heart Rate Primary Line (Neon Rose Solid with Glow) */}
            <Line
              type="monotone"
              dataKey="avgBpm"
              stroke="#F43F5E"
              strokeWidth={3}
              dot={{ r: 4, fill: '#F43F5E', stroke: '#0F131D', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FDA4AF', stroke: '#F43F5E', strokeWidth: 3 }}
              connectNulls={true}
              name="Avg HR"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Guidance Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300 font-medium">Average BPM</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-orange-400" />
            <span className="text-slate-300 font-medium">Peak BPM</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-500">
          Optimal McGill cardio interval: maintain Zone 2 (60-70% max HR)
        </div>
      </div>
    </div>
  );
};
