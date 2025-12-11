import { test } from "./testRunner.js";

export function runParserTests() {
  // Imports
  test(
    "Library `importedLibrary` does not exist [for importing full library]",
    "import lib404",
    [],
    ["200035"]
  );
  test(
    "Expected library name or `[` in import statement",
    `import 5`,
    [],
    ["200030"]
  );
  test(
    "Expected `]` to close function group in import statement",
    `import [ a b 7`,
    [],
    ["200031"]
  );
  test(
    "Expected `from` after function group in import statement",
    `import [ a b ] nil`,
    [],
    ["200032"]
  );
  test(
    "Expected library name after `from` in import statement",
    `import [ a b ] from nil`,
    [],
    ["200033"]
  );
  test(
    "Multiple imports to library `importedLibrary` [from importing full library]",
    `import math import math`,
    [],
    ["200034"]
  );
  test(
    "Multiple imports to library `importedLibrary` [from importing some of library]",
    `import math import [math_pi] from math`,
    [],
    ["200034"]
  );
  test(
    "Function `importedFunction` not found in `importedLibrary` library",
    `import [ math_pi b math_ceil ] from math`,
    [],
    ["200036"]
  );
  test(
    "Library `importedLibrary` does not exist [for importing some of library]",
    "import [a] from lib404",
    [],
    ["200035"]
  );
  test(
    "Duplicate function `importedFunction` import",
    "import [math_pi math_ceil math_pi] from math",
    [],
    ["200037"]
  );
  test(
    "Multiple delayed import errors",
    "import [math_pi math_ceil math_pi] from math import lib404",
    [],
    ["200037", "200035"]
  );
  test(
    "Multiple delayed import errors then import syntax error",
    "import [math_pi math_ceil math_pi] from math import lib404 import 7 >>",
    [],
    ["200037", "200035", "200030"]
  );
  test(
    "Multiple delayed import errors then other syntax error",
    "import [math_pi math_ceil math_pi] from math import lib404 7 begin 7",
    [],
    ["200037", "200035", "200012"]
  );

  test("Expected `[` to start the rule scope", `begin => 7`, [], ["200002"]);
  test(
    "Expected `]` to end the rule scope",
    `begin => [ 7 >> 5`,
    [],
    ["200003"]
  );
  test("Unexpected token", `begin >> [ 8 ] &`, [], ["200001"]);
  test("Expected `]` to end the value scope", `begin >> [ 1`, [], ["200004"]);
  test(
    "Expected value or scope after match operator",
    `begin >> &`,
    [],
    ["200006"]
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
}
