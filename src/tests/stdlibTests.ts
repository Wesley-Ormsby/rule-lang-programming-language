import { Term, test } from "./testRunner.js";

export async function runStandardLibraryTests() {
  console.log("Running standard library tests...")
  await test(
  `type`,
  `begin >> [type(0) type("this") type(Term) type(true) type(nil)]`,
  ["num", "str", "term", "bool", "nil"],
  []
);
await test(
  `less`,
  `begin >> [ less(0 1) less(1 0) less(1 1)]`,
  [true, false, false],
  []
);
await test(
  `greater`,
  `begin >> [ greater(0 1) greater(1 0) greater(1 1)]`,
  [false, true, false],
  []
);
await test(
  `less_or_equal`,
  `begin >> [ less_or_equal(0 1) less_or_equal(1 0) less_or_equal(1 1)]`,
  [true, false, true],
  []
);
await test(
  `greater_or_equal`,
  `begin >> [ greater_or_equal(0 1) greater_or_equal(1 0) greater_or_equal(1 1)]`,
  [false, true, true],
  []
);
await test(
  `equal`,
  `begin >> [ equal(1 1) equal(1 0) equal(1 "1") equal(1 Term)]`,
  [true, false, false, false],
  []
);
await test(
  `not_equal`,
  `begin >> [ not_equal(1 1) not_equal(1 0) not_equal(1 "1") not_equal(1 Term)]`,
  [false, true, true, true],
  []
);
await test(`add`, `begin >> [ add(1 4) add(-4 8)]`, [5, 4], []);
await test(`sub`, `begin >> [ sub(1 4) sub(-4 -8)]`, [-3, 4], []);
await test(`mult`, `begin >> [ mult(1 4) mult(-4 8)]`, [4, -32], []);
await test(`div`, `begin >> [ div(16 4) div(2 4)]`, [4, 0.5], []);
await test(`mod`, `begin >> [ mod(15 4) mod(16 4)]`, [3, 0], []);
await test(`floor_div`, `begin >> [ floor_div(15 4) floor_div(16 4)]`, [3, 4], []);
await test(
  `when`,
  `begin >> [ when(1 true false) when(0 true false)]`,
  [true, false],
  []
);
await test(`or`, `begin >> [ or(0 1) or(1 0) or(1 2) or(0 "")]`, [1, 1, 1, ""], []);
await test(
  `and`,
  `begin >> [ and(0 1) and(1 0) and(1 2) and(0 "")]`,
  [0, 0, 2, 0],
  []
);
await test(`not`, `begin >> [ not(1) not(0)]`, [false, true], []);
await test(`empty`, `begin >> [ 1 2 3 ] !> empty()`, [], []);
await test(`size`, `begin >> [ 1 2 3 ] >> size()`, [1, 2, 3, 3], []);
await test(`length`, `begin >> [ length("123") length("") ]`, [3, 0], []);
await test(`join`, `begin >> [ join("1" " 2") join("" "1" "2" "3") ]`, ["1 2", "123"], []);
await test(`is_str`, `begin >> [ is_str("1") is_str(1) ]`, [true, false], []);
await test(`is_num`, `begin >> [ is_num(1) is_num("1") ]`, [true, false], []);
await test(`is_term`, `begin >> [ is_term(Term) is_term(1) ]`, [true, false], []);
await test(`is_bool`, `begin >> [ is_bool(true) is_bool(1) ]`, [true, false], []);
await test(`is_nil`, `begin >> [ is_nil(nil) is_nil(1) ]`, [true, false], []);
await test(`is_int`, `begin >> [ is_int("1") is_int(1) is_int(2.0) is_int(2.1) ]`, [false, true, true, false], []);
await test(
  `to_term`,
  `begin >> [ to_term("") to_term("a") to_term("Afa f") to_term(" My_Term ") ]`,
  [null, null, null, new Term("My_Term")],
  []
);
await test(
  `to_str`,
  `begin >> [ to_str(nil) to_str(1.0) to_str(false) to_str(Term)]`,
  ["nil", "1", "false", "Term"],
  []
);
await test(
  `to_num`,
  `begin >> [ to_num("") to_num("-") to_num("-.") to_num("-0.8f") to_num("-0.93")]`,
  [null, null, null, null, -0.93],
  []
);
await test(`get`, `begin >> [ 1 2 3 ] >> [ get(1) get(-1) ]`, [1, 2, 3, 2, 3], []);
await test(
  `get [Error: Parameter for \`get\` function must be an integer]`,
  `begin >> [ get(8.3) ]`,
  [],
  ["400001"]
);
await test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, empty]`,
  `begin >> [ get(1) ]`,
  [],
  ["400002"]
);
await test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, empty get 0]`,
  `begin >> [ get(0) ]`,
  [],
  ["400002"]
);
await test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, not empty get -2]`,
  `begin >> 4 >> [ get(-2) ]`,
  [],
  ["400002"]
);
await test(
  `get [Error: \`y\` is out of range for \`get\` function, the record has x values, not empty get 2]`,
  `begin >> 4 >> [ get(2) ]`,
  [],
  ["400002"]
);
await test(`push`, `begin >> [ 1 2 3 ] !> push(4) >> push(5 6 7)`, [1, 2, 3, 4, 5, 6, 7, null], []);
await test(`push_begin`, `begin >> [ 1 2 3 ] !> push_begin(0) >> push_begin(-2 -1)`, [-2, -1, 0, 1, 2, 3, null], []);
await test(
  `pop_begin`,
  `begin >> pop_begin() => [ nil -> "this" ] >> [ 1 2 3 ] >> pop_begin()`,
  [1, 2, 3, "this"],
  []
);
await test(
  `pop`,
  `begin >> pop() => [ nil -> "this" ] >> [ 1 2 3 ] >> to_str(pop())`,
  ["this", 1, 2, "3"],
  []
);
await test(
  `insert`,
  `begin >> [ 1 2 4 ] !> insert(0 0) !> insert(3 -1)`,
  [0, 1, 2, 3, 4],
  []
);
await test(
  `insert [Error: Parameter for \`insert\` function must be an integer]`,
  `begin >> [ insert(9 8.23) ]`,
  [],
  ["400001"]
);
await test(
  `insert [Error: \`y\` is out of range for \`insert\` function, the record has x values`,
  `begin >> [ insert(8 8) ]`,
  [],
  ["400002"]
);
await test(`reverse`, `begin >> [1 2 3 4] !> reverse()`, [4, 3, 2, 1], []);

