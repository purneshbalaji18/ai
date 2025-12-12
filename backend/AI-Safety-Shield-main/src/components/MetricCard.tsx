import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  maxValue?: number;
  color: "lavender" | "mint" | "coral" | "sky";
  className?: string;
}

export function MetricCard({ icon: Icon, label, value, maxValue = 100, color, className }: MetricCardProps) {
  const numValue = typeof value === "number" ? value : 0;
  const percentage = Math.min((numValue / maxValue) * 100, 100);
  
  const colorClasses = {
    lavender: {
      bg: "bg-primary/10",
      icon: "text-primary",
      progress: "bg-gradient-to-r from-primary to-primary-glow",
      border: "border-primary/20",
    },
    mint: {
      bg: "bg-safe/10",
      icon: "text-safe",
      progress: "bg-gradient-to-r from-safe to-safe-glow",
      border: "border-safe/20",
    },
    coral: {
      bg: "bg-danger/10",
      icon: "text-danger",
      progress: "bg-gradient-to-r from-danger to-danger-glow",
      border: "border-danger/20",
    },
    sky: {
      bg: "bg-[hsl(200,70%,55%)]/10",
      icon: "text-[hsl(200,70%,55%)]",
      progress: "bg-gradient-to-r from-[hsl(200,70%,55%)] to-[hsl(200,70%,70%)]",
      border: "border-[hsl(200,70%,55%)]/20",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card p-5 shadow-card border-2 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5",
        colors.border,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.bg)}>
          <Icon className={cn("w-6 h-6", colors.icon)} />
        </div>
        <span className="text-3xl font-bold text-foreground">{value}</span>
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mb-3">{label}</h3>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", colors.progress)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
