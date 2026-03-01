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

const PY_IMAGE = process.env.PY_DOCKER_IMAGE || "oj-python-runner";

export const runPython = async (
  code: string,
  testCases: TestCaseInput[],
): Promise<MultiTCResult> => {
  const combinedInput = testCases.map((tc) => tc.input).join(DELIMITER + "\n") + DELIMITER + "\n";
  const totalTimeLimit = testCases.reduce((sum, tc) => sum + tc.timeLimitMs, 0);

  const result = await runInDocker(PY_IMAGE, combinedInput, totalTimeLimit, {
    USER_CODE: Buffer.from(code).toString("base64"),
  });

  const outputs = result.stdout
    .split(DELIMITER + "\n")
    .filter((o) => o.length > 0 || result.stdout.includes(DELIMITER));

  while (outputs.length > 0 && outputs[outputs.length - 1].trim() === "") {
    outputs.pop();
  }

  return {
    outputs,
    stderr: result.stderr,
    timedOut: result.timedOut,
  };
};
