import { Input } from "@/components/ui/input";

interface FPSInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const FPSInput = ({
  value,
  onChange,
  label = "Desired FPS",
  placeholder = "Enter target FPS",
}: FPSInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/80 font-mono uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            // Allow numbers and decimal points only
            const val = e.target.value.replace(/[^0-9.]/g, "");
            onChange(val);
          }}
          placeholder={placeholder}
          className="font-mono text-lg h-14 bg-input/50 border-border/50 focus:border-primary focus:ring-primary/20 pl-4 pr-16 transition-all duration-300"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
          FPS
        </span>
      </div>
    </div>
  );
};
