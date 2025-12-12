import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface LogEntry {
  time: string;
  score: number;
  reason: string;
}

interface ActivityLogProps {
  entries: LogEntry[];
  className?: string;
}

export function ActivityLog({ entries, className }: ActivityLogProps) {
  const getStatusIcon = (score: number) => {
    if (score >= 60) return AlertCircle;
    if (score >= 35) return AlertTriangle;
    return CheckCircle;
  };

  const getStatusColor = (score: number) => {
    if (score >= 60) return "text-danger bg-danger/10";
    if (score >= 35) return "text-warning bg-warning/10";
    return "text-safe bg-safe/10";
  };

  return (
    <div className={cn("bg-card rounded-3xl p-6 shadow-card border border-border/50", className)}>
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Activity Log
      </h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Events will appear here</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const StatusIcon = getStatusIcon(entry.score);
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl bg-muted/50 transition-all duration-300",
                  "opacity-0 animate-fade-in-up"
                )}
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getStatusColor(entry.score))}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">{entry.time}</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-lg",
                      entry.score >= 60 ? "bg-danger/10 text-danger" :
                      entry.score >= 35 ? "bg-warning/10 text-warning" :
                      "bg-safe/10 text-safe"
                    )}>
                      Score: {entry.score}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{entry.reason}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
