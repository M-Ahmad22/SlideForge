import { Sparkles, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

export type CreationMode = "ai" | "manual";

interface CreationModeSelectorProps {
  value: CreationMode | null;
  onChange: (mode: CreationMode) => void;
}

export const CreationModeSelector = ({ value, onChange }: CreationModeSelectorProps) => {
  const modes = [
    {
      id: "ai" as CreationMode,
      title: "Generate from AI",
      description: "Let AI create slides based on your topic and preferences",
      icon: Sparkles,
      features: ["Auto-generate content", "Smart layouts", "AI-powered images"],
    },
    {
      id: "manual" as CreationMode,
      title: "Enter my own content",
      description: "Write your slide content and let us structure it beautifully",
      icon: PenLine,
      features: ["Full content control", "Slide-by-slide editing", "Your words, our design"],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1">How do you want to create your presentation?</h2>
        <p className="text-sm text-muted-foreground">Choose your creation method to get started</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={cn(
                "relative p-6 rounded-xl border-2 text-left transition-all duration-200",
                "hover:border-primary/60 hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border bg-card"
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  "absolute top-4 right-4 h-5 w-5 rounded-full border-2 transition-all",
                  "flex items-center justify-center",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                )}
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-2 flex-1 pr-6">
                  <h3 className="font-semibold text-lg">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>

                  <ul className="space-y-1 pt-2">
                    {mode.features.map((feature, i) => (
                      <li
                        key={i}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
