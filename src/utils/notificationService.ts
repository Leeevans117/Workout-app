/**
 * Daily Notification Engine for ApexPulse
 * Utilizes the Web Notifications API with permission management,
 * scheduled daily reminders, and background interval checks.
 */

import { WEEKLY_SCHEDULE } from '../data/workoutPlan';

const NOTIF_SETTINGS_KEY = 'apex_notif_settings';
const LAST_NOTIF_DATE_KEY = 'apex_last_notif_date';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" e.g. "08:00"
  notifyOnRestDays: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: '08:00',
  notifyOnRestDays: true,
};

class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private intervalId: number | null = null;

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      this.startScheduler();
    }
  }

  public loadSettings(): NotificationSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(NOTIF_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
    return this.settings;
  }

  public saveSettings(newSettings: Partial<NotificationSettings>): NotificationSettings {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
    return this.settings;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.saveSettings({ enabled: true });
        this.sendImmediateNotification(
          'Notifications Enabled! 🔔',
          `You'll receive daily morning reminders of your scheduled workout plan.`
        );
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }

  public sendImmediateNotification(title: string, body: string, data?: unknown) {
    if (!this.isSupported() || this.getPermission() !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/src/assets/images/workout_hero_banner_1791025439820.jpg',
        badge: '/src/assets/images/workout_hero_banner_1791025439820.jpg',
        tag: 'apex-daily-reminder',
        data,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('System notification dispatch failed, falling back:', e);
    }
  }

  public sendTodayWorkoutNotification() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const schedule = WEEKLY_SCHEDULE[dayOfWeek];
    const routineNames = schedule.plannedRoutines.map((r) => r.routineTitle).join(' + ');
    const totalMins = schedule.plannedRoutines.reduce((acc, r) => acc + r.durationMinutes, 0);

    const title = `Today's Workout: ${schedule.dayName} Split 🏋️`;
    const body = `Expected today: ${routineNames} (~${totalMins} mins). Tap to start your session!`;

    this.sendImmediateNotification(title, body);
  }

  private startScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Check every minute if it matches target reminder time
    this.intervalId = window.setInterval(() => {
      if (!this.settings.enabled || this.getPermission() !== 'granted') return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      const lastSentDate = localStorage.getItem(LAST_NOTIF_DATE_KEY);

      if (currentTimeStr === this.settings.time && lastSentDate !== todayDateStr) {
        this.sendTodayWorkoutNotification();
        localStorage.setItem(LAST_NOTIF_DATE_KEY, todayDateStr);
      }
    }, 60000);
  }
}

export const notificationService = new NotificationService();
