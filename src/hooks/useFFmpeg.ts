import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export const useFFmpeg = () => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const load = useCallback(async () => {
    if (loaded || loading) return;
    
    setLoading(true);
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    setLoaded(true);
    setLoading(false);
  }, [loaded, loading]);

  const getVideoFPS = useCallback(async (file: File): Promise<number | null> => {
    if (!ffmpegRef.current || !loaded) return null;
    
    const ffmpeg = ffmpegRef.current;
    const inputName = "input_probe.mp4";
    
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    
    // Run ffprobe-like command to get video info
    // We'll use ffmpeg with a very short duration to extract metadata
    let fpsInfo = "";
    
    ffmpeg.on("log", ({ message }) => {
      fpsInfo += message + "\n";
    });
    
    try {
      await ffmpeg.exec(["-i", inputName, "-f", "null", "-t", "0.001", "-"]);
    } catch {
      // ffmpeg returns error when no output, but we still get the info
    }
    
    // Parse FPS from ffmpeg output
    // Look for patterns like "25 fps", "29.97 fps", "23.98 fps"
    const fpsMatch = fpsInfo.match(/(\d+(?:\.\d+)?)\s*fps/);
    if (fpsMatch) {
      return parseFloat(fpsMatch[1]);
    }
    
    // Also try tbr pattern
    const tbrMatch = fpsInfo.match(/(\d+(?:\.\d+)?)\s*tbr/);
    if (tbrMatch) {
      return parseFloat(tbrMatch[1]);
    }
    
    return null;
  }, [loaded]);

  const patchVideo = useCallback(async (
    inputFile: File,
    targetFPS: number,
    outputName: string
  ): Promise<Blob | null> => {
    if (!ffmpegRef.current || !loaded) return null;
    
    const ffmpeg = ffmpegRef.current;
    const inputName = "input.mp4";
    const outputFileName = outputName.endsWith(".mp4") ? outputName : `${outputName}.mp4`;
    
    setProgress(0);
    
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
    
    // Apply FPS patch - this re-encodes with the new framerate
    await ffmpeg.exec([
      "-i", inputName,
      "-r", targetFPS.toString(),
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-c:a", "copy",
      outputFileName
    ]);
    
    const data = await ffmpeg.readFile(outputFileName);
    const uint8Array = new Uint8Array(data as Uint8Array);
    const blob = new Blob([uint8Array], { type: "video/mp4" });
    
    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputFileName);
    
    return blob;
  }, [loaded]);

  const reversePatch = useCallback(async (
    inputFile: File,
    originalFPS: number,
    outputName: string
  ): Promise<Blob | null> => {
    // Reverse patch is essentially the same as regular patch but restoring original FPS
    return patchVideo(inputFile, originalFPS, outputName);
  }, [patchVideo]);

  return {
    load,
    loaded,
    loading,
    progress,
    getVideoFPS,
    patchVideo,
    reversePatch
  };
};
