import { ElectronAPI, CompressionAPI, StatsAPI } from '../preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    compression: CompressionAPI;
    stats: StatsAPI;
  }
}

export {}; 