import { useState } from "react";
import { Wand2, RotateCcw, Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { FPSInput } from "./FPSInput";
import { ActionButton } from "./ActionButton";
import { toast } from "sonner";

export const PatcherForm = () => {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputName, setOutputName] = useState("");
  const [desiredFPS, setDesiredFPS] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"apply" | "reverse" | null>(null);

  const handleApplyPatch = async () => {
    if (!inputFile || !desiredFPS) {
      toast.error("Please select an input file and enter desired FPS");
      return;
    }

    const fps = parseFloat(desiredFPS);
    if (isNaN(fps) || fps <= 0) {
      toast.error("Please enter a valid FPS value");
      return;
    }

    setIsProcessing(true);
    setMode("apply");

    // Simulate processing (in a real app, this would call a backend API)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success(
      <div className="space-y-1">
        <p className="font-medium">Patch Applied Successfully!</p>
        <p className="text-xs text-muted-foreground">
          FPS adjusted to {fps} for {inputFile.name}
        </p>
      </div>
    );

    setIsProcessing(false);
    setMode(null);
  };

  const handleReversePatch = async () => {
    if (!inputFile) {
      toast.error("Please select an input file");
      return;
    }

    setIsProcessing(true);
    setMode("reverse");

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success(
      <div className="space-y-1">
        <p className="font-medium">Reverse Patch Applied!</p>
        <p className="text-xs text-muted-foreground">
          Original FPS restored for {inputFile.name}
        </p>
      </div>
    );

    setIsProcessing(false);
    setMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Input File */}
      <FileDropZone
        label="Input Video"
        value={inputFile}
        onChange={setInputFile}
        placeholder="Drop your MP4 file here or click to browse"
      />

      {/* Output Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80 font-mono uppercase tracking-wider">
          Output Filename
        </label>
        <div className="relative">
          <input
            type="text"
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
            placeholder={
              inputFile
                ? inputFile.name.replace(".mp4", "_patched.mp4")
                : "output_patched.mp4"
            }
            className="w-full h-14 px-4 pr-12 rounded-lg bg-input/50 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all duration-300 font-mono text-sm"
          />
          <Download className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* FPS Input */}
      <FPSInput
        value={desiredFPS}
        onChange={setDesiredFPS}
        label="Target FPS"
        placeholder="e.g., 24, 30, 60"
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <ActionButton
          onClick={handleApplyPatch}
          disabled={!inputFile || !desiredFPS}
          loading={isProcessing && mode === "apply"}
          variant="primary"
          icon={Wand2}
          className="flex-1"
        >
          Apply Patch
        </ActionButton>

        <ActionButton
          onClick={handleReversePatch}
          disabled={!inputFile}
          loading={isProcessing && mode === "reverse"}
          variant="secondary"
          icon={RotateCcw}
          className="flex-1"
        >
          Reverse Patch
        </ActionButton>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground font-mono">
            {mode === "apply" ? "Applying patch..." : "Reversing patch..."}
          </span>
        </div>
      )}
    </div>
  );
};
