import { cn } from "@/lib/utils";
import { Shield, ShieldOff } from "lucide-react";

interface ArmToggleProps {
  armed: boolean;
  onToggle: (armed: boolean) => void;
  className?: string;
}

export function ArmToggle({ armed, onToggle, className }: ArmToggleProps) {
  return (
    <button
      onClick={() => onToggle(!armed)}
      className={cn(
        "relative w-full p-6 rounded-3xl transition-all duration-500 overflow-hidden group",
        armed
          ? "bg-gradient-safe glow-safe"
          : "bg-card border-2 border-dashed border-muted-foreground/30 hover:border-primary/50",
        className
      )}
    >
      {/* Background animation for armed state */}
      {armed && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white animate-gentle-pulse" style={{ transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white animate-gentle-pulse" style={{ transform: 'translate(-30%, 30%)', animationDelay: '0.5s' }} />
        </div>
      )}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            armed ? "bg-white/20" : "bg-muted"
          )}>
            {armed ? (
              <Shield className="w-8 h-8 text-primary-foreground" />
            ) : (
              <ShieldOff className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="text-left">
            <h3 className={cn(
              "text-xl font-bold",
              armed ? "text-primary-foreground" : "text-foreground"
            )}>
              {armed ? "Protection Active" : "Protection Off"}
            </h3>
            <p className={cn(
              "text-sm",
              armed ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {armed ? "We're watching over you ✓" : "Tap to enable monitoring"}
            </p>
          </div>
        </div>

        {/* Toggle indicator */}
        <div className={cn(
          "w-20 h-10 rounded-full p-1 transition-all duration-300",
          armed ? "bg-white/30" : "bg-muted"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full transition-all duration-300 shadow-lg",
            armed ? "translate-x-10 bg-white" : "translate-x-0 bg-muted-foreground/30"
          )} />
        </div>
      </div>
    </button>
  );
}
