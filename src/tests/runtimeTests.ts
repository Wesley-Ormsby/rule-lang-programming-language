import { Term, test } from "./testRunner.js";

export function runRuntimeTests() {
  // Imports
test(
  "Importing multiple functions from library [importing only some functions from library]",
  `import [math_pi math_ceil] from math begin >> math_pi() >> math_ceil(2.4)`,
  [Math.PI, 3],
  []
);
test(
  "Importing multiple functions from library [importing all from library]",
  `import math begin >> math_pi() >> math_ceil(2.4)`,
  [Math.PI, 3],
  []
);
test(
  "Using non-imported function from library",
  `import [math_pi] from math begin >> math_ceil(2.4)`,
  [],
  ["300003"]
);
test(
  "Importing from multiple libraries [importing all from library]",
  `import math import string begin >> math_pi() >> str_trim(" H ")`,
  [Math.PI, "H"],
  []
);
test(
  "Importing from multiple libraries [importing only some functions from library]",
  `import [math_pi] from math import [str_trim] from string begin >> math_pi() >> str_trim(" H ")`,
  [Math.PI, "H"],
  []
);
test(
  "See if namespaces work",
  `import [math_pi] from math begin >> when(true math_pi() 2)`,
  [Math.PI],
  []
);

test(
  "Empty program",
  ``,
  [],
  []
);
test(
  "Empty program [only import]",
  `import math`,
  [],
  []
);
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
test(
  "Variable \`myVariable\` is not defined",
  `begin >> add( add 1 )`,
  [],
  ["300007"]
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
}
