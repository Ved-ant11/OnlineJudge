import { runInDocker } from "../dockerRunner";

const DELIMITER = "---TC_END---";

type TestCaseInput = {
  input: string;
  timeLimitMs: number;
};

export type MultiTCResult = {
  outputs: string[];
  stderr: string;
  timedOut: boolean;
};

const JS_IMAGE = process.env.JS_DOCKER_IMAGE || "oj-js-runner";

export const runJavaScript = async (
  code: string,
  testCases: TestCaseInput[],
): Promise<MultiTCResult> => {
  // Concatenate all inputs with delimiter
  const combinedInput = testCases.map((tc) => tc.input).join(DELIMITER + "\n") + DELIMITER + "\n";

  // Total timeout = sum of all time limits + startup overhead
  const totalTimeLimit = testCases.reduce((sum, tc) => sum + tc.timeLimitMs, 0);

  const result = await runInDocker(JS_IMAGE, combinedInput, totalTimeLimit, {
    USER_CODE: Buffer.from(code).toString("base64"),
  });

  // Parse delimited output into per-TC results
  const outputs = result.stdout
    .split(DELIMITER + "\n")
    .filter((o) => o.length > 0 || result.stdout.includes(DELIMITER));

  // Remove trailing empty entries
  while (outputs.length > 0 && outputs[outputs.length - 1].trim() === "") {
    outputs.pop();
  }

  return {
    outputs,
    stderr: result.stderr,
    timedOut: result.timedOut,
  };
};
