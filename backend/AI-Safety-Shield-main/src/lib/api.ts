// API client for AI Safety Shield backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Metrics {
  weapon: number;
  audio: number;
  pose: number;
  proximity: number;
  total: number;
}

export interface LogEntry {
  time: string;
  score: number;
  reason: string;
}

export interface StatusResponse {
  armed: boolean;
  status: 'SAFE' | 'WARNING' | 'DANGER';
  metrics: Metrics;
  weapons_detected: string[];
}

export interface ConfigPayload {
  emergency_number?: string;
  fixed_lat?: number;
  fixed_lon?: number;
}

class SafetyShieldAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getStatus(): Promise<StatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/status`);
    if (!response.ok) throw new Error('Failed to fetch status');
    return response.json();
  }

  async getMetrics(): Promise<Metrics> {
    const response = await fetch(`${this.baseUrl}/api/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  }

  async setArmed(armed: boolean): Promise<{ armed: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/arm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ armed }),
    });
    if (!response.ok) throw new Error('Failed to set armed state');
    return response.json();
  }

  async setConfig(config: ConfigPayload): Promise<ConfigPayload> {
    const response = await fetch(`${this.baseUrl}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to set config');
    return response.json();
  }

  async sendTestAlert(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/test-alert`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send test alert');
    }
    return response.json();
  }

  async getActivityLog(): Promise<LogEntry[]> {
    const response = await fetch(`${this.baseUrl}/api/activity-log`);
    if (!response.ok) throw new Error('Failed to fetch activity log');
    return response.json();
  }

  async getFrame(): Promise<{ image: string | null }> {
    const response = await fetch(`${this.baseUrl}/api/frame`);
    if (!response.ok) throw new Error('Failed to fetch frame');
    return response.json();
  }
}

export const api = new SafetyShieldAPI();
export default api;
