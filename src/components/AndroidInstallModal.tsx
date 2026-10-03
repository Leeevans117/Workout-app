import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F131D] border border-blue-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Install on Android</h3>
              <p className="text-xs text-slate-400">Run as a standalone native app</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="my-5 space-y-4">
          {/* Status Badge */}
          {isInstalled ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Already Installed!</strong> ApexPulse is active on this device in standalone mode.
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 leading-relaxed">
              <strong>Yes!</strong> ApexPulse is a Progressive Web App (PWA). It installs directly on Android without needing the Google Play Store—saving storage, working offline, and launching full-screen without browser address bars.
            </div>
          )}

          {/* Quick Install Action Button (if browser prompt available) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="w-full py-4 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <span>Tap to Install App on Android</span>
            </button>
          )}

          {/* Guided Steps for Android Chrome */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>Android Chrome Installation Steps</span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-700/60 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  In Chrome, tap the <strong>three dots (⋮)</strong> in the top right corner.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-700/60 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-700/60 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  The <strong>ApexPulse</strong> app icon will be added to your home screen and app launcher.
                </span>
              </div>
            </div>
          </div>

          {/* iOS Fallback note */}
          {isIOS && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>On iPhone / Safari:</span>
              </div>
              <div>Tap the <strong>Share</strong> button at bottom, then scroll and select <strong>"Add to Home Screen"</strong>.</div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
