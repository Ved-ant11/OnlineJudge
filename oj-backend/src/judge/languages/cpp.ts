import { runInDocker } from "../dockerRunner";

type RunResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

const CPP_IMAGE = process.env.CPP_DOCKER_IMAGE || "oj-cpp-runner";

export const runCpp = async (
  code: string,
  input: string,
  timeLimitMs: number,
): Promise<RunResult> => {
  const result = await runInDocker(CPP_IMAGE, input, timeLimitMs, {
    USER_CODE: Buffer.from(code).toString("base64"),
  }, ["--tmpfs", "/workspace:rw,exec,nosuid,size=10m,uid=100,gid=101"], 10000
);

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    timedOut: result.timedOut,
  };
};
