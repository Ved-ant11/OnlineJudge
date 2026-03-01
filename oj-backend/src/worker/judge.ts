import { Verdict } from "../generated/prisma/client";
import { runJavaScript } from "../judge/languages/javascript";
import { runPython } from "../judge/languages/python";
import { runCpp } from "../judge/languages/cpp";
import type { MultiTCResult } from "../judge/languages/javascript";

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

const analyzeResults = (
  result: MultiTCResult,
  testCases: TestCase[],
  language: string,
): JudgeResult => {
  // 1. Overall timeout — the entire container was killed
  if (result.timedOut) {
    return {
      verdict: Verdict.TLE,
      message: "Time Limit Exceeded",
    };
  }

  // 2. Check for compilation errors (stderr with no outputs)
  if (result.stderr && result.outputs.length === 0) {
    if (language === "cpp" && result.stderr.includes("error:")) {
      return {
        verdict: Verdict.CE,
        message: "Compilation Error",
        stderr: result.stderr,
      };
    }
    if ((language === "javascript" || language === "python") && isSyntaxError(result.stderr)) {
      return {
        verdict: Verdict.CE,
        message: "Compilation Error",
        stderr: result.stderr,
      };
    }
    // Generic runtime error if stderr but no outputs
    return {
      verdict: Verdict.RTE,
      message: "Runtime Error",
      stderr: result.stderr,
    };
  }

  // 3. Compare each test case output
  for (let i = 0; i < testCases.length; i++) {
    const actualOutput = result.outputs[i];

    // If we got fewer outputs than test cases, the code errored/crashed on this TC
    if (actualOutput === undefined) {
      return {
        verdict: Verdict.RTE,
        message: `Runtime Error on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stderr: result.stderr,
      };
    }

    // Compare normalized output
    if (normalize(actualOutput) !== normalize(testCases[i].expectedOutput)) {
      return {
        verdict: Verdict.WA,
        message: `Wrong Answer on test case ${i + 1}`,
        failedTestCaseIndex: i,
        stdout: actualOutput,
      };
    }
  }

  return { verdict: Verdict.AC, message: "Accepted" };
};

const runAll = async (
  language: string,
  code: string,
  testCases: TestCase[],
): Promise<MultiTCResult> => {
  const tcInputs = testCases.map((tc) => ({
    input: tc.input,
    timeLimitMs: tc.timeLimitMs,
  }));

  if (language === "javascript") return runJavaScript(code, tcInputs);
  if (language === "python") return runPython(code, tcInputs);
  if (language === "cpp") return runCpp(code, tcInputs);

  throw new Error(`Unsupported language: ${language}`);
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
  try {
    const result = await runAll(language, code, testCases);
    return analyzeResults(result, testCases, language);
  } catch (err) {
    return {
      verdict: Verdict.CE,
      message: `Unsupported language: ${language}`,
    };
  }
};
