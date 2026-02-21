import { runInDocker } from "../dockerRunner";

type RunResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

const PY_IMAGE = process.env.PY_DOCKER_IMAGE || "oj-python-runner";

export const runPython = async (
  code: string,
  input: string,
  timeLimitMs: number,
): Promise<RunResult> => {
  const result = await runInDocker(PY_IMAGE, input, timeLimitMs, {
    USER_CODE: Buffer.from(code).toString("base64"),
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    timedOut: result.timedOut,
  };
};
