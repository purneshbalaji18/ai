import { cn } from "@/lib/utils";
import { Video, VideoOff, AlertTriangle, Loader2 } from "lucide-react";

interface LiveFeedProps {
  frameSrc: string | null;
  connected?: boolean;
  weaponsDetected?: string[];
  className?: string;
}

export function LiveFeed({ frameSrc, connected = false, weaponsDetected = [], className }: LiveFeedProps) {
  return (
    <div className={cn("bg-card rounded-3xl p-4 shadow-card border border-border/50", className)}>
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            frameSrc ? "bg-danger animate-pulse" : connected ? "bg-warning" : "bg-muted-foreground"
          )} />
          <span className="text-sm font-semibold text-foreground">Live Feed</span>
        </div>
        
        {/* Connection status */}
        {!connected && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting...
          </span>
        )}
      </div>

      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
        {frameSrc ? (
          <>
            <img
              src={frameSrc}
              alt="Live camera feed"
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <VideoOff className="w-16 h-16 mb-4 opacity-40" />
            <p className="text-sm font-medium">
              {connected ? "Waiting for camera..." : "Camera not connected"}
            </p>
            <p className="text-xs mt-1 opacity-70">
              {connected ? "Start monitoring to see live feed" : "Connect to backend server"}
            </p>
          </div>
        )}

        {/* LIVE badge */}
        {frameSrc && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5">
              <Video className="w-3 h-3" />
              LIVE
            </span>
          </div>
        )}

        {/* Weapons detected badges */}
        {weaponsDetected.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end max-w-[60%]">
            {weaponsDetected.map((weapon, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full bg-danger/90 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5 animate-pulse"
              >
                <AlertTriangle className="w-3 h-3" />
                {weapon}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
