import { useState, useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  label: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  placeholder?: string;
}

export const FileDropZone = ({
  label,
  accept = ".mp4",
  value,
  onChange,
  placeholder = "Drop your MP4 file here or click to browse",
}: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".mp4")) {
        onChange(file);
      }
    },
    [onChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onChange(file);
      }
    },
    [onChange]
  );

  const clearFile = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/80 font-mono uppercase tracking-wider">
        {label}
      </label>
      <div
        className={cn(
          "file-input-zone relative rounded-lg p-6 transition-all duration-300 cursor-pointer group",
          isDragging && "active",
          value && "border-primary/50 bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {value.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(value.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="w-8 h-8 rounded-full bg-destructive/20 hover:bg-destructive/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/80">{placeholder}</p>
              <p className="text-xs text-muted-foreground mt-1">MP4 files only</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
