import { useState, useCallback } from "react";
import { Wand2, RotateCcw, Download, Loader2, FileVideo } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { ActionButton } from "./ActionButton";
import { toast } from "sonner";
import { detectFPS, patchMP4, reversePatchMP4 } from "@/lib/mp4-patcher";

export const PatcherForm = () => {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<Uint8Array | null>(null);
  const [outputName, setOutputName] = useState("");
  const [originalFPS, setOriginalFPS] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"apply" | "reverse" | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [detectingFPS, setDetectingFPS] = useState(false);
  const [patchLogs, setPatchLogs] = useState<string[]>([]);

  // Read file and detect FPS when file is selected
  const handleFileChange = useCallback(async (file: File | null) => {
    setInputFile(file);
    setProcessedBlob(null);
    setOriginalFPS(null);
    setInputData(null);
    setPatchLogs([]);

    if (!file) return;

    setDetectingFPS(true);

    try {
      // Read file into ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      setInputData(data);

      // Detect FPS from the binary data
      const fps = detectFPS(data);
      if (fps) {
        setOriginalFPS(fps);
        toast.success(`Detected original FPS: ${fps}`);
      } else {
        toast.error("Could not detect FPS from video. Please check if it's a valid MP4.");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error reading video file");
    }

    setDetectingFPS(false);
  }, []);

  const handleApplyPatch = async () => {
    if (!inputFile || !inputData) {
      toast.error("Please select an input file");
      return;
    }

    if (!originalFPS) {
      toast.error("Could not detect original FPS. Cannot apply patch.");
      return;
    }

    // Auto-calculate target FPS as 2x the original with hidden randomness
    const randomVariation = (Math.random() - 0.5) * 12; // Random between -6 and +6
    const targetFPS = (originalFPS * 2) + randomVariation;

    setIsProcessing(true);
    setMode("apply");
    setProcessedBlob(null);
    setPatchLogs([]);

    try {
      // Run patching in a setTimeout to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));

      const { patchedData, logs, success } = patchMP4(inputData, originalFPS, targetFPS);
      
      setPatchLogs(logs);

      if (success) {
        const blob = new Blob([new Uint8Array(patchedData)], { type: "video/mp4" });
        setProcessedBlob(blob);
        toast.success(
          <div className="space-y-1">
            <p className="font-medium">Patch Applied Successfully!</p>
            <p className="text-xs text-muted-foreground">
              FPS changed from {originalFPS} to {originalFPS * 2}
            </p>
          </div>
        );
      } else {
        toast.error("Failed to patch video. Check logs for details.");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Error processing video");
      setPatchLogs(prev => [...prev, `Error: ${error}`]);
    }

    setIsProcessing(false);
    setMode(null);
  };

  const handleReversePatch = async () => {
    if (!inputFile || !inputData) {
      toast.error("Please select an input file");
      return;
    }

    if (!originalFPS) {
      toast.error("Could not detect current FPS");
      return;
    }

    // Auto-calculate target FPS as detected FPS / 2
    const targetFPS = originalFPS / 2;

    setIsProcessing(true);
    setMode("reverse");
    setProcessedBlob(null);
    setPatchLogs([]);

    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      const { patchedData, logs, success } = reversePatchMP4(inputData, originalFPS, targetFPS);
      
      setPatchLogs(logs);

      if (success) {
        const blob = new Blob([new Uint8Array(patchedData)], { type: "video/mp4" });
        setProcessedBlob(blob);
        toast.success(
          <div className="space-y-1">
            <p className="font-medium">Reverse Patch Applied!</p>
            <p className="text-xs text-muted-foreground">
              FPS restored from {originalFPS} to {targetFPS}
            </p>
          </div>
        );
      } else {
        toast.error("Failed to reverse patch. Check logs for details.");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Error processing video");
      setPatchLogs(prev => [...prev, `Error: ${error}`]);
    }

    setIsProcessing(false);
    setMode(null);
  };

  const handleDownload = () => {
    if (!processedBlob) return;

    const outName = outputName || (inputFile?.name.replace(".mp4", "_patched.mp4") ?? "output.mp4");
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outName.endsWith(".mp4") ? outName : `${outName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Download started!");
  };

  return (
    <div className="space-y-6">
      {/* Input File */}
      <FileDropZone
        label="Input Video"
        value={inputFile}
        onChange={handleFileChange}
        placeholder="Drop your MP4 file here or click to browse"
      />

      {/* Original FPS Display */}
      {inputFile && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
          {detectingFPS ? (
            <>
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span className="text-sm text-muted-foreground font-mono">
                Analyzing video structure...
              </span>
            </>
          ) : originalFPS ? (
            <>
              <FileVideo className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground font-mono">
                Detected FPS: <span className="text-accent font-bold">{originalFPS}</span>
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground font-mono">
                Could not detect FPS - file may not be a valid MP4
              </span>
            </>
          )}
        </div>
      )}

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

      {/* Target FPS Display - Auto-calculated as 2x original */}
      {originalFPS && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <Wand2 className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-mono">
            Target FPS: <span className="text-primary font-bold">{originalFPS * 2}</span>
            <span className="text-muted-foreground ml-2">(2× original)</span>
          </span>
        </div>
      )}

      {/* Reverse FPS Display - Auto-calculated as detected / 2 */}
      {originalFPS && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/20 border border-secondary/30">
          <RotateCcw className="w-4 h-4 text-secondary-foreground" />
          <span className="text-sm text-foreground font-mono">
            Reverse Target: <span className="text-secondary-foreground font-bold">{originalFPS / 2}</span>
            <span className="text-muted-foreground ml-2">(÷2 original)</span>
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <ActionButton
          onClick={handleApplyPatch}
          disabled={!inputFile || !originalFPS}
          loading={isProcessing && mode === "apply"}
          variant="primary"
          icon={Wand2}
          className="flex-1"
        >
          Apply Patch
        </ActionButton>

        <ActionButton
          onClick={handleReversePatch}
          disabled={!inputFile || !originalFPS}
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
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground font-mono">
            {mode === "apply" ? "Patching atoms..." : "Reversing patch..."}
          </span>
        </div>
      )}

      {/* Patch Logs */}
      {patchLogs.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 max-h-40 overflow-y-auto">
          <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
            Patch Log
          </h4>
          <div className="space-y-1">
            {patchLogs.map((log, i) => (
              <p key={i} className="text-xs font-mono text-foreground/70">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Download Button - Shows after successful processing */}
      {processedBlob && !isProcessing && (
        <div className="pt-4 border-t border-border/30">
          <ActionButton
            onClick={handleDownload}
            variant="accent"
            icon={Download}
            className="w-full"
          >
            Download Patched Video
          </ActionButton>
          <p className="text-xs text-center text-muted-foreground mt-2 font-mono">
            Size: {(processedBlob.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
};
