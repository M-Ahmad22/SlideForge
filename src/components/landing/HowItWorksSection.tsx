import { FileText, Settings, Sparkles, Download } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Upload Your Content",
    description: "Drop your PDFs, DOCX files, paste notes, or add website URLs. Our AI extracts and organizes all the content.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Configure Settings",
    description: "Choose your audience, tone, theme, and animation style. Set the depth and number of slides you need.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Generate with AI",
    description: "Watch as AI creates structured slides with titles, bullet points, speaker notes, and infographics.",
  },
  {
    icon: Download,
    number: "04",
    title: "Edit & Export",
    description: "Fine-tune in our canvas editor, then download your professional PPTX file ready for presentation.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From raw content to polished presentation in four simple steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-primary via-accent to-primary/50 hidden md:block" />
            
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div 
                  key={step.number}
                  className="relative flex gap-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex-shrink-0 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-sm font-bold text-primary">{step.number}</span>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-lg">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
