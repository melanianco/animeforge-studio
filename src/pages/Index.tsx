import { Header } from "@/components/Header";
import { PatcherForm } from "@/components/PatcherForm";
import { InfoCard } from "@/components/InfoCard";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { Download } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <Header />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form card */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="gradient-border p-6 md:p-8 rounded-2xl transition-all duration-500 hover:shadow-[0_0_40px_hsl(270_80%_60%/0.3)]">
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
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <InfoCard />

            {/* Credits */}
            <div className="text-center py-4 transition-all duration-300">
              <p className="text-xs text-muted-foreground font-mono">
                Built for creators who push boundaries
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        </main>

        {/* Desktop App Download Link */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <a 
            href="https://www.mediafire.com/file/u0zmfs68kftwc8f/Mel_.co_Patcher.zip/file"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:border-primary/50 transition-all duration-300 group"
          >
            <Download className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-mono">Download the desktop app for better performance</span>
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
