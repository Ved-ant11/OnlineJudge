import { runInDocker } from "../dockerRunner";

type RunResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

const JS_IMAGE = process.env.JS_DOCKER_IMAGE || "oj-js-runner";

export const runJavaScript = async (
  code: string,
  input: string,
  timeLimitMs: number,
): Promise<RunResult> => {
  const result = await runInDocker(JS_IMAGE, input, timeLimitMs, {
    USER_CODE: Buffer.from(code).toString("base64"),
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    timedOut: result.timedOut,
  };
};
