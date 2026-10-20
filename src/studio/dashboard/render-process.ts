import { type ChildProcess, spawn } from "node:child_process";

// Renders run as a child `film render` process (one per project), so a crash or a stuck browser
// never takes the dashboard down. Their output is forwarded to the dashboard log.
export class RenderProcesses {
  private readonly running = new Map<string, ChildProcess>();

  constructor(private readonly log: (line: string) => void) {}

  has(slug: string): boolean {
    return this.running.has(slug);
  }

  start(slug: string, force: boolean): void {
    const args = [...process.execArgv, process.argv[1], "render", slug, ...(force ? ["--force"] : [])];
    // The IPC channel lets "stop" end the render gracefully (scene back to pending, browser
    // disconnected) instead of killing it mid-write.
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe", "ipc"],
      env: { ...process.env, FILM_RENDER_IPC: "1" }
    });
    this.running.set(slug, child);
    this.log(`${slug}: render pipeline started`);
    const forward = (chunk: Buffer): void => {
      for (const line of chunk.toString().split(/\r?\n/).filter(Boolean)) this.log(`${slug}: ${line}`);
    };
    child.stdout?.on("data", forward);
    child.stderr?.on("data", forward);
    child.on("close", (code) => {
      if (this.running.get(slug) === child) this.running.delete(slug);
      this.log(`${slug}: render pipeline exited with code ${code}`);
    });
  }

  // Asks the render to stop; returns false when none is running for this project.
  stop(slug: string): boolean {
    const child = this.running.get(slug);
    if (!child) return false;
    this.running.delete(slug);
    if (child.connected) child.send("stop");
    // Give it a moment to put the scene back to pending, then make sure it is gone.
    const timer = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill();
    }, 10_000);
    timer.unref();
    child.once("close", () => clearTimeout(timer));
    return true;
  }

  kill(slug: string): void {
    this.running.get(slug)?.kill();
    this.running.delete(slug);
  }

  killAll(): void {
    for (const child of this.running.values()) child.kill();
    this.running.clear();
  }
}
