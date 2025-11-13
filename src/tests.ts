import { ConsoleErrorReporter, ErrorInfo, ErrorReporter } from "./error.js";
import { run } from "./main.js";
import { RecordVal } from "./record.js";
import { colour } from "./utils/consoleUtils.js";
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

function test(
  label: string,
  source: string,
  simplifiedResult: Array<number | string | boolean | Term | null>,
  expectErrors: string[]
) {
  console.log(
    "========================================================================"
  );
  const desiredResult = listToRecord(simplifiedResult);
  const errReporter = new TestErrorReporter();
  testsRun += 1;
  console.log(colour.bright("RUNNING TEST") + `: ${label}`);
  console.log(
    colour.bright("EXPECTING ERROR(S)") +
      `: ${expectErrors.length == 0 ? "None" : expectErrors.map((code) => "E" + code).join(", ")}`
  );
  const result: RecordVal[] | null = run(source, errReporter);
  const errors = errReporter.getCodes();
  // Test to make sure the expected errors (or no errors) were found
  if (expectErrors.length != errors.length) {
    failDisplayErrorDifferences(expectErrors, errors);
    return;
  }
  for (let [i, code] of expectErrors.entries()) {
    if (code != errors[i]) {
      failDisplayErrorDifferences(expectErrors, errors);
      return;
    }
  }
  // Test the result of the record
  if (result == null) {
    console.log(colour.green("    TEST PASSED"));
    return // the program errored out and was expected to
  }
  if (result.length != desiredResult.length) {
    failDisplayRecordDifferences(desiredResult, result);
    return;
  }
  for (let [i, val] of desiredResult.entries()) {
    if (
      val.type != result[i].type ||
      val.value != result[i].value
    ) {
      failDisplayRecordDifferences(desiredResult, result);
      return;
    }
  }
  // Otherwise the test passed
  console.log(colour.green("    TEST PASSED"));
}
class Term {
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
  expectedErrs: string[],
  resultErrs: string[]
) {
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
  expectedRecord: RecordVal[],
  resultRecord: RecordVal[]
) {
  const end = Math.max(expectedRecord.length, resultRecord.length);
  let expected: string[] = [];
  let got: string[] = [];
  for (let i = 0; i < end; i++) {
    if (i >= expectedRecord.length) {
      got.push(colour.red(recordValToStr(resultRecord[i])));
    } else if (i >= resultRecord.length) {
      expected.push(colour.red(recordValToStr(expectedRecord[i])));
    } else if (expectedRecord[i].type != resultRecord[i].type || expectedRecord[i].value != resultRecord[i].value) {
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

function recordValToStr(val: RecordVal) {
  return `${val.type[0]}: ${val.value}`;
}
/* TESTING ERRORS */
/* Lexer */
test("Unexpected token", `1 $%* 8`, [], ["100001"]);
test("Unexpected token [at end of file]", `1 $%*`, [], ["100001"]);
test("Unexpected Token [at newline]", `1 $%*\n1`, [], ["100001"]);
test("Unexpected `-` [at end of file]", `1-`, [], ["100001"]);
test("Unterminated string", `1 "34`, [], ["100002"]);
/* Parser */
test("Expected `[` to start the rule scope", `begin => 7`, [], ["200002"]);
test("Expected `]` to end the rule scope", `begin => [ 7 >> 5`, [], ["200003"]);
test("Unexpected token", `begin >> [ 8 ] &`, [], ["200001"]);
test(
  "Variable `name` in not defined in the scope's pattern",
  `begin >> my_var`,
  [],
  ["200005"]
);
test("Expected `]` to end the value scope", `begin >> [ 1`, [], ["200004"]);
test(
  "Expected value or scope after match operator",
  `begin >> &`,
  [],
  ["200006"]
);
test(
  "Variable `name` in not defined in the scope's pattern [with a value scope]",
  `begin >> [ my_var ]`,
  [],
  ["200005"]
);
test(
  "Replacing match operator (`->`) is invalid for the `begin` pattern",
  `begin -> 7`,
  [],
  ["200007"]
);
test(
  "Replacing match operator (`->`) is invalid for the `end` pattern",
  `end -> 7`,
  [],
  ["200007"]
);
test(
  "Expected match operator after `begin` pattern",
  `begin 8`,
  [],
  ["200008"]
);
test("Expected match operator after `end` pattern", `end 8`, [], ["200008"]);
test(
  "Expected `)` to end the function call",
  `1 if 4 < myFun(3 4 -> 7`,
  [],
  ["200009"]
);
test(
  "Expected value after `!` in the value scope",
  `begin >> !`,
  [],
  ["200010"]
);
test("Expected expression after `if`", `4 if &`, [], ["200011"]);
test("Expected rule operator after the pattern", `1 2 []`, [], ["200012"]);
test(
  "Expected pattern value after `!` in the pattern, not a group",
  `num !(1 2) -> 7`,
  [],
  ["200013"]
);
test(
  "Expected pattern value in the pattern group",
  `1 () >> 7`,
  [],
  ["200014"]
);
test("Expected `)` to end the pattern group", `1 ( 5 >>`, [], ["200015"]);
test(
  "Expected pattern value after `!` in pattern",
  `num ! -> 7`,
  [],
  ["200016"]
);
test(
  "The `|` pattern operator cannot be combined with `as` within the same group",
  `1 as y 2 | 5 -> 6`,
  [],
  ["200017"]
);
test(
  "Expected pattern value(s) to the right of `|` pattern operator",
  `1 | => `,
  [],
  ["200018"]
);
test(
  "The left side of  `|` pattern operator must have the same number of pattern values as right side",
  `1 2 | 5 => 7`,
  [],
  ["200019"]
);
test(
  "Cannot use `as` in the middle of the `|` condition",
  `1 | 2 as x`,
  [],
  ["200020"]
);
test("Expected `)` to end `as` group", `1 2 as (x >>`, [], ["200022"]);
test(
  "Expected variable name or group of variable names after `as`",
  `1 as >>`,
  [],
  ["200023"]
);
test(
  "Expected variable name(s) in `as` group",
  `1 2 as () >> 4`,
  [],
  ["200021"]
);
test(
  "Variable `var_name` is already declared in the pattern",
  `1 as x 2 as x >> x`,
  [],
  ["200024"]
);
test(
  "Too many variables for the number of pattern values",
  `1 2 as (x y z)`,
  [],
  ["200025"]
);
test(
  "Expected value after `!` expression operator",
  `1 as x if ! >> 7`,
  [],
  ["200026"]
);
test("Expected expression after `(`", `1 if 3 < () >> 7`, [], ["200027"]);
test("Expected `)` to end expression", `1 if 3 < (6 >> 6`, [], ["200028"]);
test(
  "Expected expression after `op` expression operator [left op >= right op]",
  `1 if 6 > 8 & >> 8`,
  [],
  ["200029"]
);
test(
  "Expected expression after `op` expression operator [left op < right op]",
  `1 if 6 & 7 < >> 8`,
  [],
  ["200029"]
);
test(
  "Expected expression after `op` expression operator [no right op]",
  `1 if 5 & >>`,
  [],
  ["200029"]
);
/* Runtime */
test(
  "Left operand of `op` operator must be a number",
  `begin >> 1 1 if nil > 2 -> 2`,
  [],
  ["300001"]
);
test(
  "Right operand of `op` operator must be a number",
  `begin >> 1 1 if 2 > nil -> 2`,
  [],
  ["300002"]
);
test(
  "Function `fun_name` does not exist",
  `begin >> my_fun_dne()`,
  [],
  ["300003"]
);
test(
  "Function `fun_name` is not a safe function and cannot be used in expressions or within replaceing value scopes (eg. `-> [ ... ]`) [in expression]",
  `begin >> 1 1 if push(7) -> 6`,
  [],
  ["300004"]
);
test(
  "Function `fun_name` is not a safe function and cannot be used in expressions or within replaceing value scopes (eg. `-> [ ... ]`) [in replaceing value scope]",
  `begin >> 1 1 -> push(5)`,
  [],
  ["300004"]
);
test(
  "Invalid number of parameters, function `fun_name` must have x parameter(s) [too many parameters]",
  `begin >> print(3 4)`,
  [],
  ["300005"]
);
test(
  "Invalid number of parameters, function `fun_name` must have x parameter(s) [too few parameters]",
  `begin >> print()`,
  [],
  ["300005"]
);
test(
  "Parameter x of `fun_name` function must be a `type` type [at ending parameter]",
  `begin >> add(6 nil)`,
  [],
  ["300006"]
);
test(
  "Parameter x of `fun_name` function must be a `type` type [at starting parameter]",
  `begin >> add(nil 6)`,
  [],
  ["300006"]
);

/* TESTING RESULTS */
test(`Pushing match and chaining`, `begin >> [1 2] >> [3 4]`, [1, 2, 3, 4], []);
test(
  `Beginning pushing match and chaining`,
  `begin >> [3 4] << [1 2]`,
  [1, 2, 3, 4],
  []
);
test(
  `Replacing match`,
  `begin >> [1 2 3 2 4] 2 -> [ "two" "two" ]`,
  [1, "two", "two", 3, "two", "two", 4],
  []
);
test(
  `Replacing match with multiple pattern values`,
  `begin >> [1 2 3 2 4] 1 2 -> [ "one" "two" ]`,
  ["one", "two", 3, 2, 4],
  []
);
test(`Value Scope without []`, `begin >> 1`, [1], []);
test(
  `Variables and function with parameters`,
  `begin >> [1 2 3 ] num as x num as y -> add(x y)`,
  [6],
  []
);
test(
  `Variables with as (...)`,
  `begin >> [ 1 2 3] num num num as (x y z) -> sub(add(x y) z)`,
  [0],
  []
);
test(`Nots in value scope`, `begin >> [ !1 5 !2 !add(1 2)]`, [5], []);
test(`Not in non-[] value scope`, `begin >> !add(3 4)`, [], []);
test(
  `Chaining`,
  `begin >> 1 << 2 num as x -> to_str(x) !> nil end << 1 >> 4`,
  [1, "2", "1", 4],
  []
);
test(
  `Traditional values`,
  `begin >> [ "str" 1 Term true nil ]`,
  ["str", 1, new Term("Term"), true, null],
  []
);
test(`End`, `end >> [ 1 ]`, [1], []);
/* Patern Groups and Ors */
test(`Pattern group`, `begin >> [ 1 2 3 1 2] (1 (2)) -> 3`, [3, 3, 3], []);
test(
  `Pattern group and variable`,
  `begin >> [ 1 2 3 1 2] (1 (2) as x) -> x`,
  [2, 3, 2],
  []
);
test(`Or`, `begin >> [ 1 2 3 ] 1 | 2 >> 3`, [3, 3, 3], []);
test(`Or and groups`, `begin >> [ 1 2 3 ] (1|2) 3 -> 5`, [1, 5], []);
test(`Multiple Ors`, `begin >> [1 2 3 4 ] (1|2) (3|4) ->8`, [1, 8, 4], []);
test(
  `Multiple patter values in Or`,
  `begin >> [ 1 2 3 4] 1 2 | 3 4 -> 5`,
  [5, 5],
  []
);
/* Expression Operators */
test(
  `Less Than, case 1: x < y`,
  `begin >> [false] false if 1 < 2 -> true`,
  [true],
  []
);
test(
  `Less Than, case 2: x > y`,
  `begin >> [false] false if 2 < 1 -> true`,
  [false],
  []
);
test(
  `Less Than, case 3: x = y`,
  `begin >> [false] false if 1 < 1 -> true`,
  [false],
  []
);
test(
  `Greater Than, case 1: x < y`,
  `begin >> [false] false if 1 > 2 -> true`,
  [false],
  []
);
test(
  `Greater Than, case 2: x > y`,
  `begin >> [false] false if 2 > 1 -> true`,
  [true],
  []
);
test(
  `Greater Than, case 3: x = y`,
  `begin >> [false] false if 1 > 1 -> true`,
  [false],
  []
);
test(
  `Less Than Or Equal To, case 1: x < y`,
  `begin >> [false] false if 1 <= 2 -> true`,
  [true],
  []
);
test(
  `Less Than Or Equal To, case 2: x > y`,
  `begin >> [false] false if 2 <= 1 -> true`,
  [false],
  []
);
test(
  `Less Than Or Equal To, case 3: x = y`,
  `begin >> [false] false if 1 <= 1 -> true`,
  [true],
  []
);
test(
  `Greater Than Or Equal To, case 1: x < y`,
  `begin >> [false] false if 1 >= 2 -> true`,
  [false],
  []
);
test(
  `Greater Than Or Equal To, case 2: x > y`,
  `begin >> [false] false if 2 >= 1 -> true`,
  [true],
  []
);
test(
  `Greater Than Or Equal To, case 3: x = y`,
  `begin >> [false] false if 1 >= 1 -> true`,
  [true],
  []
);
test(
  `Equal To, case 1: =`,
  `begin >> [false] false if 1 = 1 -> true`,
  [true],
  []
);
test(
  `Equal To, case 2: type !=`,
  `begin >> [false] false if 1 = "1" -> true`,
  [false],
  []
);
test(
  `Equal To, case 3: value !=`,
  `begin >> [false] false if 1 = -1 -> true`,
  [false],
  []
);
test(
  `Equal To, case 3: value & type !=`,
  `begin >> [false] false if 1 = "one" -> true`,
  [false],
  []
);
test(
  `Not Equal To, case 1: =`,
  `begin >> [false] false if 1 != 1 -> true`,
  [false],
  []
);
test(
  `Not Equal To, case 2: type !=`,
  `begin >> [false] false if 1 != "1" -> true`,
  [true],
  []
);
test(
  `Not Equal To, case 3: value !=`,
  `begin >> [false] false if 1 != -1 -> true`,
  [true],
  []
);
test(
  `Not Equal To, case 4: value & type !=`,
  `begin >> [false] false if 1 != "one" -> true`,
  [true],
  []
);
test(
  `And, case 1: left has value`,
  `begin >> [false] false if 1 & 0 -> true`,
  [false],
  []
);
test(
  `And, case 2: right has value`,
  `begin >> [false] false if 0 & 1 -> true`,
  [false],
  []
);
test(
  `And, case 3: both have value`,
  `begin >> [false] false if 1 & 1 -> true`,
  [true],
  []
);
test(
  `And, case 4: neither have value`,
  `begin >> [false] false if 0 & 0 -> true`,
  [false],
  []
);
test(
  `Or, case 1: left has value`,
  `begin >> [false] false if 1 | 0 -> true`,
  [true],
  []
);
test(
  `Or, case 2: right has value`,
  `begin >> [false] false if 0 | 1 -> true`,
  [true],
  []
);
test(
  `Or, case 3: both have value`,
  `begin >> [false] false if 1 | 1 -> true`,
  [true],
  []
);
test(
  `Or, case 4: neither have value`,
  `begin >> [false] false if 0 | 0 -> true`,
  [false],
  []
);
test(
  `Not, case 1: right has value`,
  `begin >> [false] false if !1 -> true`,
  [false],
  []
);
test(
  `Not, case 2: right does not have value`,
  `begin >> [false] false if !0 -> true`,
  [true],
  []
);
/* Order of Operations */
test(
  `Order of operations wtih ()`,
  `begin >> [false] false if (3 > 2) & (5 <= 5) | (7 < 6) & !(4 >= 4) -> true`,
  [true],
  []
);
/* Has Value */
test(`Str has Value`, `begin >> [false] false if "1" -> true`, [true], []);
test(
  `Str does not have Value`,
  `begin >> [false] false if "" -> true`,
  [false],
  []
);
test(`Num has Value`, `begin >> [false] false if 7 -> true`, [true], []);
test(
  `Num does not have Value`,
  `begin >> [false] false if 0 -> true`,
  [false],
  []
);
test(`Bool has Value`, `begin >> [false] false if true -> true`, [true], []);
test(
  `Bool does not have Value`,
  `begin >> [false] false if false -> true`,
  [false],
  []
);
test(`Term has Value`, `begin >> [false] false if Term -> true`, [true], []);
test(
  `Nil does not have Value`,
  `begin >> [false] false if nil -> true`,
  [false],
  []
);
/* Down then Across */
test(
  `Down then across rule matching`,
  `begin >> [ 1 1 2 4 2 1 ] 1 1 -> 2 1 2 -> 3 2 2 -> 4 4 4 -> 8`,
  [8, 2, 1],
  []
);
test(
  `Down then across rule matching with nested rule scope`,
  `begin >> [ 1 2 Three_Ones ] 1 => [ num -> "NUMBER" ] Three_Ones -> [ 1 1 1 ]`,
  ["NUMBER", "NUMBER", "NUMBER"],
  []
);

/* TESTING FUNCTIONS */
test(
  `type`,
  `begin >> [type(0) type("this") type(Term) type(true) type(nil)]`,
  ["num", "str", "term", "bool", "nil"],
  []
);
test(
  `less`,
  `begin >> [ less(0 1) less(1 0) less(1 1)]`,
  [true, false, false],
  []
);
test(
  `greater`,
  `begin >> [ greater(0 1) greater(1 0) greater(1 1)]`,
  [false, true, false],
  []
);
test(
  `less_or_equal`,
  `begin >> [ less_or_equal(0 1) less_or_equal(1 0) less_or_equal(1 1)]`,
  [true, false, true],
  []
);
test(
  `greater_or_equal`,
  `begin >> [ greater_or_equal(0 1) greater_or_equal(1 0) greater_or_equal(1 1)]`,
  [false, true, true],
  []
);
test(
  `equal`,
  `begin >> [ equal(1 1) equal(1 0) equal(1 "1") equal(1 Term)]`,
  [true, false, false, false],
  []
);
test(
  `not_equal`,
  `begin >> [ not_equal(1 1) not_equal(1 0) not_equal(1 "1") not_equal(1 Term)]`,
  [false, true, true, true],
  []
);
test(`add`, `begin >> [ add(1 4) add(-4 8)]`, [5, 4], []);
test(`sub`, `begin >> [ sub(1 4) sub(-4 -8)]`, [-3, 4], []);
test(`mult`, `begin >> [ mult(1 4) mult(-4 8)]`, [4, -32], []);
test(`div`, `begin >> [ div(16 4) div(2 4)]`, [4, 0.5], []);
test(`mod`, `begin >> [ mod(15 4) mod(16 4)]`, [3, 0], []);
test(`floor_div`, `begin >> [ floor_div(15 4) floor_div(16 4)]`, [3, 4], []);
test(`floor`, `begin >> [ floor(0.7) floor(1.0)]`, [0, 1], []);
test(`ceil`, `begin >> [ ceil(0.7) ceil(1.0)]`, [1, 1], []);
test(
  `when`,
  `begin >> [ when(1 true false) when(0 true false)]`,
  [true, false],
  []
);
test(`or`, `begin >> [ or(0 1) or(1 0) or(1 2) or(0 "")]`, [1, 1, 1, ""], []);
test(
  `and`,
  `begin >> [ and(0 1) and(1 0) and(1 2) and(0 "")]`,
  [0, 0, 2, 0],
  []
);
test(`not`, `begin >> [ not(1) not(0)]`, [false, true], []);
test(`empty`, `begin >> [ 1 2 3 ] !> empty()`, [], []);
test(`size`, `begin >> [ 1 2 3 ] >> size()`, [1, 2, 3, 3], []);
test(`length`, `begin >> [ length("123") length("") ]`, [3, 0], []);
test(`join`, `begin >> [ join("1" " 2") join("" "1") ]`, ["1 2", "1"], []);
test(
  `join_with`,
  `begin >> [ join_with("1" "2" ", ") join_with("" "1" ", ") ]`,
  ["1, 2", ", 1"],
  []
);
test(`trim`, `begin >> [ trim(" one ") trim("1") ]`, ["one", "1"], []);
test(`is_str`, `begin >> [ is_str("1") is_str(1) ]`, [true, false], []);
test(`is_num`, `begin >> [ is_num(1) is_num("1") ]`, [true, false], []);
test(`is_term`, `begin >> [ is_term(Term) is_term(1) ]`, [true, false], []);
test(`is_bool`, `begin >> [ is_bool(true) is_bool(1) ]`, [true, false], []);
test(`is_nil`, `begin >> [ is_nil(nil) is_nil(1) ]`, [true, false], []);
test(
  `to_term`,
  `begin >> [ to_term("") to_term("a") to_term("Afa f") to_term(" My_Term ") ]`,
  [null, null, null, new Term("My_Term")],
  []
);
test(
  `to_str`,
  `begin >> [ to_str(nil) to_str(1.0) to_str(false) to_str(Term)]`,
  ["nil", "1", "false", "Term"],
  []
);
test(
  `to_num`,
  `begin >> [ to_num("") to_num("-") to_num("-.") to_num("-0.8f") to_num("-0.93")]`,
  [null, null, null, null, -0.93],
  []
);
test(`get`, `begin >> [ 1 2 3 ] >> [ get(1) get(-1) ]`, [1, 2, 3, 2, 3], []);
test(
  `get [Error: Parameter for \`get\` function must be an integer]`,
  `begin >> [ get(8.3) ]`,
  [],
  ["400001"]
);
test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, empty]`,
  `begin >> [ get(1) ]`,
  [],
  ["400002"]
);
test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, empty get 0]`,
  `begin >> [ get(0) ]`,
  [],
  ["400002"]
);
test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, not empty get -2]`,
  `begin >> 4 >> [ get(-2) ]`,
  [],
  ["400002"]
);
test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, not empty get 2]`,
  `begin >> 4 >> [ get(2) ]`,
  [],
  ["400002"]
);
test(`push`, `begin >> [ 1 2 3 ] !> push(4)`, [1, 2, 3, 4], []);
test(`push_begin`, `begin >> [ 1 2 3 ] !> push_begin(0)`, [0, 1, 2, 3], []);
test(
  `pop_begin`,
  `begin >> pop_begin() => [ nil -> "this" ] >> [ 1 2 3 ] >> pop_begin()`,
  [1, 2, 3, "this"],
  []
);
test(
  `pop`,
  `begin >> pop() => [ nil -> "this" ] >> [ 1 2 3 ] >> to_str(pop())`,
  ["this", 1, 2, "3"],
  []
);
test(
  `insert`,
  `begin >> [ 1 2 4 ] !> insert(0 0) !> insert(3 -1)`,
  [0, 1, 2, 3, 4],
  []
);
test(
  `insert [Error: Parameter for \`insert\` function must be an integer]`,
  `begin >> [ insert(9 8.23) ]`,
  [],
  ["400001"]
);
test(
  `insert [Error: \`y\` is out of range for \`insert\` function, the record has x values`,
  `begin >> [ insert(8 8) ]`,
  [],
  ["400002"]
);
test(
  `split_push`,
  `begin >> "0" !> split_push("1, 2, 3, 4" ", ")`,
  ["0", "1", "2", "3", "4"],
  []
);
test(`reverse`, `begin >> [1 2 3 4] !> reverse()`, [4, 3, 2, 1], []);

  console.log(
    "========================================================================"
  );
if (testsFailed) {
  console.log(
    colour.red(colour.bright(`${testsFailed}/${testsRun} OF ALL TESTS FAILED`))
  );
} else {
  console.log(
    colour.green(`ALL TESTS PASSED`)
  );
}
