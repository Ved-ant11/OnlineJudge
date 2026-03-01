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

const CPP_IMAGE = process.env.CPP_DOCKER_IMAGE || "oj-cpp-runner";

export const runCpp = async (
  code: string,
  testCases: TestCaseInput[],
): Promise<MultiTCResult> => {
  const combinedInput = testCases.map((tc) => tc.input).join(DELIMITER + "\n") + DELIMITER + "\n";
  const totalTimeLimit = testCases.reduce((sum, tc) => sum + tc.timeLimitMs, 0);

  const result = await runInDocker(
    CPP_IMAGE,
    combinedInput,
    totalTimeLimit,
    {
      USER_CODE: Buffer.from(code).toString("base64"),
    },
    ["--tmpfs", "/workspace:rw,exec,nosuid,size=10m,uid=100,gid=101"],
    10000, // extra startup for g++ compilation
  );

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
