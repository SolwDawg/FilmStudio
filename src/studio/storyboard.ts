import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ffmpeg } from "./ffmpeg.js";

export interface GridDimensions {
  rows: number;
  cols: number;
}

export interface GridSlice {
  index: number;
  row: number;
  col: number;
  cropFilter: string; // e.g. "crop=w:h:x:y"
  outputPath: string;
}

/**
 * Calculates FFmpeg crop filters for slicing a grid image (e.g. 2x2 or 3x3 storyboard).
 * Total width and height must match the source image.
 */
export function calculateGridSlices(
  totalWidth: number,
  totalHeight: number,
  grid: GridDimensions,
  outputDir: string,
  prefix = "shot"
): GridSlice[] {
  const sliceW = Math.floor(totalWidth / grid.cols);
  const sliceH = Math.floor(totalHeight / grid.rows);
  const slices: GridSlice[] = [];

  let index = 1;
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const x = c * sliceW;
      const y = r * sliceH;
      const cropFilter = `crop=${sliceW}:${sliceH}:${x}:${y}`;
      const outputPath = join(outputDir, `${prefix}_${String(index).padStart(2, "0")}.png`);
      slices.push({
        index,
        row: r,
        col: c,
        cropFilter,
        outputPath
      });
      index++;
    }
  }

  return slices;
}

/**
 * Executes multi-crop slicing on a storyboard grid image using native FFmpeg.
 */
export async function cropStoryboardGrid(
  inputImagePath: string,
  totalWidth: number,
  totalHeight: number,
  grid: GridDimensions,
  outputDir: string,
  prefix = "shot"
): Promise<string[]> {
  await mkdir(outputDir, { recursive: true });
  const slices = calculateGridSlices(totalWidth, totalHeight, grid, outputDir, prefix);
  const outputFiles: string[] = [];

  for (const slice of slices) {
    await ffmpeg(["-i", inputImagePath, "-vf", slice.cropFilter, "-y", slice.outputPath]);
    outputFiles.push(slice.outputPath);
  }

  return outputFiles;
}