// Formatting tests
await test(
  `format [Error: Too many parameters [3] for the number of placeholders in the format string [2]`,
  `begin >> format("this % %" 1 1 1)`,
  [],
  ["4000012"]
);
await test(
  `format [Error: Too many parameters [1] for the number of placeholders in the format string [0]`,
  `begin >> format("this" 1)`,
  [],
  ["4000012"]
);
await test(
  `format [Error: Too few parameters [1] for the number of placeholders in the format string [2]`,
  `begin >> format("this % %" 1)`,
  [],
  ["4000011"]
);
await test(
  `format [Error: Too few parameters [0] for the number of placeholders in the format string [1]`,
  `begin >> format("this %")`,
  [],
  ["4000011"]
);
await test(
  `format [basic placeholders and %% and !]`,
  `begin >> format("a % % %!+%%+ %" 1 Term nil "str")`,
  ["a 1 Term nil+%+ str"],
  []
);
await test(
  `format [numbers with +/_]`,
  `begin >> format("%+" 2.3)
         >> format("%+" -2.3)
         >> format("%_" 2.3)
         >> format("%_" -2.3)
         >> format("%+_" 2.3)
         >> format("%_+" 2.3)
  `,
  ["+2.3", "-2.3", " 2.3", "-2.3", " 2.3", "+2.3"],
  []
);
await test(
  `format [numbers with , and prefixes]`,
  `begin >> format("%," 12345678.345)
         >> format("%+," -12345678.345)
         >> format("%_," 12345678.345)
  `,
  ["12,345,678.345", "-12,345,678.345", " 12,345,678.345"],
  []
);
await test(
  `format [numbers with .precision]`,
  `begin >> format("%.3" 12345.3456789)
         >> format("%.0" -12345678.345)
         >> format("%.5" 12345678.345)
         >> format("%_+,.4" 12345.345678)
         >> format("%.1" 1.23)
  `,
  ["12345.345", "-12345678", "12345678.34500", "+12,345.3456", "1.2"],
  []
);
await test(
  `format [widths]`,
  `begin >> format("|%5.1|" 1.23)
         >> format("|%6|" "cat")
         >> format("|%>6|" "cat")
         >> format("|%^6|" "cat")
         >> format("|%>^7|" "cat")
         >> format("|%^>7|" "cat")
  `,
  ["|1.2  |", "|cat   |", "|   cat|", "| cat  |", "|  cat  |", "|    cat|"],
  []
);
}
