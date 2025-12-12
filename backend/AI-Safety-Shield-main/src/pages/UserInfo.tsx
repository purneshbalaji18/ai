import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ShieldIcon } from "@/components/ShieldIcon";
import { ArrowRight, ArrowLeft, User, Calendar, MapPin } from "lucide-react";

export default function UserInfo() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(25);
  const [locationNote, setLocationNote] = useState("");

  const handleSubmit = () => {
    const payload = { name, age, location_note: locationNote };
    navigate("/contacts", { state: payload });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 left-0 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative flex-1 container mx-auto px-6 py-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <ProgressIndicator currentStep={1} totalSteps={3} />
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="mb-8 opacity-0 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <ShieldIcon size="md" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            Tell us about you
          </h1>
          <p className="text-muted-foreground text-center mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            This helps us personalize your safety experience
          </p>

          {/* Form */}
          <div className="w-full space-y-5">
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
              />
            </div>

            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Age
              </label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                placeholder="Your age"
              />
            </div>

            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location Description
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="e.g., Usually in downtown area"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="w-full mt-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
