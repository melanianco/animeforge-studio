import { AlertTriangle, Terminal } from "lucide-react";

export const InfoCard = () => {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-accent" />
        </div>
        <h3 className="font-display font-semibold text-foreground">
          Requirements
        </h3>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        This application requires <span className="text-primary font-mono">ffmpeg</span>,{" "}
        <span className="text-primary font-mono">ffplay</span>, and{" "}
        <span className="text-primary font-mono">ffprobe</span> to be installed on your system.
      </p>

      <div className="bg-background/50 rounded-lg p-4 border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Installation
          </span>
        </div>
        <code className="text-xs text-primary font-mono">
          # Windows: Download from ffmpeg.org<br />
          # macOS: brew install ffmpeg<br />
          # Linux: sudo apt install ffmpeg
        </code>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs text-muted-foreground">
          Backend processing required for full functionality
        </span>
      </div>
    </div>
  );
};
