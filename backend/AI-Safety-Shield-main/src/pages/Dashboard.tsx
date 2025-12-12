import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBanner } from "@/components/StatusBanner";
import { MetricCard } from "@/components/MetricCard";
import { ActivityLog } from "@/components/ActivityLog";
import { LiveFeed } from "@/components/LiveFeed";
import { ArmToggle } from "@/components/ArmToggle";
import { ShieldIcon } from "@/components/ShieldIcon";
import { Crosshair, Volume2, HandMetal, Users, Bell, Settings, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import useSurveillance from "../hooks/useSurveillance";

function DashboardPage() {
  const { frame, metrics, activityLog, armed, setArmed, saveConfig, sendTestAlert } = useSurveillance("http://localhost:5000");
  // render UI using frame (img src), metrics, activityLog
  }
export default function Dashboard() {
  const navigate = useNavigate();
  
  // Use the real-time surveillance hook
  const {
    connected,
    error,
    armed,
    status,
    metrics,
    activityLog,
    currentFrame,
    weaponsDetected,
    setArmed,
    sendTestAlert,
    setConfig,
  } = useSurveillance();

  // Load saved config on mount
  const loadSavedConfig = async () => {
    try {
      const savedData = localStorage.getItem("safetyShieldUser");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        await setConfig({
          emergency_number: parsed.emergency_contact,
          fixed_lat: parsed.fixed_location ? parseFloat(parsed.fixed_location.split(",")[0]) : undefined,
          fixed_lon: parsed.fixed_location ? parseFloat(parsed.fixed_location.split(",")[1]) : undefined,
        });
      }
    } catch (err) {
      console.error("Failed to load saved config:", err);
    }
  };

  // Load config on mount
  if (typeof window !== "undefined") {
    loadSavedConfig();
  }

  const totalScore = metrics.total || 0;

  const handleTestAlert = async () => {
    try {
      const result = await sendTestAlert();
      if (result.success) {
        toast.success("Test alert sent 💌", {
          description: "Your emergency contacts would receive a message now.",
        });
      } else {
        toast.error("Alert failed", {
          description: result.message || "Could not send test alert.",
        });
      }
    } catch (err: any) {
      toast.error("Alert failed", {
        description: err.message || "No emergency number configured.",
      });
    }
  };

  const handleArmToggle = async (newArmed: boolean) => {
    try {
      await setArmed(newArmed);
      if (newArmed) {
        toast.success("Protection activated ✓", {
          description: "We're now watching over you.",
        });
      } else {
        toast.info("Protection paused", {
          description: "Monitoring has been disabled.",
        });
      }
    } catch (err) {
      toast.error("Failed to update", {
        description: "Could not change protection status.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-safe/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <ShieldIcon size="sm" status={totalScore >= 60 ? "danger" : totalScore >= 35 ? "warning" : "safe"} />
              <div>
                <h1 className="text-lg font-bold text-foreground">AI Safety Shield</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {connected ? (
                    <>
                      <Wifi className="w-3 h-3 text-safe" />
                      <span>{armed ? "Protection active" : "Protection paused"}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-warning" />
                      <span>Connecting to backend...</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Connection indicator */}
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-safe' : 'bg-warning animate-pulse'}`} />
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-warning/10 border-b border-warning/20 px-6 py-3">
          <p className="text-sm text-warning text-center">
            ⚠️ {error} - Using demo mode
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="relative container mx-auto px-6 py-6 space-y-6">
        {/* Status Banner */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <StatusBanner score={totalScore} />
        </div>

        {/* Arm Toggle */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <ArmToggle armed={armed} onToggle={handleArmToggle} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <MetricCard
              icon={Crosshair}
              label="Weapon Detection"
              value={metrics.weapon ?? 0}
              color="coral"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
            <MetricCard
              icon={Volume2}
              label="Audio Distress"
              value={metrics.audio ?? 0}
              color="lavender"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <MetricCard
              icon={HandMetal}
              label="Pose Analysis"
              value={metrics.pose ?? 0}
              color="mint"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
            <MetricCard
              icon={Users}
              label="Proximity Score"
              value={metrics.proximity ?? 0}
              color="sky"
            />
          </div>
        </div>

        {/* Live Feed & Activity Log */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <LiveFeed 
              frameSrc={currentFrame} 
              connected={connected}
              weaponsDetected={weaponsDetected}
            />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}>
            <ActivityLog entries={activityLog} />
          </div>
        </div>

        {/* Test Alert Button */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleTestAlert}
          >
            <Bell className="w-5 h-5 mr-2" />
            Send Test Alert
          </Button>
        </div>
      </main>
    </div>
  );
}
