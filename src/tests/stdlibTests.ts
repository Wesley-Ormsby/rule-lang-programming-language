import { Term, test } from "./testRunner.js";

export async function runStandardLibraryTests() {
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
test(`reverse`, `begin >> [1 2 3 4] !> reverse()`, [4, 3, 2, 1], []);
}
