import React, { useState, useEffect } from 'react';
import {
  bleHeartRateService,
  BleConnectionStatus,
  HeartRateZoneName
} from '../utils/bleHeartRateService';
import {
  Heart,
  Watch,
  Bluetooth,
  Activity,
  CheckCircle2,
  X,
  AlertCircle,
  Zap,
  Flame,
  Gauge
} from 'lucide-react';

interface FitbitHeartRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveManualHr?: (data: { avgBpm: number; maxBpm?: number; rpe?: number }) => void;
}

export const FitbitHeartRateModal: React.FC<FitbitHeartRateModalProps> = ({
  isOpen,
  onClose,
  onSaveManualHr,
}) => {
  const [status, setStatus] = useState<BleConnectionStatus>(bleHeartRateService.getStatus());
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentBpm, setCurrentBpm] = useState<number>(bleHeartRateService.getLiveStats().currentBpm);
  const [currentZone, setCurrentZone] = useState<HeartRateZoneName>(bleHeartRateService.getLiveStats().currentZone);
  const [manualAvgBpm, setManualAvgBpm] = useState<string>('138');
  const [manualMaxBpm, setManualMaxBpm] = useState<string>('162');
  const [manualRpe, setManualRpe] = useState<number>(7);
  const isBleSupported = bleHeartRateService.isSupported();

  useEffect(() => {
    if (!isOpen) return;

    setStatus(bleHeartRateService.getStatus());
    const unsubStatus = bleHeartRateService.subscribeStatus((newStatus, msg) => {
      setStatus(newStatus);
      if (msg) setStatusMessage(msg);
    });

    const unsubBpm = bleHeartRateService.subscribeBpm((bpm, zone) => {
      setCurrentBpm(bpm);
      setCurrentZone(zone);
    });

    return () => {
      unsubStatus();
      unsubBpm();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    await bleHeartRateService.connect();
  };

  const handleDisconnect = () => {
    bleHeartRateService.disconnect();
  };

  const handleSaveManual = () => {
    const avg = parseInt(manualAvgBpm, 10);
    const max = parseInt(manualMaxBpm, 10);
    if (!isNaN(avg) && avg > 40 && avg < 240) {
      if (onSaveManualHr) {
        onSaveManualHr({
          avgBpm: avg,
          maxBpm: !isNaN(max) ? max : undefined,
          rpe: manualRpe,
        });
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F131D] border border-rose-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Fitbit & Heart Rate</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  BLE / Manual
                </span>
              </h3>
              <p className="text-xs text-slate-400">Track cardio training intensity zones</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Bluetooth Section */}
        <div className="my-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Watch className="w-4 h-4 text-rose-400" />
                Fitbit Bluetooth (BLE)
              </span>

              <span
                className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                  status === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : status === 'connecting'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Pairing...' : 'Disconnected'}
              </span>
            </div>

            {status === 'connected' ? (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">{bleHeartRateService.getDeviceName()}</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black font-mono text-rose-400">{currentBpm}</span>
                    <span className="text-xs font-semibold text-slate-300">BPM</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">{currentZone}</span>
                  <button
                    onClick={handleDisconnect}
                    className="text-[11px] text-rose-400 hover:text-rose-300 mt-1 underline"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Pair your Fitbit watch or BLE heart rate monitor to stream live BPM during cardio intervals.
                </p>

                {isBleSupported ? (
                  <button
                    onClick={handleConnect}
                    disabled={status === 'connecting'}
                    className="w-full py-2.5 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-transform active:scale-[0.98]"
                  >
                    <Bluetooth className="w-4 h-4" />
                    <span>{status === 'connecting' ? 'Searching for Fitbit...' : 'Pair Fitbit Watch (BLE)'}</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Web Bluetooth is unavailable in this browser. You can input your Fitbit HR data manually below!</span>
                  </div>
                )}
              </div>
            )}

            {statusMessage && status !== 'connected' && (
              <p className="text-[11px] text-slate-400 italic">{statusMessage}</p>
            )}

            <div className="text-[10px] text-slate-500 pt-1">
              Tip: On your Fitbit, ensure Bluetooth pairing/HR Broadcast is enabled in device settings.
            </div>
          </div>

          {/* Manual Input Section */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" />
                Manual Heart Rate Entry
              </span>
              <span className="text-[10px] text-slate-500 font-mono">From Fitbit Screen</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Average BPM
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={manualAvgBpm}
                    onChange={(e) => setManualAvgBpm(e.target.value)}
                    placeholder="138"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">BPM</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Max / Peak BPM
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={manualMaxBpm}
                    onChange={(e) => setManualMaxBpm(e.target.value)}
                    placeholder="165"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">BPM</span>
                </div>
              </div>
            </div>

            {/* Calculated Zone Preview */}
            {parseInt(manualAvgBpm, 10) > 40 && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Intensity:</span>
                <span className="font-bold text-rose-400">
                  {bleHeartRateService.calculateZone(parseInt(manualAvgBpm, 10))}
                </span>
              </div>
            )}

            {/* RPE (Rate of Perceived Exertion) */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-slate-400 font-medium">Perceived Exertion (RPE):</span>
                <span className="text-white font-bold font-mono">{manualRpe} / 10 ({manualRpe >= 8 ? 'Very Hard' : manualRpe >= 6 ? 'Vigorous' : 'Moderate'})</span>
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

            <button
              onClick={handleSaveManual}
              className="w-full py-2.5 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Save Heart Rate to Session</span>
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/25"
        >
          Done
        </button>
      </div>
    </div>
  );
};
