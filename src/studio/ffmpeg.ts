import { execFile } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

export type H264Encoder = "libx264" | "h264_nvenc" | "h264_amf" | "h264_qsv";

const GPU_ENCODERS: H264Encoder[] = ["h264_nvenc", "h264_amf", "h264_qsv"];

// Quality-equivalent (~CRF 18-19) settings per encoder; each one names quality differently and
// rejects the others' options (e.g. `-preset p4` only exists on NVENC, QSV needs nv12 input).
export function encoderArgs(encoder: H264Encoder): string[] {
  switch (encoder) {
    case "h264_nvenc":
      return ["-c:v", "h264_nvenc", "-preset", "p4", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-pix_fmt", "yuv420p"];
    case "h264_amf":
      return ["-c:v", "h264_amf", "-quality", "balanced", "-rc", "cqp", "-qp_i", "19", "-qp_p", "19", "-qp_b", "19", "-pix_fmt", "yuv420p"];
    case "h264_qsv":
      return ["-c:v", "h264_qsv", "-preset", "veryfast", "-global_quality", "19", "-pix_fmt", "nv12"];
    default:
      return ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p"];
  }
}

let cachedGpuEncoder: Promise<H264Encoder | null> | undefined;

// `ffmpeg -encoders` lists what the build was compiled with, not what this machine's GPU can run
// (full Windows builds always list h264_nvenc), so each candidate is proven with a tiny test encode.
export function detectGpuEncoder(): Promise<H264Encoder | null> {
  cachedGpuEncoder ??= (async () => {
    for (const encoder of GPU_ENCODERS) {
      try {
        await run("ffmpeg", [
          "-hide_banner", "-loglevel", "error",
          "-f", "lavfi", "-i", "color=c=black:s=256x256:d=0.1",
          "-frames:v", "1", ...encoderArgs(encoder), "-f", "null", "-"
        ]);
        return encoder;
      } catch {
        // Not usable on this machine; try the next one.
      }
    }
    return null;
  })();
  return cachedGpuEncoder;
}

export async function probeImageSize(file: string): Promise<{ width: number; height: number }> {
  try {
    const { stdout } = await run("ffprobe", [
      "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", file
    ]);
    const [width, height] = stdout.trim().split("x").map((value) => Number.parseInt(value, 10));
    if (!width || !height) throw new Error(`unexpected ffprobe output "${stdout.trim()}"`);
    return { width, height };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`ffprobe could not read the image size of ${file} (is ffmpeg installed and on PATH?): ${detail}`);
  }
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
  const encode = (encoder: H264Encoder): Promise<void> =>
    ffmpeg([
      "-i", input,
      "-r", "30",
      "-video_track_timescale", "30000",
      ...encoderArgs(encoder),
      "-c:a", "aac",
      "-ar", "44100",
      "-ac", "2",
      "-fflags", "+genpts",
      "-avoid_negative_ts", "make_zero",
      "-y", output
    ]);

  const gpu = await detectGpuEncoder();
  if (!gpu) return encode("libx264");
  try {
    await encode(gpu);
  } catch {
    // A GPU encoder that passed the probe can still fail on a real clip (driver limits,
    // sessions in use); the CPU encoder always works.
    await encode("libx264");
  }
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
