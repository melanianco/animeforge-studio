/**
 * MP4 Binary Patcher
 * Directly patches mvhd and mdhd atoms in MP4 files to change FPS
 * This is a lossless operation - no re-encoding required
 */

interface PatchResult {
  patchedCount: number;
  logs: string[];
}

/**
 * Read a 32-bit big-endian unsigned integer from a Uint8Array
 */
function readUint32BE(data: Uint8Array, offset: number): number {
  return (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
}

/**
 * Write a 32-bit big-endian unsigned integer to a Uint8Array
 */
function writeUint32BE(data: Uint8Array, offset: number, value: number): void {
  data[offset] = (value >>> 24) & 0xff;
  data[offset + 1] = (value >>> 16) & 0xff;
  data[offset + 2] = (value >>> 8) & 0xff;
  data[offset + 3] = value & 0xff;
}

/**
 * Read a 64-bit big-endian unsigned integer from a Uint8Array
 */
function readUint64BE(data: Uint8Array, offset: number): bigint {
  const high = BigInt(readUint32BE(data, offset));
  const low = BigInt(readUint32BE(data, offset + 4));
  return (high << 32n) | low;
}

/**
 * Write a 64-bit big-endian unsigned integer to a Uint8Array
 */
function writeUint64BE(data: Uint8Array, offset: number, value: bigint): void {
  writeUint32BE(data, offset, Number(value >> 32n));
  writeUint32BE(data, offset + 4, Number(value & 0xffffffffn));
}

/**
 * Find all occurrences of a pattern in a Uint8Array
 */
function findPattern(data: Uint8Array, pattern: Uint8Array, startIndex: number = 0): number {
  for (let i = startIndex; i <= data.length - pattern.length; i++) {
    let found = true;
    for (let j = 0; j < pattern.length; j++) {
      if (data[i + j] !== pattern[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}

/**
 * Patch a single atom type (mvhd or mdhd) in the MP4 data
 */
function patchAtom(atomName: string, data: Uint8Array, scaleFactor: number): PatchResult {
  const logs: string[] = [];
  let count = 0;
  let start = 0;
  const atomBytes = new TextEncoder().encode(atomName);

  while (true) {
    const found = findPattern(data, atomBytes, start);
    if (found === -1) break;

    const headerOffset = found - 4;
    if (headerOffset < 0) {
      start = found + 4;
      continue;
    }

    const boxSize = readUint32BE(data, headerOffset);
    if (boxSize < 8 || headerOffset + boxSize > data.length) {
      start = found + 4;
      continue;
    }

    const version = data[headerOffset + 8];

    if (version === 0) {
      // Version 0: 32-bit timescale and duration
      const timescaleOffset = headerOffset + 20;
      const durationOffset = headerOffset + 24;

      if (durationOffset + 4 > headerOffset + boxSize) {
        start = found + 4;
        continue;
      }

      const oldTimescale = readUint32BE(data, timescaleOffset);
      const oldDuration = readUint32BE(data, durationOffset);

      const newTimescale = Math.round(oldTimescale * scaleFactor);
      const newDuration = Math.round(oldDuration * scaleFactor);

      writeUint32BE(data, timescaleOffset, newTimescale);
      writeUint32BE(data, durationOffset, newDuration);

      logs.push(`Patched ${atomName} (v0) @ ${headerOffset}: timescale ${oldTimescale}→${newTimescale}, duration ${oldDuration}→${newDuration}`);
      count++;

    } else if (version === 1) {
      // Version 1: 32-bit timescale, 64-bit duration
      const timescaleOffset = headerOffset + 28;
      const durationOffset = headerOffset + 32;

      if (durationOffset + 8 > headerOffset + boxSize) {
        start = found + 4;
        continue;
      }

      const oldTimescale = readUint32BE(data, timescaleOffset);
      const oldDuration = readUint64BE(data, durationOffset);

      const newTimescale = Math.round(oldTimescale * scaleFactor);
      const newDuration = BigInt(Math.round(Number(oldDuration) * scaleFactor));

      writeUint32BE(data, timescaleOffset, newTimescale);
      writeUint64BE(data, durationOffset, newDuration);

      logs.push(`Patched ${atomName} (v1) @ ${headerOffset}: timescale ${oldTimescale}→${newTimescale}, duration ${oldDuration}→${newDuration}`);
      count++;

    } else {
      logs.push(`Found ${atomName} @ ${headerOffset} with unknown version ${version}; skipping.`);
    }

    start = found + 4;
  }

  return { patchedCount: count, logs };
}

/**
 * Detect the original FPS from an MP4 file by parsing its atoms
 */
export function detectFPS(data: Uint8Array): number | null {
  // Look for mvhd atom to get movie timescale and duration
  const mvhdBytes = new TextEncoder().encode('mvhd');
  const mvhdIndex = findPattern(data, mvhdBytes, 0);
  
  if (mvhdIndex === -1) return null;
  
  const headerOffset = mvhdIndex - 4;
  if (headerOffset < 0) return null;
  
  const version = data[headerOffset + 8];
  
  let timescale: number;
  let duration: number;
  
  if (version === 0) {
    timescale = readUint32BE(data, headerOffset + 20);
    duration = readUint32BE(data, headerOffset + 24);
  } else if (version === 1) {
    timescale = readUint32BE(data, headerOffset + 28);
    duration = Number(readUint64BE(data, headerOffset + 32));
  } else {
    return null;
  }
  
  // Now find mdhd atom for video track to get actual frame timing
  // Look for video track (usually first mdhd in video trak)
  const mdhdBytes = new TextEncoder().encode('mdhd');
  let mdhdIndex = findPattern(data, mdhdBytes, 0);
  
  if (mdhdIndex === -1) return null;
  
  const mdhdHeaderOffset = mdhdIndex - 4;
  if (mdhdHeaderOffset < 0) return null;
  
  const mdhdVersion = data[mdhdHeaderOffset + 8];
  
  let mdhdTimescale: number;
  let mdhdDuration: number;
  
  if (mdhdVersion === 0) {
    mdhdTimescale = readUint32BE(data, mdhdHeaderOffset + 20);
    mdhdDuration = readUint32BE(data, mdhdHeaderOffset + 24);
  } else if (mdhdVersion === 1) {
    mdhdTimescale = readUint32BE(data, mdhdHeaderOffset + 28);
    mdhdDuration = Number(readUint64BE(data, mdhdHeaderOffset + 32));
  } else {
    return null;
  }
  
  // Look for stts atom to get sample count for accurate FPS
  const sttsBytes = new TextEncoder().encode('stts');
  const sttsIndex = findPattern(data, sttsBytes, 0);
  
  if (sttsIndex !== -1) {
    const sttsHeaderOffset = sttsIndex - 4;
    if (sttsHeaderOffset >= 0) {
      // stts structure: 4 bytes size, 4 bytes 'stts', 1 byte version, 3 bytes flags, 4 bytes entry count
      const entryCount = readUint32BE(data, sttsHeaderOffset + 12);
      if (entryCount > 0) {
        // First entry: 4 bytes sample count, 4 bytes sample delta
        const sampleCount = readUint32BE(data, sttsHeaderOffset + 16);
        const sampleDelta = readUint32BE(data, sttsHeaderOffset + 20);
        if (sampleDelta > 0) {
          const fps = mdhdTimescale / sampleDelta;
          return Math.round(fps * 100) / 100;
        }
      }
    }
  }
  
  // Fallback: estimate FPS from timescale (common values)
  // Common timescales: 600 = 24fps, 30000 = 30fps (with 1001 divisor for NTSC)
  if (mdhdTimescale === 600) return 24;
  if (mdhdTimescale === 1000) return 25;
  if (mdhdTimescale === 30000) return 29.97;
  if (mdhdTimescale === 24000) return 23.976;
  if (mdhdTimescale === 25000) return 25;
  if (mdhdTimescale === 60000) return 59.94;
  
  // Last resort: calculate from duration
  const durationInSeconds = mdhdDuration / mdhdTimescale;
  const movieDurationInSeconds = duration / timescale;
  
  // If we can't determine, return a reasonable estimate
  if (durationInSeconds > 0) {
    // Assume common fps values based on timescale patterns
    const possibleFPS = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
    for (const fps of possibleFPS) {
      const expectedTimescale = Math.round(fps * 1000);
      if (Math.abs(mdhdTimescale - expectedTimescale) < 100) {
        return fps;
      }
    }
  }
  
  return null;
}

/**
 * Patch an MP4 file to change its FPS
 * @param data - The MP4 file data as Uint8Array
 * @param originalFPS - The original FPS of the video
 * @param targetFPS - The desired target FPS
 * @returns The patched data and logs
 */
export function patchMP4(
  data: Uint8Array,
  originalFPS: number,
  targetFPS: number
): { patchedData: Uint8Array; logs: string[]; success: boolean } {
  // Create a copy to avoid modifying the original
  const patchedData = new Uint8Array(data);
  const allLogs: string[] = [];
  
  // Calculate scale factor: original / target
  // If original is 30fps and target is 60fps, scale = 0.5 (slow down playback = higher fps)
  // If original is 60fps and target is 30fps, scale = 2 (speed up playback = lower fps)
  const scaleFactor = originalFPS / targetFPS;
  
  allLogs.push(`Scale factor: ${originalFPS} / ${targetFPS} = ${scaleFactor.toFixed(4)}`);
  
  // Patch mvhd (movie header) atom
  const mvhdResult = patchAtom('mvhd', patchedData, scaleFactor);
  allLogs.push(...mvhdResult.logs);
  
  // Patch mdhd (media header) atoms
  const mdhdResult = patchAtom('mdhd', patchedData, scaleFactor);
  allLogs.push(...mdhdResult.logs);
  
  const totalPatched = mvhdResult.patchedCount + mdhdResult.patchedCount;
  
  if (totalPatched === 0) {
    allLogs.push('ERROR: No mvhd/mdhd atoms found. This may not be a valid MP4 file.');
    return { patchedData, logs: allLogs, success: false };
  }
  
  allLogs.push(`Successfully patched ${totalPatched} atom(s)`);
  
  return { patchedData, logs: allLogs, success: true };
}

/**
 * Reverse patch - restore original FPS
 */
export function reversePatchMP4(
  data: Uint8Array,
  currentFPS: number,
  desiredFPS: number
): { patchedData: Uint8Array; logs: string[]; success: boolean } {
  // Reverse is just patching with inverted scale
  return patchMP4(data, currentFPS, desiredFPS);
}
