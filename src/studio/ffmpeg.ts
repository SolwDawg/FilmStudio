import { execFile } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

let cachedGpuEncoder: string | null | undefined = undefined;

export async function detectGpuEncoder(): Promise<string | null> {
  if (cachedGpuEncoder !== undefined) return cachedGpuEncoder;
  try {
    const { stdout } = await run("ffmpeg", ["-encoders"]);
    if (stdout.includes("h264_nvenc")) {
      cachedGpuEncoder = "h264_nvenc";
    } else if (stdout.includes("h264_amf")) {
      cachedGpuEncoder = "h264_amf";
    } else if (stdout.includes("h264_qsv")) {
      cachedGpuEncoder = "h264_qsv";
    } else {
      cachedGpuEncoder = null;
    }
  } catch {
    cachedGpuEncoder = null;
  }
  return cachedGpuEncoder;
}

export async function ffmpeg(args: string[]): Promise<void> {
  try {
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { maxBuffer: 16 * 1024 * 1024 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`ffmpeg failed (is it installed and on PATH?): ${detail}`);
  }
}

// The last frame of a finished scene seeds the first frame of the next one.
export async function extractLastFrame(video: string, outPng: string): Promise<void> {
  await mkdir(dirname(outPng), { recursive: true });
  await ffmpeg(["-sseof", "-0.1", "-i", video, "-frames:v", "1", "-update", "1", "-q:v", "2", outPng]);
}

/**
 * Normalizes video stream parameters (30fps, timescale 30000, yuv420p, aac 44100Hz stereo)
 * as specified in Section 6.1 of the Cinematic Architecture specification.
 */
export async function normalizeVideo(input: string, output: string): Promise<void> {
  await mkdir(dirname(output), { recursive: true });
  const gpu = await detectGpuEncoder();
  const videoEncoder = gpu ?? "libx264";
  const preset = gpu ? "p4" : "ultrafast";

  await ffmpeg([
    "-i", input,
    "-r", "30",
    "-video_track_timescale", "30000",
    "-pix_fmt", "yuv420p",
    "-c:v", videoEncoder,
    "-preset", preset,
    "-crf", "18",
    "-c:a", "aac",
    "-ar", "44100",
    "-ac", "2",
    "-fflags", "+genpts",
    "-avoid_negative_ts", "make_zero",
    "-y", output
  ]);
}

function concatList(videos: string[]): string {
  return videos.map((video) => `file '${video.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n");
}

// Stream-copy first (instant, lossless); fall back to re-encoding if clips differ in codec or size.
export async function concatVideos(videos: string[], output: string): Promise<"copy" | "reencode"> {
  if (videos.length === 0) throw new Error("No videos to stitch");
  await mkdir(dirname(output), { recursive: true });
  const listFile = `${output}.concat.txt`;
  await writeFile(listFile, concatList(videos), "utf8");
  try {
    try {
      await ffmpeg(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", output]);
      return "copy";
    } catch {
      await ffmpeg([
        "-f", "concat", "-safe", "0", "-i", listFile,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", output
      ]);
      return "reencode";
    }
  } finally {
    await unlink(listFile).catch(() => undefined);
  }
}
