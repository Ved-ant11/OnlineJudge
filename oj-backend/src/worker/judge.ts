import { runJavaScript } from "./languages/javascript";
import { Verdict } from "../generated/prisma/client";

type TestCase = {
  input: string;
  expectedOutput: string;
  timeLimitMs: number;
};

const normalize = (output: string) =>
  output.replace(/\r\n/g, "\n").trim();

export const judgeJavaScriptSubmission = async ({
  code,
  testCases,
}: {
  code: string;
  testCases: TestCase[];
}): Promise<{ verdict: Verdict; message: string }> => {
  // Compilation step
  try {
    new Function(code);
  } catch (err: any) {
    return {
      verdict: Verdict.CE,
      message: err.message,
    };
  }

  //for test case execution in sequence
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];

    const result = await runJavaScript(
      code,
      tc.input,
      tc.timeLimitMs
    );

    if (result.timedOut) {
      return {
        verdict: Verdict.TLE,
        message: `Time Limit Exceeded on test case ${i + 1}`,
      };
    }

    if (result.stderr) {
      return {
        verdict: Verdict.RTE,
        message: `Runtime Error on test case ${i + 1}`,
      };
    }

    const userOutput = normalize(result.stdout);
    const expected = normalize(tc.expectedOutput);

    if (userOutput !== expected) {
      return {
        verdict: Verdict.WA,
        message: `Wrong Answer on test case ${i + 1}`,
      };
    }
  }

  return {
    verdict: Verdict.AC,
    message: "Accepted",
  };
};
