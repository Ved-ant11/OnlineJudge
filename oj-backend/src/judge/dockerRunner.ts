import { spawn } from "child_process";

type DockerRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
};

const MAX_STDOUT_BYTES = 64 * 1024;
const MAX_STDERR_BYTES = 16 * 1024;

const MEMORY_LIMIT = "256m";
const CPU_LIMIT = "0.5";
const PIDS_LIMIT = "32";
const DOCKER_STARTUP_OVERHEAD_MS = 5000;

const log = (msg: string, data?: Record<string, unknown>) => {
  const ts = new Date().toISOString();
  if (data) {
    console.log(`[${ts}] [docker] ${msg}`, JSON.stringify(data));
  } else {
    console.log(`[${ts}] [docker] ${msg}`);
  }
};

export const runInDocker = (
  image: string,
  stdin: string,
  timeoutMs: number,
  env?: Record<string, string>,
): Promise<DockerRunResult> => {
  return new Promise((resolve) => {
    const effectiveTimeout = timeoutMs + DOCKER_STARTUP_OVERHEAD_MS;

    log(`Starting container`, {
      image,
      timeoutMs,
      effectiveTimeoutMs: effectiveTimeout,
      stdinLength: stdin.length,
      envKeys: env ? Object.keys(env) : [],
    });

    const startTime = Date.now();

    const args = [
      "run",
      "--rm",
      "--memory",
      MEMORY_LIMIT,
      "--memory-swap",
      MEMORY_LIMIT,
      "--cpus",
      CPU_LIMIT,
      "--pids-limit",
      PIDS_LIMIT,
      "--network",
      "none",
      "--read-only",
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,size=10m",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges",
    ];

    if (env) {
      for (const [k, v] of Object.entries(env)) {
        args.push("-e", `${k}=${v}`);
      }
    }

    args.push("-i", image);

    const docker = spawn("docker", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let killed = false;

    const timer = setTimeout(() => {
      timedOut = true;
      killed = true;
      const elapsed = Date.now() - startTime;
      log(`Container TIMED OUT after ${elapsed}ms — killing`, {
        image,
        effectiveTimeoutMs: effectiveTimeout,
        stdoutLength: stdout.length,
        stderrLength: stderr.length,
      });
      docker.kill("SIGKILL");
    }, effectiveTimeout);

    docker.stdout.on("data", (d) => {
      stdout += d.toString();
      if (stdout.length > MAX_STDOUT_BYTES) {
        stderr += "\n[System] Output limit exceeded";
        if (!killed) {
          killed = true;
          log(`Stdout limit exceeded — killing container`, { image });
          docker.kill("SIGKILL");
        }
      }
    });

    docker.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > MAX_STDERR_BYTES) {
        if (!killed) {
          killed = true;
          log(`Stderr limit exceeded — killing container`, { image });
          docker.kill("SIGKILL");
        }
      }
    });

    docker.on("close", (exitCode) => {
      clearTimeout(timer);
      const elapsed = Date.now() - startTime;

      log(`Container exited`, {
        image,
        exitCode,
        timedOut,
        elapsedMs: elapsed,
        stdoutLength: stdout.length,
        stderrLength: stderr.length,
        stderrPreview: stderr.length > 0 ? stderr.slice(0, 300) : "(empty)",
        stdoutPreview: stdout.length > 0 ? stdout.slice(0, 200) : "(empty)",
      });

      resolve({ stdout, stderr, exitCode, timedOut });
    });

    docker.on("error", (err) => {
      clearTimeout(timer);
      const elapsed = Date.now() - startTime;
      log(`Docker spawn error after ${elapsed}ms`, {
        image,
        error: String(err),
      });
      resolve({
        stdout,
        stderr: stderr + `\n[System] Docker spawn error: ${err.message}`,
        exitCode: null,
        timedOut: false,
      });
    });

    docker.stdin.write(stdin);
    docker.stdin.end();
  });
};
