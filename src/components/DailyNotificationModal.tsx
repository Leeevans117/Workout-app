import React, { useState, useEffect } from 'react';
import { notificationService, NotificationSettings } from '../utils/notificationService';
import {
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  Send
} from 'lucide-react';

interface DailyNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyNotificationModal: React.FC<DailyNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.loadSettings());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermission());
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.loadSettings());
      setPermission(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableToggle = async () => {
    if (!settings.enabled) {
      const granted = await notificationService.requestPermission();
      setPermission(notificationService.getPermission());
      if (granted) {
        setSettings(notificationService.saveSettings({ enabled: true }));
      }
    } else {
      setSettings(notificationService.saveSettings({ enabled: false }));
    }
  };

  const handleTimeChange = (newTime: string) => {
    setSettings(notificationService.saveSettings({ time: newTime }));
  };

  const handleSendTest = () => {
    notificationService.sendTodayWorkoutNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F131D] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Daily Workout Reminders</h3>
              <p className="text-xs text-slate-400">Get notified what needs to be done each day</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-5">
          {/* Permission Status */}
          {permission === 'denied' && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Notifications are blocked in your browser settings. Please click the padlock icon in your browser address bar to allow notifications for this app.
              </span>
            </div>
          )}

          {/* Toggle Daily Reminders */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white">Daily Schedule Notification</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Sends today's split and estimated time
              </p>
            </div>

            <button
              onClick={handleEnableToggle}
              className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
                settings.enabled && permission === 'granted'
                  ? 'bg-blue-600 justify-end'
                  : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Preferred Time Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Notification Delivery Time
              </span>
              <span className="text-xs font-mono text-blue-400">{settings.time}</span>
            </div>

            <div className="flex items-center gap-2">
              {['07:00', '08:00', '09:00', '18:00'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleTimeChange(preset)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    settings.time === preset
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Custom Time:</span>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Live Notification Preview Box */}
          <div className="p-3.5 rounded-2xl bg-[#090C13] border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Sample Notification Preview
            </span>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Today's Workout: Saturday Split 🏋️</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Expected today: McGill Big 3 + Strength (~47 mins). Tap to start your session!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {/* Test Notification Button */}
          <button
            onClick={handleSendTest}
            className="w-full py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span>{testSent ? 'Notification Dispatched ✓' : 'Send Test Notification Now'}</span>
          </button>

          {/* Save / Done button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-transform active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
