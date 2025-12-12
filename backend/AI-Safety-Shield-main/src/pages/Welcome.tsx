import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldIcon } from "@/components/ShieldIcon";
import { FeatureCard } from "@/components/FeatureCard";
import { Crosshair, Volume2, HandMetal, Users, ArrowRight, Info } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-safe/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 pt-16 pb-12">
          {/* Logo & Shield */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="animate-float mb-8">
              <ShieldIcon size="xl" animated />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <span className="text-gradient">AI Safety Shield</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              Your safety matters. We're here to watch over you using trusted AI.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <FeatureCard
              icon={Crosshair}
              title="Weapon Detection"
              description="AI instantly recognizes potential threats in your surroundings"
              delay={500}
            />
            <FeatureCard
              icon={Volume2}
              title="Audio Analysis"
              description="Detects distress sounds and calls for help"
              delay={600}
            />
            <FeatureCard
              icon={HandMetal}
              title="Gesture Recognition"
              description="Recognizes distress poses like raised hands"
              delay={700}
            />
            <FeatureCard
              icon={Users}
              title="Proximity Alert"
              description="Warns when people crowd too closely"
              delay={800}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/info")}
              className="w-full sm:w-auto"
            >
              Save Me
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto"
            >
              <Info className="w-5 h-5" />
              How it works
            </Button>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="bg-muted/50 py-8 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
              <span className="text-sm font-medium">Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium">Privacy-First Design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <span className="text-sm font-medium">Instant Alerts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
