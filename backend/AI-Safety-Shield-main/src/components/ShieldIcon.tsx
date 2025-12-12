import { cn } from "@/lib/utils";

interface ShieldIconProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  status?: "safe" | "warning" | "danger" | "default";
}

export function ShieldIcon({ 
  className, 
  size = "lg", 
  animated = true,
  status = "default" 
}: ShieldIconProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const statusColors = {
    default: "from-primary to-primary-glow",
    safe: "from-safe to-safe-glow",
    warning: "from-warning to-warning-glow",
    danger: "from-danger to-danger-glow",
  };

  const glowColors = {
    default: "shadow-[0_0_60px_hsl(262_70%_65%/0.4)]",
    safe: "shadow-[0_0_60px_hsl(160_50%_55%/0.4)]",
    warning: "shadow-[0_0_60px_hsl(40_90%_60%/0.4)]",
    danger: "shadow-[0_0_60px_hsl(0_70%_60%/0.5)]",
  };

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        animated && status === "default" && "animate-gentle-pulse",
        animated && status === "safe" && "animate-gentle-pulse",
        animated && status === "warning" && "animate-wave",
        animated && status === "danger" && "animate-heartbeat",
        className
      )}
    >
      {/* Glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-3xl opacity-50",
          `bg-gradient-to-br ${statusColors[status]}`
        )}
      />
      
      {/* Main shield */}
      <svg
        viewBox="0 0 100 120"
        className={cn(
          sizeClasses[size],
          "relative z-10 drop-shadow-2xl",
          glowColors[status]
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`shieldGradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={
              status === "safe" ? "hsl(160, 50%, 55%)" :
              status === "warning" ? "hsl(40, 90%, 60%)" :
              status === "danger" ? "hsl(0, 70%, 60%)" :
              "hsl(262, 70%, 65%)"
            } />
            <stop offset="100%" stopColor={
              status === "safe" ? "hsl(170, 50%, 60%)" :
              status === "warning" ? "hsl(30, 90%, 65%)" :
              status === "danger" ? "hsl(350, 70%, 55%)" :
              "hsl(290, 60%, 70%)"
            } />
          </linearGradient>
          <linearGradient id="shieldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Shield body */}
        <path
          d="M50 5 L90 20 L90 55 C90 80 70 100 50 115 C30 100 10 80 10 55 L10 20 Z"
          fill={`url(#shieldGradient-${status})`}
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.3"
        />
        
        {/* Highlight overlay */}
        <path
          d="M50 8 L85 22 L85 55 C85 77 67 95 50 108 C33 95 15 77 15 55 L15 22 Z"
          fill="url(#shieldHighlight)"
        />
        
        {/* Heart/check icon in center */}
        {status === "safe" ? (
          <path
            d="M35 55 L45 65 L65 45"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : status === "danger" ? (
          <g>
            <circle cx="50" cy="50" r="4" fill="white" />
            <path d="M50 35 L50 48" stroke="white" strokeWidth="5" strokeLinecap="round" />
          </g>
        ) : (
          <path
            d="M50 40 C45 35, 35 35, 35 48 C35 58, 50 70, 50 70 C50 70, 65 58, 65 48 C65 35, 55 35, 50 40"
            fill="white"
            fillOpacity="0.9"
          />
        )}
      </svg>
    </div>
  );
}
