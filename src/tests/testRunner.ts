import { ConsoleErrorReporter, ErrorInfo, ErrorReporter } from "../error.js";
import { run } from "../main.js";
import { RecordVal } from "../record.js";
import { colour } from "../utils/consoleUtils.js";
import { runLexerTests } from "./lexerTests.js";
import { runMathLibraryTests } from "./mathLibraryTests.js";
import { runParserTests } from "./parserTests.js";
import { runRuntimeTests } from "./runtimeTests.js";
import { runStandardLibraryTests } from "./stdlibTests.js";
import { runStringLibraryTests } from "./stringLibraryTests.js";
let testsFailed = 0;
let testsRun = 0;

export class TestErrorReporter
  extends ConsoleErrorReporter
  implements ErrorReporter
{
  constructor() {
    super("", "");
  }
  protected reportErr(err: ErrorInfo): null {
    return null;
  }

  public getCodes(): string[] {
    return this.errors.map((err) => err.code);
  }
}

export async function test(
  label: string,
  source: string,
  simplifiedResult: Array<number | string | boolean | Term | null>,
  expectErrors: string[]
) {
  const desiredResult = listToRecord(simplifiedResult);
  const errReporter = new TestErrorReporter();
  testsRun += 1;
  let result: RecordVal[] | null = null;
  try {
    result = await run(source, errReporter);
  } catch (e) {
    console.log(
      "========================================================================"
    );
    console.log(colour.bright("RUNNING TEST") + `: ${label}`);
    console.log(colour.bright(colour.red("    TEST FAILED")) + ": TS Error");
    console.log(e);
    console.log(
      "========================================================================"
    );
    testsFailed += 1;
    return;
  }
  const errors = errReporter.getCodes();
  // Test to make sure the expected errors (or no errors) were found
  if (expectErrors.length != errors.length) {
    failDisplayErrorDifferences(label, expectErrors, errors);
    return;
  }
  for (let [i, code] of expectErrors.entries()) {
    if (code != errors[i]) {
      failDisplayErrorDifferences(label, expectErrors, errors);
      return;
    }
  }
  // Test the result of the record
  if (result == null) {
    return; // the program errored out and was expected to (so it passed)
  }
  if (result.length != desiredResult.length) {
    failDisplayRecordDifferences(label, desiredResult, result, expectErrors);
    return;
  }
  for (let [i, val] of desiredResult.entries()) {
    if (val.type != result[i].type || val.value != result[i].value) {
      failDisplayRecordDifferences(label, desiredResult, result, expectErrors);
      return;
    }
  }
  // Otherwise the test passed
}
export class Term {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}
function listToRecord(
  list: Array<number | string | boolean | Term | null>
): RecordVal[] {
  return list.map((val: number | string | boolean | Term | null) => {
    if (val instanceof Term) {
      return { type: "TERM", value: val.name };
    } else if (val === null) {
      return { type: "NIL", value: "nil" };
    } else if (typeof val === "boolean") {
      return { type: "BOOL", value: String(val) };
    } else if (typeof val === "string") {
      return { type: "STR", value: String(val) };
    } else {
      return { type: "NUM", value: String(val) };
    }
  });
}

function failDisplayErrorDifferences(
  testLabel: string,
  expectedErrs: string[],
  resultErrs: string[],
) {
  printFailHeader(testLabel, expectedErrs)
  const end = Math.max(expectedErrs.length, resultErrs.length);
  let expected: string[] = [];
  let got: string[] = [];
  for (let i = 0; i < end; i++) {
    if (i >= expectedErrs.length) {
      got.push(colour.red("E" + resultErrs[i]));
    } else if (i >= resultErrs.length) {
      expected.push(colour.red("E" + expectedErrs[i]));
    } else if (expectedErrs[i] != resultErrs[i]) {
      expected.push("E" + expectedErrs[i]);
      got.push(colour.red("E" + resultErrs[i]));
    } else {
      expected.push("E" + expectedErrs[i]);
      got.push("E" + resultErrs[i]);
    }
  }
  console.log(
    colour.bright(
      colour.red(
        "    TEST FAILED: Expected errors don't match the resulting errors"
      )
    )
  );
  console.log(
    colour.bright("    Expected: ") +
      (expected.length ? expected.join(", ") : "No Errors")
  );
  console.log(
    colour.bright("    Got:      ") +
      (got.length ? got.join(", ") : "No Errors")
  );
  testsFailed += 1;
}

function failDisplayRecordDifferences(
  testLabel: string,
  expectedRecord: RecordVal[],
  resultRecord: RecordVal[],
  expectedErrors: string[]
) {
  printFailHeader(testLabel, expectedErrors)
  const end = Math.max(expectedRecord.length, resultRecord.length);
  let expected: string[] = [];
  let got: string[] = [];
  for (let i = 0; i < end; i++) {
    if (i >= expectedRecord.length) {
      got.push(colour.red(recordValToStr(resultRecord[i])));
    } else if (i >= resultRecord.length) {
      expected.push(colour.red(recordValToStr(expectedRecord[i])));
    } else if (
      expectedRecord[i].type != resultRecord[i].type ||
      expectedRecord[i].value != resultRecord[i].value
    ) {
      expected.push(recordValToStr(expectedRecord[i]));
      got.push(colour.red(recordValToStr(resultRecord[i])));
    } else {
      expected.push(recordValToStr(expectedRecord[i]));
      got.push(recordValToStr(resultRecord[i]));
    }
  }
  console.log(
    colour.bright(
      colour.red(
        "    TEST FAILED: Expected record doesn't match the resulting record"
      )
    )
  );
  console.log(colour.bright("    Expected: ") + `[ ${expected.join(", ")} ]`);
  console.log(colour.bright("    Got:      ") + `[ ${got.join(", ")} ]`);
  testsFailed += 1;
}

function printFailHeader(testLabel:string, expectedErrors: string[]) {
  console.log(
    "========================================================================"
  );
  console.log(colour.bright("RUNNING TEST") + `: ${testLabel}`);
  console.log(
    colour.bright("EXPECTING ERROR(S)") +
      `: ${expectedErrors.length == 0 ? "None" : expectedErrors.map((code) => "E" + code).join(", ")}`
  );
}

function recordValToStr(val: RecordVal) {
  return `${val.type[0]}: ${val.value}`;
}

/* Run Tests */
runLexerTests();
runParserTests();
runRuntimeTests();
runStandardLibraryTests();
runMathLibraryTests();
runStringLibraryTests();

/* TESTING FUNCTIONS */

/* Math Library Functions */

/* Str Library Functions */

if (testsFailed) {
  console.log(
  "========================================================================"
);
  console.log(
    colour.red(colour.bright(`${testsFailed}/${testsRun} OF ALL TESTS FAILED`))
  );
} else {
  console.log(colour.green(`ALL TESTS PASSED (${testsRun}/${testsRun})`));
}
