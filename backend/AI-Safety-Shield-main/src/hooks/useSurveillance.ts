// useSurveillance.ts
// React hook (TypeScript) to connect frontend to the backend app.py Socket.IO + REST
// Requires: socket.io-client
// npm install socket.io-client

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Metrics = {
  weapon: number;
  audio: number;
  pose: number;
  proximity: number;
  total: number;
  weapons_detected?: string[];
};

type AlertEntry = {
  id?: number;
  ts?: string;
  time?: string;
  score: number;
  reason: string;
  target?: string;
  lat?: number;
  lon?: number;
};

export default function useSurveillance(apiBase = "") {
  // If apiBase is empty => same-origin
  const socketRef = useRef<Socket | null>(null);
  const [frame, setFrame] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({ weapon:0,audio:0,pose:0,proximity:0,total:0 });
  const [activityLog, setActivityLog] = useState<AlertEntry[]>([]);
  const [armed, setArmed] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const url = (import.meta.env && import.meta.env.DEV && apiBase) ? apiBase : undefined;
    const socket = io(url || undefined, { transports: ["websocket","polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });
    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("frame", (data: any) => {
      if (data && data.image) {
        setFrame("data:image/jpeg;base64," + data.image);
      }
    });

    socket.on("metrics", (m: Metrics) => {
      if (m) setMetrics(m);
    });

    socket.on("activity_log", (log: AlertEntry[]) => {
      if (Array.isArray(log)) setActivityLog(log);
    });

    socket.on("alert", (entry: AlertEntry) => {
      setActivityLog(prev => [entry, ...prev].slice(0, 200));
    });

    socket.on("armed", (s: any) => {
      setArmed(!!s.armed);
    });

    // initial load of alerts via REST (fallback)
    (async () => {
      try {
        const res = await fetch((apiBase || "") + "/api/alerts?limit=200");
        if (res.ok) {
          const j = await res.json();
          if (j && j.alerts) setActivityLog(j.alerts);
        }
      } catch (e) {}
    })();

    return () => {
      try { socket.disconnect(); } catch (e) {}
      socketRef.current = null;
    };
  }, [apiBase]);

  // toggle arm via REST or socket
  const setSystemArmed = async (to: boolean) => {
    setArmed(to);
    try {
      // try REST first
      const res = await fetch((apiBase || "") + "/api/arm", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ arm: to }) });
      if (res.ok) {
        const j = await res.json();
        if (j && typeof j.armed !== "undefined") setArmed(!!j.armed);
      }
    } catch (e) {
      // fallback: socket emit
      try {
        socketRef.current?.emit("toggle_arm", { arm: to });
      } catch {}
    }
  };

  const saveConfig = async (payload: any) => {
    try {
      const res = await fetch((apiBase || "") + "/api/config", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      if (res.ok) {
        const j = await res.json();
        // also inform socket
        try { socketRef.current?.emit("set_onboard", payload); } catch {}
        return j;
      }
      return null;
    } catch (e) {
      console.error("saveConfig error", e);
      return null;
    }
  };

  const sendTestAlert = async () => {
    try {
      const res = await fetch((apiBase || "") + "/api/test-alert", { method: "POST" });
      if (res.ok) return true;
    } catch (e) {}
    return false;
  };

  return {
    connected,
    frame,
    metrics,
    activityLog,
    armed,
    setArmed: setSystemArmed,
    saveConfig,
    sendTestAlert,
  };
}
