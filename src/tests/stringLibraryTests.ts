import { Term, test } from "./testRunner.js";

export function runStringLibraryTests() {
  test(
    `str_trim`,
    `import [str_trim] from string begin >> [ str_trim(" one ") str_trim("1") ]`,
    ["one", "1"],
    []
  );
  test(
    `str_split`,
    `import [str_split] from string begin >> "0" !> str_split("1, 2, 3, 4" ", ")`,
    ["0", "1", "2", "3", "4"],
    []
  );
  test(
    `str_lowercase`,
    `import [str_lowercase] from string begin >> [ str_lowercase("heLlo, WOrlD") ]`,
    ["hello, world"],
    []
  );
  test(
    `str_uppercase`,
    `import [str_uppercase] from string begin >> [ str_uppercase("heLlo, WOrlD") ]`,
    ["HELLO, WORLD"],
    []
  );
  test(
    `str_get_char`,
    `import [str_get_char] from string begin >> [ str_get_char("123" 0) str_get_char("123" 1) str_get_char("123" 2) str_get_char("123" -1) str_get_char("123" -2) str_get_char("123" -3) ]`,
    ["1", "2", "3", "3", "2", "1"],
    []
  );
  test(
    `str_get_char [index out of bounds (to positively large)]`,
    `import [str_get_char] from string begin >> [ str_get_char("123" 3) ]`,
    [],
    ["400003"]
  );
  test(
    `str_get_char [index out of bounds (to negatively large)]`,
    `import [str_get_char] from string begin >> [ str_get_char("123" -4) ]`,
    [],
    ["400003"]
  );
  test(
    `str_get_char [index not integer]`,
    `import [str_get_char] from string begin >> [ str_get_char("123" 3.3) ]`,
    [],
    ["400001"]
  );
  test(
    `str_substr [first index not integer]`,
    `import [str_substr] from string begin >> [ str_substr("123" 3.3 1) ]`,
    [],
    ["400001"]
  );
  test(
    `str_substr [second index not integer]`,
    `import [str_substr] from string begin >> [ str_substr("123" 3 1.5) ]`,
    [],
    ["400001"]
  );
  test(
    `str_substr [both indices not integers]`,
    `import [str_substr] from string begin >> [ str_substr("123" 3.3 1.3) ]`,
    [],
    ["400001", "400001"]
  );
  test(
    `str_substr [first index out of bounds]`,
    `import [str_substr] from string begin >> [ str_substr("123" -4 1) ]`,
    [],
    ["400003"]
  );
  test(
    `str_substr [second index out of bounds]`,
    `import [str_substr] from string begin >> [ str_substr("123" 1 3) ]`,
    [],
    ["400003"]
  );
  test(
    `str_substr [both indices out of bounds]`,
    `import [str_substr] from string begin >> [ str_substr("123" 3 4) ]`,
    [],
    ["400003", "400003"]
  );
  test(
    `str_substr`,
    `import [str_substr] from string begin >> [ str_substr("012345" 0 2) str_substr("012345" 5 0) str_substr("012345" -1 -3) str_substr("012345" 2 2)]`,
    ["012","012345","345", "2"],
    []
  );
  test(
    `str_starts_with`,
    `import [str_starts_with] from string begin >> [ str_starts_with("012" "01") str_starts_with("012" "02") str_starts_with("012" "0123")]`,
    [true, false, false],
    []
  );
  test(
    `str_ends_with`,
    `import [str_ends_with] from string begin >> [ str_ends_with("012" "12") str_ends_with("012" "02") str_ends_with("012" "0123")]`,
    [true, false, false],
    []
  );
  test(
    `str_contains`,
    `import [str_contains] from string begin >> [ str_contains("012" "12") str_contains("012" "0") str_contains("012" "02") str_contains("012" "0123")]`,
    [true, true, false, false],
    []
  );
  test(
    `str_index_of`,
    `import [str_index_of] from string begin >> [ str_index_of("012012" "01") str_index_of("012" "1") str_index_of("012" "0123")]`,
    [0, 1, -1],
    []
  );
  test(
    `str_last_index_of`,
    `import [str_last_index_of] from string begin >> [ str_last_index_of("012012" "01") str_last_index_of("012" "1") str_last_index_of("012" "0123")]`,
    [3, 1, -1],
    []
  );
  test(
    `str_repeat [index not an integer]`,
    `import [str_repeat] from string begin >> [ str_repeat("0" 3.2) ]`,
    [],
    ["400001"]
  );
  test(
    `str_repeat`,
    `import [str_repeat] from string begin >> [ str_repeat("0" 3) ]`,
    ["000"],
    []
  );
  test(
    `str_replace`,
    `import [str_replace] from string begin >> [ str_replace("ab0ba0" "0" "1") str_replace("abba" "0" "1")]`,
    ["ab1ba0", "abba"],
    []
  );
test(
    `str_char_code [string not char]`,
    `import [str_char_code] from string begin >> [ str_char_code("34") ]`,
    [],
    ["400004"]
  );
  test(
    `str_char_code`,
    `import [str_char_code] from string begin >> [ str_char_code("H") ]`,
    [72],
    []
  );
    test(
    `str_from_code [index not an integer]`,
    `import [str_from_code] from string begin >> [ str_from_code(3.4) ]`,
    [],
    ["400001"]
  );
  test(
    `str_from_code`,
    `import [str_from_code] from string begin >> [ str_from_code(72) ]`,
    ["H"],
    []
  );
}
