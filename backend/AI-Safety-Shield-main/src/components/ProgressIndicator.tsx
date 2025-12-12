import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({ currentStep, totalSteps, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500",
              i + 1 === currentStep
                ? "bg-gradient-hero text-primary-foreground scale-110 shadow-soft animate-soft-glow"
                : i + 1 < currentStep
                ? "bg-safe text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1 < currentStep ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={cn(
                "w-12 h-1 mx-2 rounded-full transition-all duration-500",
                i + 1 < currentStep ? "bg-safe" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
