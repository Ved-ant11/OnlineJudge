import { spawn } from "child_process";

type RunResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export const runJavaScript = (
  code: string,
  input: string,
  timeLimitMs: number
): Promise<RunResult> => {
  return new Promise((resolve) => {
    const child = spawn("node", ["-e", code], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeLimitMs);

    child.stdin.write(input);
    child.stdin.end();

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", () => {
      clearTimeout(timer);
      resolve({ stdout, stderr, timedOut });
    });
  });
};
