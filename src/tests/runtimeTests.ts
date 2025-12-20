import { Term, test } from "./testRunner.js";

export async function runRuntimeTests() {
  // Imports
await test(
  "Importing multiple functions from library [importing only some functions from library]",
  `import [math_pi math_ceil] from math begin >> math_pi() >> math_ceil(2.4)`,
  [Math.PI, 3],
  []
);
await test(
  "Importing multiple functions from library [importing all from library]",
  `import math begin >> math_pi() >> math_ceil(2.4)`,
  [Math.PI, 3],
  []
);
await test(
  "Using non-imported function from library",
  `import [math_pi] from math begin >> math_ceil(2.4)`,
  [],
  ["300003"]
);
await test(
  "Importing from multiple libraries [importing all from library]",
  `import math import string begin >> math_pi() >> str_trim(" H ")`,
  [Math.PI, "H"],
  []
);
await test(
  "Importing from multiple libraries [importing only some functions from library]",
  `import [math_pi] from math import [str_trim] from string begin >> math_pi() >> str_trim(" H ")`,
  [Math.PI, "H"],
  []
);
await test(
  "See if namespaces work",
  `import [math_pi] from math begin >> when(true math_pi() 2)`,
  [Math.PI],
  []
);

await test(
  "Empty program",
  ``,
  [],
  []
);
await test(
  "Empty program [only import]",
  `import math`,
  [],
  []
);
await test(
  "Left operand of `op` operator must be a number",
  `begin >> 1 1 if nil > 2 -> 2`,
  [],
  ["300001"]
);
await test(
  "Right operand of `op` operator must be a number",
  `begin >> 1 1 if 2 > nil -> 2`,
  [],
  ["300002"]
);
await test(
  "Function `fun_name` does not exist",
  `begin >> my_fun_dne()`,
  [],
  ["300003"]
);
await test(
  "Function `fun_name` is not a safe function and cannot be used in expressions or within replaceing value scopes (eg. `-> [ ... ]`) [in expression]",
  `begin >> 1 1 if push(7) -> 6`,
  [],
  ["300004"]
);
await test(
  "Function `fun_name` is not a safe function and cannot be used in expressions or within replaceing value scopes (eg. `-> [ ... ]`) [in replaceing value scope]",
  `begin >> 1 1 -> push(5)`,
  [],
  ["300004"]
);
await test(
  "Invalid number of parameters, function `fun_name` must have x parameter(s) [too many parameters]",
  `begin >> is_num(3 4)`,
  [],
  ["300005"]
);
await test(
  "Invalid number of parameters, function `fun_name` must have at least x parameters [too few parameters in variadic function]",
  `begin >> join("T")`,
  [],
  ["300005"]
);
await test(
  "Invalid number of parameters, function `fun_name` must have x parameter(s) [too few parameters]",
  `begin >> print()`,
  [],
  ["300005"]
);
await test(
  "Parameter x of `fun_name` function must be a `type` type [at ending parameter]",
  `begin >> add(6 nil)`,
  [],
  ["300006"]
);
await test(
  "Parameter x of `fun_name` function must be a `type` type [at starting parameter]",
  `begin >> add(nil 6)`,
  [],
  ["300006"]
);
await test(
  "Parameter x of `fun_name` function must be a `type` type [in variadic function extra parameters]",
  `begin >> join("this" "this" "this" 4 "this")`,
  [],
  ["300006"]
);
await test(
  "Parameter x of `fun_name` function must be a `type` type [in non-variadic portion of variadic function]",
  `begin >> join("this" 4 "this")`,
  [],
  ["300006"]
);

// Scope tests
await test(
  "Variable \`myVariable\` is not defined",
  `begin >> [1 2] => [ num as x !> x ] >> x`,
  [],
  ["300007"]
);
  await test(
    "Variable \`myVariable\` is not defined [with a value scope]",
    `begin >> [ my_var ]`,
    [],
    ["300007"]
  );
    await test(
    "Variable \`myVariable\` is not defined",
    `begin >> my_var`,
    [],
    ["300007"]
  );
  await test(
  `Scoped variables`,
  `begin >> [MakeVar 1 2]
   MakeVar num as x num as y => [
      begin >> [MakeVar 3 4]
      MakeVar num as x num as z => [
        begin >> 1
        1 if x = 3 >> [x add(z add(x 1))]
      ]
      end >> [x y]
   ]`,
  [3, 8, 1, 2],
  []
);
  await test(
  `Scoped variables [error]`,
  `begin >> [MakeVar 1 2]
   MakeVar num as x num as y => [
      begin >> [MakeVar 3 4]
      MakeVar num as x num as z => [
        begin >> 1
      ]
      end >> z
   ]`,
  [],
  ["300007"]
);

// Defs tests
await test(
  "Defs",
  `def x := push(3) def z := "4" def y := to_num(z) begin >> [x y z]`,
  [3, null, 4, "4"],
  []
);

/* TESTING RESULTS */
await test(`Pushing match and chaining`, `begin >> [1 2] >> [3 4]`, [1, 2, 3, 4], []);
await test(
  `Beginning pushing match and chaining`,
  `begin >> [3 4] << [1 2]`,
  [1, 2, 3, 4],
  []
);
await test(
  `Replacing match`,
  `begin >> [1 2 3 2 4] 2 -> [ "two" "two" ]`,
  [1, "two", "two", 3, "two", "two", 4],
  []
);
await test(
  `Replacing match with multiple pattern values`,
  `begin >> [1 2 3 2 4] 1 2 -> [ "one" "two" ]`,
  ["one", "two", 3, 2, 4],
  []
);
await test(`Value Scope without []`, `begin >> 1`, [1], []);
await test(
  `Variables and function with parameters`,
  `begin >> [1 2 3 ] num as x num as y -> add(x y)`,
  [6],
  []
);
await test(
  `Variables with as (...)`,
  `begin >> [ 1 2 3] num num num as (x y z) -> sub(add(x y) z)`,
  [0],
  []
);
await test(`Nots in value scope`, `begin >> [ !1 5 !2 !add(1 2)]`, [5], []);
await test(`Not in non-[] value scope`, `begin >> !add(3 4)`, [], []);
await test(
  `Chaining`,
  `begin >> 1 << 2 num as x -> to_str(x) !> nil end << 1 >> 4`,
  [1, "2", "1", 4],
  []
);
await test(
  `Traditional values`,
  `begin >> [ "str" 1 Term true nil ]`,
  ["str", 1, new Term("Term"), true, null],
  []
);
await test(`End`, `end >> [ 1 ]`, [1], []);
/* Patern Groups and Ors */
await test(`Pattern group`, `begin >> [ 1 2 3 1 2] (1 (2)) -> 3`, [3, 3, 3], []);
await test(
  `Pattern group and variable`,
  `begin >> [ 1 2 3 1 2] (1 (2) as x) -> x`,
  [2, 3, 2],
  []
);
await test(`Or`, `begin >> [ 1 2 3 ] 1 | 2 >> 3`, [3, 3, 3], []);
await test(`Or and groups`, `begin >> [ 1 2 3 ] (1|2) 3 -> 5`, [1, 5], []);
await test(`Multiple Ors`, `begin >> [1 2 3 4 ] (1|2) (3|4) ->8`, [1, 8, 4], []);
await test(
  `Multiple patter values in Or`,
  `begin >> [ 1 2 3 4] 1 2 | 3 4 -> 5`,
  [5, 5],
  []
);
/* Expression Operators */
await test(
  `Less Than, case 1: x < y`,
  `begin >> [false] false if 1 < 2 -> true`,
  [true],
  []
);
await test(
  `Less Than, case 2: x > y`,
  `begin >> [false] false if 2 < 1 -> true`,
  [false],
  []
);
await test(
  `Less Than, case 3: x = y`,
  `begin >> [false] false if 1 < 1 -> true`,
  [false],
  []
);
await test(
  `Greater Than, case 1: x < y`,
  `begin >> [false] false if 1 > 2 -> true`,
  [false],
  []
);
await test(
  `Greater Than, case 2: x > y`,
  `begin >> [false] false if 2 > 1 -> true`,
  [true],
  []
);
await test(
  `Greater Than, case 3: x = y`,
  `begin >> [false] false if 1 > 1 -> true`,
  [false],
  []
);
await test(
  `Less Than Or Equal To, case 1: x < y`,
  `begin >> [false] false if 1 <= 2 -> true`,
  [true],
  []
);
await test(
  `Less Than Or Equal To, case 2: x > y`,
  `begin >> [false] false if 2 <= 1 -> true`,
  [false],
  []
);
await test(
  `Less Than Or Equal To, case 3: x = y`,
  `begin >> [false] false if 1 <= 1 -> true`,
  [true],
  []
);
await test(
  `Greater Than Or Equal To, case 1: x < y`,
  `begin >> [false] false if 1 >= 2 -> true`,
  [false],
  []
);
await test(
  `Greater Than Or Equal To, case 2: x > y`,
  `begin >> [false] false if 2 >= 1 -> true`,
  [true],
  []
);
await test(
  `Greater Than Or Equal To, case 3: x = y`,
  `begin >> [false] false if 1 >= 1 -> true`,
  [true],
  []
);
await test(
  `Equal To, case 1: =`,
  `begin >> [false] false if 1 = 1 -> true`,
  [true],
  []
);
await test(
  `Equal To, case 2: type !=`,
  `begin >> [false] false if 1 = "1" -> true`,
  [false],
  []
);
await test(
  `Equal To, case 3: value !=`,
  `begin >> [false] false if 1 = -1 -> true`,
  [false],
  []
);
await test(
  `Equal To, case 3: value & type !=`,
  `begin >> [false] false if 1 = "one" -> true`,
  [false],
  []
);
await test(
  `Not Equal To, case 1: =`,
  `begin >> [false] false if 1 != 1 -> true`,
  [false],
  []
);
await test(
  `Not Equal To, case 2: type !=`,
  `begin >> [false] false if 1 != "1" -> true`,
  [true],
  []
);
await test(
  `Not Equal To, case 3: value !=`,
  `begin >> [false] false if 1 != -1 -> true`,
  [true],
  []
);
await test(
  `Not Equal To, case 4: value & type !=`,
  `begin >> [false] false if 1 != "one" -> true`,
  [true],
  []
);
await test(
  `And, case 1: left has value`,
  `begin >> [false] false if 1 & 0 -> true`,
  [false],
  []
);
await test(
  `And, case 2: right has value`,
  `begin >> [false] false if 0 & 1 -> true`,
  [false],
  []
);
await test(
  `And, case 3: both have value`,
  `begin >> [false] false if 1 & 1 -> true`,
  [true],
  []
);
await test(
  `And, case 4: neither have value`,
  `begin >> [false] false if 0 & 0 -> true`,
  [false],
  []
);
await test(
  `Or, case 1: left has value`,
  `begin >> [false] false if 1 | 0 -> true`,
  [true],
  []
);
await test(
  `Or, case 2: right has value`,
  `begin >> [false] false if 0 | 1 -> true`,
  [true],
  []
);
await test(
  `Or, case 3: both have value`,
  `begin >> [false] false if 1 | 1 -> true`,
  [true],
  []
);
await test(
  `Or, case 4: neither have value`,
  `begin >> [false] false if 0 | 0 -> true`,
  [false],
  []
);
await test(
  `Not, case 1: right has value`,
  `begin >> [false] false if !1 -> true`,
  [false],
  []
);
await test(
  `Not, case 2: right does not have value`,
  `begin >> [false] false if !0 -> true`,
  [true],
  []
);
/* Order of Operations */
await test(
  `Order of operations wtih ()`,
  `begin >> [false] false if (3 > 2) & (5 <= 5) | (7 < 6) & !(4 >= 4) -> true`,
  [true],
  []
);
/* Has Value */
await test(`Str has Value`, `begin >> [false] false if "1" -> true`, [true], []);
await test(
  `Str does not have Value`,
  `begin >> [false] false if "" -> true`,
  [false],
  []
);
await test(`Num has Value`, `begin >> [false] false if 7 -> true`, [true], []);
await test(
  `Num does not have Value`,
  `begin >> [false] false if 0 -> true`,
  [false],
  []
);
await test(`Bool has Value`, `begin >> [false] false if true -> true`, [true], []);
await test(
  `Bool does not have Value`,
  `begin >> [false] false if false -> true`,
  [false],
  []
);
await test(`Term has Value`, `begin >> [false] false if Term -> true`, [true], []);
await test(
  `Nil does not have Value`,
  `begin >> [false] false if nil -> true`,
  [false],
  []
);
/* Down then Across */
await test(
  `Down then across rule matching`,
  `begin >> [ 1 1 2 4 2 1 ] 1 1 -> 2 1 2 -> 3 2 2 -> 4 4 4 -> 8`,
  [8, 2, 1],
  []
);
await test(
  `Down then across rule matching with nested rule scope`,
  `begin >> [ 1 2 Three_Ones ] 1 => [ num -> "NUMBER" ] Three_Ones -> [ 1 1 1 ]`,
  ["NUMBER", "NUMBER", "NUMBER"],
  []
);
}
