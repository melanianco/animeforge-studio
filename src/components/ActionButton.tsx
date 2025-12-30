import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "accent";
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const ActionButton = ({
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  icon: Icon,
  children,
  className,
}: ActionButtonProps) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] active:scale-[0.98]",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50",
    accent:
      "bg-gradient-to-r from-accent to-primary text-accent-foreground hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] active:scale-[0.98]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative px-8 py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3",
        variants[variant],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        !disabled && !loading && "hover:scale-[1.02]",
        className
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon className="w-5 h-5" />
      )}
      <span>{children}</span>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>
    </button>
  );
};
