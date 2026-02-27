import { Verdict } from "../generated/prisma/client";
import { runJavaScript } from "../judge/languages/javascript";
import { runPython } from "../judge/languages/python";
import { runCpp } from "../judge/languages/cpp";

type TestCase = {
  input: string;
  expectedOutput: string;
  timeLimitMs: number;
};

export type JudgeResult = {
  verdict: Verdict;
  message: string;
  failedTestCaseIndex?: number;
  stdout?: string;
  stderr?: string;
};

const normalize = (s: string) => s.replace(/\r\n/g, "\n").trim();

const isSyntaxError = (stderr: string): boolean => /SyntaxError/.test(stderr);

const judgeCpp = async (
  code: string,
  testCases: TestCase[],
): Promise<JudgeResult> => {
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const r = await runCpp(code, tc.input, tc.timeLimitMs);

    if (r.timedOut)
      return {
        verdict: Verdict.TLE,
        message: `Time Limit Exceeded on test case ${i + 1}`,
        failedTestCaseIndex: i,
      };

    if (r.stderr.includes("error:")) {
      return {
        verdict: Verdict.CE,
        message: "Compilation Error",
        stderr: r.stderr,
      };
    }

    if (r.stderr) {
      return {
        verdict: Verdict.RTE,
        message: `Runtime Error on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stderr: r.stderr,
      };
    }


    if (normalize(r.stdout) !== normalize(tc.expectedOutput))
      return {
        verdict: Verdict.WA,
        message: `Wrong Answer on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stdout: r.stdout,
      };
  }

  return { verdict: Verdict.AC, message: "Accepted" };
};

const judgeJS = async (
  code: string,
  testCases: TestCase[],
): Promise<JudgeResult> => {
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const r = await runJavaScript(code, tc.input, tc.timeLimitMs);

    if (r.timedOut)
      return {
        verdict: Verdict.TLE,
        message: `Time Limit Exceeded on test case ${i + 1}`,
        failedTestCaseIndex: i,
      };

    if (r.stderr) {
      if (isSyntaxError(r.stderr))
        return {
          verdict: Verdict.CE,
          message: "Compilation Error",
          stderr: r.stderr,
        };
      return {
        verdict: Verdict.RTE,
        message: `Runtime Error on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stderr: r.stderr,
      };
    }

    if (normalize(r.stdout) !== normalize(tc.expectedOutput))
      return {
        verdict: Verdict.WA,
        message: `Wrong Answer on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stdout: r.stdout,
      };
  }

  return { verdict: Verdict.AC, message: "Accepted" };
};

const judgePython = async (
  code: string,
  testCases: TestCase[],
): Promise<JudgeResult> => {
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const r = await runPython(code, tc.input, tc.timeLimitMs);

    if (r.timedOut)
      return {
        verdict: Verdict.TLE,
        message: `Time Limit Exceeded on test case ${i + 1}`,
        failedTestCaseIndex: i,
      };

    if (r.stderr) {
      if (isSyntaxError(r.stderr))
        return {
          verdict: Verdict.CE,
          message: "Compilation Error",
          stderr: r.stderr,
        };
      return {
        verdict: Verdict.RTE,
        message: `Runtime Error on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stderr: r.stderr,
      };
    }

    if (normalize(r.stdout) !== normalize(tc.expectedOutput))
      return {
        verdict: Verdict.WA,
        message: `Wrong Answer on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stdout: r.stdout,
      };
  }

  return { verdict: Verdict.AC, message: "Accepted" };
};

export const judgeSubmission = async ({
  language,
  code,
  testCases,
}: {
  language: string;
  code: string;
  testCases: TestCase[];
}): Promise<JudgeResult> => {
  if (language === "javascript") return judgeJS(code, testCases);
  if (language === "python") return judgePython(code, testCases);
  if (language === "cpp") return judgeCpp(code, testCases);

  return { verdict: Verdict.CE, message: `Unsupported language: ${language}` };
};
