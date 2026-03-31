import { test } from "./testRunner.js";

export async function runParserTests() {
  console.log("Running parser tests...")
  // Imports
  await test(
    "Library `importedLibrary` does not exist [for importing full library]",
    "import lib404",
    [],
    ["200035"],
  );
  await test(
    "Expected library name or `[` in import statement",
    `import 5`,
    [],
    ["200030"],
  );
  await test(
    "Expected `]` to close function group in import statement",
    `import [ a b 7`,
    [],
    ["200031"],
  );
  await test(
    "Expected `from` after function group in import statement",
    `import [ a b ] nil`,
    [],
    ["200032"],
  );
  await test(
    "Expected library name after `from` in import statement",
    `import [ a b ] from nil`,
    [],
    ["200033"],
  );
  await test(
    "Multiple imports to library `importedLibrary` [from importing full library]",
    `import math import math`,
    [],
    ["200034"],
  );
  await test(
    "Multiple imports to library `importedLibrary` [from importing some of library]",
    `import math import [math_pi] from math`,
    [],
    ["200034"],
  );
  await test(
    "Function `importedFunction` not found in `importedLibrary` library",
    `import [ math_pi b math_ceil ] from math`,
    [],
    ["200036"],
  );
  await test(
    "Library `importedLibrary` does not exist [for importing some of library]",
    "import [a] from lib404",
    [],
    ["200035"],
  );
  await test(
    "Duplicate function `importedFunction` import",
    "import [math_pi math_ceil math_pi] from math",
    [],
    ["200037"],
  );
  await test(
    "Multiple delayed import errors",
    "import [math_pi math_ceil math_pi] from math import lib404",
    [],
    ["200037", "200035"],
  );
  await test(
    "Multiple delayed import errors then import syntax error",
    "import [math_pi math_ceil math_pi] from math import lib404 import 7 >>",
    [],
    ["200037", "200035", "200030"],
  );
  await test(
    "Multiple delayed import errors then other syntax error",
    "import [math_pi math_ceil math_pi] from math import lib404 7 begin 7",
    [],
    ["200037", "200035", "200012"],
  );

  // Defs
  await test(
    "Expected identifier for global variable name",
    `def 8`,
    [],
    ["200005"],
  );
  await test(
    "Duplicate global variable, \`myVar\` has already been defined",
    `def x := 7 def x := 6`,
    [],
    ["200040"],
  );
  await test(
    "Expected `:=` for global variable definition",
    `def x 8`,
    [],
    ["200038"],
  );
  await test(
    "Expected value for global variable definition",
    `def x := &`,
    [],
    ["200039"],
  );

  await test(
    "Expected `[` to start the rule scope",
    `begin => 7`,
    [],
    ["200002"],
  );
  await test(
    "Expected `]` to end the rule scope",
    `begin => [ 7 >> 5`,
    [],
    ["200003"],
  );
  await test("Unexpected token", `begin >> [ 8 ] &`, [], ["200001"]);
  await test(
    "Expected `]` to end the value scope",
    `begin >> [ 1`,
    [],
    ["200004"],
  );
  await test(
    "Expected value or scope after match operator",
    `begin >> &`,
    [],
    ["200006"],
  );
  await test(
    "Replacing match operator (`->`) is invalid for the `begin` pattern",
    `begin -> 7`,
    [],
    ["200007"],
  );
  await test(
    "Replacing match operator (`->`) is invalid for the `end` pattern",
    `end -> 7`,
    [],
    ["200007"],
  );
  await test(
    "Expected match operator after `begin` pattern",
    `begin 8`,
    [],
    ["200008"],
  );
  await test(
    "Expected match operator after `end` pattern",
    `end 8`,
    [],
    ["200008"],
  );
  await test(
    "Expected `)` to end the function call",
    `1 if 4 < myFun(3 4 -> 7`,
    [],
    ["200009"],
  );
  await test(
    "Expected value after `!` in the value scope",
    `begin >> !`,
    [],
    ["200010"],
  );
  await test("Expected expression after `if`", `4 if &`, [], ["200011"]);
  await test(
    "Expected expression after `elif`",
    `4 if true >> 4 elif &`,
    [],
    ["200011"],
  );
  await test(
    "Expected rule operator after the pattern",
    `1 2 []`,
    [],
    ["200012"],
  );
  await test(
    "Expected rule operator after the pattern [misplaced condition after \`else\`]",
    `1 if true >> 3 else i = 3 >> 5`,
    [],
    ["200012"],
  );
  await test(
    "Expected rule operator after the pattern [\`elif\` before an \`if\`]",
    `1 elif true`,
    [],
    ["200012"],
  );
  await test(
    "Expected rule operator after the pattern [\`else\` before an \`if\`]",
    `1 else true`,
    [],
    ["200012"],
  );
  await test(
    "Expected pattern value after `!` in the pattern, not a group",
    `num !(1 2) -> 7`,
    [],
    ["200013"],
  );
  await test(
    "Expected pattern value in the pattern group",
    `1 () >> 7`,
    [],
    ["200014"],
  );
  await test(
    "Expected `)` to end the pattern group",
    `1 ( 5 >>`,
    [],
    ["200015"],
  );
  await test(
    "Expected pattern value after `!` in pattern",
    `num ! -> 7`,
    [],
    ["200016"],
  );
  await test(
    "The `|` pattern operator cannot be combined with `as` within the same group",
    `1 as y 2 | 5 -> 6`,
    [],
    ["200017"],
  );
  await test(
    "Expected pattern value(s) to the right of `|` pattern operator",
    `1 | => `,
    [],
    ["200018"],
  );
  await test(
    "The left side of  `|` pattern operator must have the same number of pattern values as right side",
    `1 2 | 5 => 7`,
    [],
    ["200019"],
  );
  await test(
    "Cannot use `as` in the middle of the `|` condition",
    `1 | 2 as x`,
    [],
    ["200020"],
  );
  await test("Expected `)` to end `as` group", `1 2 as (x >>`, [], ["200022"]);
  await test(
    "Expected variable name or group of variable names after `as`",
    `1 as >>`,
    [],
    ["200023"],
  );
  await test(
    "Expected variable name(s) in `as` group",
    `1 2 as () >> 4`,
    [],
    ["200021"],
  );
  await test(
    "Variable `var_name` is already declared in the pattern",
    `1 as x 2 as x >> x`,
    [],
    ["200024"],
  );
  await test(
    "Too many variables for the number of pattern values",
    `1 2 as (x y z)`,
    [],
    ["200025"],
  );
  await test(
    "Expected value after `!` expression operator",
    `1 as x if ! >> 7`,
    [],
    ["200026"],
  );
  await test(
    "Expected expression after `(`",
    `1 if 3 < () >> 7`,
    [],
    ["200027"],
  );
  await test(
    "Expected `)` to end expression",
    `1 if 3 < (6 >> 6`,
    [],
    ["200028"],
  );
  await test(
    "Expected expression after `op` expression operator [left op >= right op]",
    `1 if 6 > 8 & >> 8`,
    [],
    ["200029"],
  );
  await test(
    "Expected expression after `op` expression operator [left op < right op]",
    `1 if 6 & 7 < >> 8`,
    [],
    ["200029"],
  );
  await test(
    "Expected expression after `op` expression operator [no right op]",
    `1 if 5 & >>`,
    [],
    ["200029"],
  );
}
