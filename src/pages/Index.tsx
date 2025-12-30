import { Header } from "@/components/Header";
import { PatcherForm } from "@/components/PatcherForm";
import { InfoCard } from "@/components/InfoCard";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Header />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form card */}
          <div className="lg:col-span-2">
            <div className="gradient-border p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-primary to-accent rounded-full" />
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Video Configuration
                </h2>
              </div>
              <PatcherForm />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoCard />

            {/* Quick tips */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Quick Tips
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Common anime FPS: 24, 23.976</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Manga motion: 12-15 FPS for effect</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">→</span>
                  <span>Use reverse patch to restore original</span>
                </li>
              </ul>
            </div>

            {/* Credits */}
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground font-mono">
                Built for creators who push boundaries
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <div className="w-1 h-1 rounded-full bg-accent" />
                <div className="w-1 h-1 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
