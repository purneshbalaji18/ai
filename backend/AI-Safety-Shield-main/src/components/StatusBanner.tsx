import { cn } from "@/lib/utils";
import { ShieldIcon } from "./ShieldIcon";
import { Smile, AlertTriangle, AlertCircle } from "lucide-react";

interface StatusBannerProps {
  score: number;
  className?: string;
}

export function StatusBanner({ score, className }: StatusBannerProps) {
  const status = score >= 60 ? "danger" : score >= 35 ? "warning" : "safe";
  
  const statusConfig = {
    safe: {
      message: "Everything looks safe 😊",
      subtext: "We're watching over you",
      icon: Smile,
      bgClass: "bg-gradient-safe glow-safe",
    },
    warning: {
      message: "Something seems unusual",
      subtext: "Stay aware of your surroundings",
      icon: AlertTriangle,
      bgClass: "bg-gradient-warning glow-warning",
    },
    danger: {
      message: "We detected potential danger",
      subtext: "Help is being alerted",
      icon: AlertCircle,
      bgClass: "bg-gradient-danger glow-danger",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 text-primary-foreground transition-all duration-500",
        config.bgClass,
        status === "danger" && "animate-heartbeat",
        status === "warning" && "animate-wave",
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative flex items-center gap-5">
        <ShieldIcon size="md" status={status} animated={false} />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
              {status === "safe" ? "All Clear" : status === "warning" ? "Caution" : "Alert"}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{config.message}</h2>
          <p className="text-sm opacity-80">{config.subtext}</p>
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold">{score}</div>
          <div className="text-xs uppercase tracking-wide opacity-70">Risk Score</div>
        </div>
      </div>
    </div>
  );
}
