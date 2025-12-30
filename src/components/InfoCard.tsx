import { Zap, Globe, Shield } from "lucide-react";

export const InfoCard = () => {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-accent" />
        </div>
        <h3 className="font-display font-semibold text-foreground">
          100% Browser-Based
        </h3>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        This tool works entirely in your browser. No uploads, no servers,{" "}
        <span className="text-primary font-medium">complete privacy</span>.
      </p>

      <div className="bg-background/50 rounded-lg p-4 border border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Features
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-foreground/70">Instant FPS detection</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-foreground/70">Binary atom patching</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-foreground/70">Lossless processing</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-foreground/70">No re-encoding</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Shield className="w-4 h-4 text-success" />
        <span className="text-xs text-muted-foreground">
          Your files never leave your device
        </span>
      </div>
    </div>
  );
};
