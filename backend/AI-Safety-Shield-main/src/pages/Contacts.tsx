import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ShieldIcon } from "@/components/ShieldIcon";
import { ArrowRight, ArrowLeft, Phone, UserPlus, MapPin, Heart } from "lucide-react";
import { toast } from "sonner";

export default function Contacts() {
  const location = useLocation();
  const navigate = useNavigate();
  const previousData = location.state || {};

  const [contact, setContact] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [fixedLocation, setFixedLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    const payload = {
      ...previousData,
      emergency_contact: contact,
      alternate_contact: alternateContact,
      fixed_location: fixedLocation,
    };

    try {
      // Store data in localStorage
      localStorage.setItem("safetyShieldUser", JSON.stringify(payload));
      
      // Try to send config to backend
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await fetch(`${API_URL}/api/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emergency_number: contact,
            fixed_lat: fixedLocation ? parseFloat(fixedLocation.split(",")[0]) : null,
            fixed_lon: fixedLocation ? parseFloat(fixedLocation.split(",")[1]) : null,
          }),
        });
      } catch (apiErr) {
        console.log("Backend not available, config saved locally");
      }
      
      toast.success("Setup complete! 💌", {
        description: "Your emergency contacts have been saved.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative flex-1 container mx-auto px-6 py-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/info")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <ProgressIndicator currentStep={2} totalSteps={3} />
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="mb-8 opacity-0 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <ShieldIcon size="md" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            Emergency Contacts
          </h1>
          <p className="text-muted-foreground text-center mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            Who should we alert if you need help?
          </p>

          {/* Friendly note */}
          <div className="w-full mb-6 p-4 rounded-2xl bg-accent/30 border border-accent opacity-0 animate-fade-in-up" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-accent-foreground mt-0.5" />
              <p className="text-sm text-accent-foreground">
                Your emergency contacts will receive an instant alert with your location if danger is detected.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="w-full space-y-5">
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Primary WhatsApp Number
              </label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Include country code (e.g., +1 for US)</p>
            </div>

            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Alternate Contact
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                value={alternateContact}
                onChange={(e) => setAlternateContact(e.target.value)}
                placeholder="Backup phone number"
              />
            </div>

            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Fixed Location
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                value={fixedLocation}
                onChange={(e) => setFixedLocation(e.target.value)}
                placeholder="e.g., 40.7128,-74.0060"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Latitude, Longitude for static monitoring</p>
            </div>
          </div>

          {/* CTA */}
          <div className="w-full mt-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Complete Setup"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
