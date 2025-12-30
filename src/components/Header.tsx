import { Film, Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="relative py-8 text-center">
      {/* Logo and title */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
            <Film className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center animate-float">
            <Sparkles className="w-3 h-3 text-accent-foreground" />
          </div>
        </div>
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground text-glow">
            MP4 Patcher
          </h1>
          <p className="text-sm text-muted-foreground font-mono tracking-wider">
            by Mel .co
          </p>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
        Professional FPS manipulation tool for{" "}
        <span className="text-primary font-medium">Manga</span> &{" "}
        <span className="text-accent font-medium">Anime</span> editors
      </p>

      {/* Decorative line */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
        <div className="w-2 h-2 rounded-full bg-primary glow-primary" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
      </div>
    </header>
  );
};
