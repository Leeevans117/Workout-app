/**
 * Bluetooth Low Energy (BLE) Heart Rate Service
 * Integrates with Web Bluetooth API for Fitbit and standard BLE Heart Rate monitors.
 * Service UUID: 0x180D (heart_rate)
 * Characteristic UUID: 0x2A37 (heart_rate_measurement)
 */

export type BleConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'unsupported';

export type HeartRateZoneName =
  | 'Zone 1 (Warmup)'
  | 'Zone 2 (Aerobic)'
  | 'Zone 3 (Tempo)'
  | 'Zone 4 (Threshold)'
  | 'Zone 5 (Peak)';

export interface BleHeartRateStats {
  currentBpm: number;
  avgBpm: number;
  maxBpm: number;
  samplesCount: number;
  currentZone: HeartRateZoneName;
  deviceName?: string;
}

class BleHeartRateService {
  private device: any | null = null;
  private server: any | null = null;
  private characteristic: any | null = null;
  private status: BleConnectionStatus = 'disconnected';
  private deviceName: string = '';

  private currentBpm: number = 0;
  private bpmSamples: number[] = [];
  private maxBpm: number = 0;

  private bpmListeners: Array<(bpm: number, zone: HeartRateZoneName) => void> = [];
  private statusListeners: Array<(status: BleConnectionStatus, message?: string) => void> = [];

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public getStatus(): BleConnectionStatus {
    if (!this.isSupported()) return 'unsupported';
    return this.status;
  }

  public getDeviceName(): string {
    return this.deviceName;
  }

  public subscribeBpm(callback: (bpm: number, zone: HeartRateZoneName) => void) {
    this.bpmListeners.push(callback);
    return () => {
      this.bpmListeners = this.bpmListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeStatus(callback: (status: BleConnectionStatus, message?: string) => void) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyStatus(status: BleConnectionStatus, message?: string) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status, message));
  }

  private notifyBpm(bpm: number) {
    this.currentBpm = bpm;
    this.bpmSamples.push(bpm);
    if (bpm > this.maxBpm) {
      this.maxBpm = bpm;
    }
    const zone = this.calculateZone(bpm);
    this.bpmListeners.forEach((cb) => cb(bpm, zone));
  }

  public calculateZone(bpm: number, maxUserHr: number = 185): HeartRateZoneName {
    const percent = (bpm / maxUserHr) * 100;
    if (percent < 60) return 'Zone 1 (Warmup)';
    if (percent < 70) return 'Zone 2 (Aerobic)';
    if (percent < 80) return 'Zone 3 (Tempo)';
    if (percent < 90) return 'Zone 4 (Threshold)';
    return 'Zone 5 (Peak)';
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.notifyStatus('unsupported', 'Web Bluetooth API is not supported in this browser.');
      return false;
    }

    try {
      this.notifyStatus('connecting', 'Pairing with Fitbit or BLE Heart Rate monitor...');

      // Request device with standard Heart Rate Service or Fitbit filters
      const navBluetooth = (navigator as any).bluetooth;
      this.device = await navBluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Charge' },
          { namePrefix: 'Versa' },
          { namePrefix: 'Sense' },
        ],
        optionalServices: ['heart_rate', 0x180D],
      });

      this.deviceName = this.device.name || 'Fitbit Device';

      this.device.addEventListener('gattserverdisconnected', () => {
        this.notifyStatus('disconnected', `${this.deviceName} was disconnected.`);
      });

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService('heart_rate');
      this.characteristic = await service.getCharacteristic('heart_rate_measurement');

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const bpm = this.parseHeartRate(value);
        if (bpm > 0) {
          this.notifyBpm(bpm);
        }
      });

      this.notifyStatus('connected', `Connected to ${this.deviceName}`);
      return true;
    } catch (error: any) {
      console.warn('Bluetooth connection error:', error);
      this.notifyStatus('error', error.message || 'Failed to connect to Bluetooth device.');
      return false;
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.notifyStatus('disconnected');
  }

  public resetSession() {
    this.bpmSamples = [];
    this.maxBpm = 0;
    this.currentBpm = 0;
  }

  public getLiveStats(): BleHeartRateStats {
    const avg =
      this.bpmSamples.length > 0
        ? Math.round(this.bpmSamples.reduce((a, b) => a + b, 0) / this.bpmSamples.length)
        : this.currentBpm;

    return {
      currentBpm: this.currentBpm,
      avgBpm: avg,
      maxBpm: this.maxBpm,
      samplesCount: this.bpmSamples.length,
      currentZone: this.calculateZone(this.currentBpm),
      deviceName: this.deviceName,
    };
  }

  /**
   * Standard Bluetooth SIG Heart Rate Measurement Parsing (GATT 0x2A37)
   */
  private parseHeartRate(dataView: DataView): number {
    const flags = dataView.getUint8(0);
    const rate16Bits = flags & 0x1;
    let bpm = 0;
    if (rate16Bits) {
      bpm = dataView.getUint16(1, /*littleEndian=*/ true);
    } else {
      bpm = dataView.getUint8(1);
    }
    return bpm;
  }
}

export const bleHeartRateService = new BleHeartRateService();
