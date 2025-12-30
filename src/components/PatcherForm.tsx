import { useState, useEffect } from "react";
import { Wand2, RotateCcw, Download, Loader2 } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { FPSInput } from "./FPSInput";
import { ActionButton } from "./ActionButton";
import { toast } from "sonner";
import { useFFmpeg } from "@/hooks/useFFmpeg";

export const PatcherForm = () => {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputName, setOutputName] = useState("");
  const [desiredFPS, setDesiredFPS] = useState("");
  const [originalFPS, setOriginalFPS] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"apply" | "reverse" | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [detectingFPS, setDetectingFPS] = useState(false);

  const { load, loaded, loading, progress, getVideoFPS, patchVideo, reversePatch } = useFFmpeg();

  // Auto-load ffmpeg on mount
  useEffect(() => {
    load();
  }, [load]);

  // Detect FPS when file is selected
  useEffect(() => {
    const detectFPS = async () => {
      if (!inputFile || !loaded) return;
      
      setDetectingFPS(true);
      setOriginalFPS(null);
      
      try {
        const fps = await getVideoFPS(inputFile);
        if (fps) {
          setOriginalFPS(fps);
          toast.success(`Detected original FPS: ${fps}`);
        } else {
          toast.error("Could not detect FPS from video");
        }
      } catch (error) {
        console.error("FPS detection error:", error);
        toast.error("Error detecting video FPS");
      }
      
      setDetectingFPS(false);
    };

    detectFPS();
  }, [inputFile, loaded, getVideoFPS]);

  const handleFileChange = (file: File | null) => {
    setInputFile(file);
    setProcessedBlob(null);
    setOriginalFPS(null);
  };

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

    if (!loaded) {
      toast.error("FFmpeg is still loading, please wait...");
      return;
    }

    setIsProcessing(true);
    setMode("apply");
    setProcessedBlob(null);

    try {
      const outName = outputName || inputFile.name.replace(".mp4", "_patched.mp4");
      const blob = await patchVideo(inputFile, fps, outName);
      
      if (blob) {
        setProcessedBlob(blob);
        toast.success(
          <div className="space-y-1">
            <p className="font-medium">Patch Applied Successfully!</p>
            <p className="text-xs text-muted-foreground">
              FPS changed from {originalFPS || "unknown"} to {fps}
            </p>
          </div>
        );
      } else {
        toast.error("Failed to process video");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Error processing video");
    }

    setIsProcessing(false);
    setMode(null);
  };

  const handleReversePatch = async () => {
    if (!inputFile) {
      toast.error("Please select an input file");
      return;
    }

    if (!originalFPS) {
      toast.error("Could not detect original FPS to restore");
      return;
    }

    if (!loaded) {
      toast.error("FFmpeg is still loading, please wait...");
      return;
    }

    setIsProcessing(true);
    setMode("reverse");
    setProcessedBlob(null);

    try {
      const outName = outputName || inputFile.name.replace(".mp4", "_restored.mp4");
      const blob = await reversePatch(inputFile, originalFPS, outName);
      
      if (blob) {
        setProcessedBlob(blob);
        toast.success(
          <div className="space-y-1">
            <p className="font-medium">Reverse Patch Applied!</p>
            <p className="text-xs text-muted-foreground">
              FPS restored to {originalFPS}
            </p>
          </div>
        );
      } else {
        toast.error("Failed to process video");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Error processing video");
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
      {/* FFmpeg Loading Status */}
      {loading && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-foreground font-mono">
            Loading FFmpeg engine...
          </span>
        </div>
      )}

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
                Detecting original FPS...
              </span>
            </>
          ) : originalFPS ? (
            <>
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-foreground font-mono">
                Original FPS: <span className="text-accent font-bold">{originalFPS}</span>
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground font-mono">
                Could not detect FPS
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
          disabled={!inputFile || !desiredFPS || !loaded}
          loading={isProcessing && mode === "apply"}
          variant="primary"
          icon={Wand2}
          className="flex-1"
        >
          Apply Patch
        </ActionButton>

        <ActionButton
          onClick={handleReversePatch}
          disabled={!inputFile || !originalFPS || !loaded}
          loading={isProcessing && mode === "reverse"}
          variant="secondary"
          icon={RotateCcw}
          className="flex-1"
        >
          Reverse Patch
        </ActionButton>
      </div>

      {/* Processing indicator with progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-muted-foreground">
              {mode === "apply" ? "Applying patch..." : "Reversing patch..."}
            </span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
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
