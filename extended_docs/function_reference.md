# Function Reference

## Standard Library

- `print(...messages:any) -> nil`: Displays all `messages` in the console joined by spaces and ending in a new line.
- `printf(template:str ...parameters:any) -> nil`: Displays the formatted string `template` with the `parameters` inserted in placeholders.
- `emit(...messages:any) -> nil`: Displays all `messages` in the console joined by spaces.
- `input(prompt:str) -> str`: Displays `prompt` and waits until user enters input, returning that input.
- `wait(delay:num) -> nil`: Delays `delay` milliseconds.
- `type(value:any) -> str`: Returns the type of `value` as a string.
- `less(left:num, right:num) -> bool`: Returns `true` if `left` is less than `right`, otherwise `false`.
- `greater(left:num, right:num) -> bool`: Returns `true` if `left` is greater than `right`, otherwise `false`.
- `less_or_equal(left:num, right:num) -> bool`: Returns `true` if `left` is less than or equal to `right`, otherwise `false`.
- `greater_or_equal(left:num, right:num) -> bool`: Returns `true` if `left` is greater than or equal to `right`, otherwise `false`.
- `equal(left:any, right:any) -> bool`: Returns `true` if `left` is the same value and type as `right`, otherwise `false`.
- `not_equal(left:any, right:any) -> bool`: Returns `true` if `left` is not the same value or not the same type as `right`, otherwise `false`.
- `add(left:num, right:num) -> num`: Returns the sum of `left` and `right`.
- `sub(left:num, right:num) -> num`: Returns the difference between `left` and `right`.
- `mult(left:num, right:num) -> num`: Returns the product of `left` and `right`.
- `div(left:num, right:num) -> num`: Returns the division of `left` by `right`.
- `floor_div(left:num, right:num) -> num`: Returns the floor division of `left` by `right`.
- `mod(left:num, right:num) -> num`: Returns the remainder of `left` divided by `right`.
- `random(x:num, y:num) -> num`: Returns a random integer within the range `[x,y]` such that both `x` and `y` are both inclusive.
- `when(condition:any, true_val:any, false_val:any) -> any [LAZY]`: Evaluate and returns `true_val` if `condition` is *truthy*, otherwise evaluate and returns `false_val`.
- `or(left:any, right:any) -> any [LAZY]`: Evaluates `left`. If it is true, return `left`, otherwise evaluate and return `right`.
- `and(left:any, right:any) -> any [LAZY]`: Evaluates `left`. If it is false, return `left`, otherwise evaluate and return `right`.
- `not(value:any) -> bool`: Returns `true` if `value` is *truthy*, otherwise `false`.
- `empty() -> nil [UNSAFE]`: Clears the record.
- `size() -> num`: Returns the size of the record.
- `length(str:str) -> num`: Returns the length of `str`.
- `format(template:str ...parameters:any) -> str`: Returns the formatted string `template` with the `parameters` inserted in placeholders.
- `join(left:str, right:str ...strs:str) -> str`: Returns the concatenation of `left` and `right` and any additional string parameter.
- `join_with(left:str, right:str, combiner:str) -> str`: Returns `left`, `combiner`, and `right` concatenated together.
- `is_str(value:any) -> bool`: Returns `true` if `value` is a string, otherwise `false`.
- `is_num(value:any) -> bool`: Returns `true` if `value` is a number, otherwise `false`.
- `is_term(value:any) -> bool`: Returns `true` if `value` is a term, otherwise `false`.
- `is_bool(value:any) -> bool`: Returns `true` if `value` is a boolean, otherwise `false`.
- `is_nil(value:any) -> bool`: Returns `true` if `value` is nil, otherwise `false`.
- `to_term(str:str) -> term`: Converts `str` to a term if possible, otherwise returns nil.
- `to_str(value:any) -> str`: Converts `value` to a string.
- `to_num(str:str) -> num`: Converts `str` to a number if possible, otherwise returns nil.
- `get(index:num) -> any`: Returns the value at `index` in the record. Indexes start at `1` and the record is also indexed negatively with `-1` as the final index.
- `push(...values:any) -> any [UNSAFE]`: Appends `values` to the end of the record and returns `nil`.
- `push_begin(...values:any) -> any [UNSAFE]`: Prepends `values` to the beginning of the record and returns `nil`.
- `pop() -> any [UNSAFE]`: Removes and returns the last value in the record. If the record is empty, returns `nil`.
- `pop_begin() -> any [UNSAFE]`: Removes and returns the first value in the record. If the record is empty, returns `nil`.
- `insert(value:any, index:num) -> any [UNSAFE]`: Inserts `value` at the given `index` in the record and returns it. If `index` is out of range, throws an error.
- `reverse() -> nil [UNSAFE]`: Reverses the order of values in the record and returns `nil`.

## Math
```py
import math
```
- `math_pi() -> num`: Returns PI (`3.141592653589793`).
- `math_e() -> num`: Returns Euler's number (`2.718281828459045`).
- `math_floor(value:num) -> num`: Returns the largest integer less than or equal to `value`.
- `math_ceil(value:num) -> num`: Returns the smallest integer greater than or equal to `value`.
- `math_round(value:num) -> num`: Returns `value` rounded to the nearest integer.
- `math_sqrt(value:num) -> num | nil`: Returns the square root of `value`, or `nil` if the result is impossible.
- `math_pow(base:num, exp:num) -> num | nil`: Returns `base` raised to the exponent `exp`, or `nil` if the result is impossible.
- `math_log(value:num) -> num | nil`: Returns the natural logarithm of `value`, or `nil` if the result is undefined.
- `math_log2(value:num) -> num | nil`: Returns the base-2 logarithm of `value`, or `nil` if the result is undefined.
- `math_log10(value:num) -> num | nil`: Returns the base-10 logarithm of `value`, or `nil` if the result is undefined.
- `math_abs(value:num) -> num`: Returns the absolute value of `value`.
- `math_sin(radians:num) -> num`: Returns the sine of a radian angle `radians`.
- `math_cos(radians:num) -> num`: Returns the cosine of a radian angle `radians`.
- `math_tan(radians:num) -> num`: Returns the tangent of a radian angle `radians`.
- `math_min(val1:num val2:num ...nums:num) -> num`: Returns the minimum value of all number parameters.
- `math_max(val1:num val2:num ...nums:num) -> num`: Returns the maximum value of all number parameters.

## String

```py
import string
```

- `str_lowercase(str:str) -> str`: Returns `str` converted to lowercase.
- `str_uppercase(str:str) -> str`: Returns `str` converted to uppercase.
- `str_trim(str:str) -> str`: Returns `str` with leading and trailing whitespace removed.
- `str_split(str:str, delimiter:str) -> nil [UNSAFE]`: Splits `str` by `delimiter` and appends the resulting substrings as new values to the record. Returns `nil`.
- `str_get_char(str:str index:num) -> str`: Gets the character at at `index` within `str` and returns it as a 1-character string.
- `str_substr(str:str i:num j:num) -> str`: Returns the substring of `str`, all the characters from index `i` to `j` inclusive.
- `str_starts_with(str:str start:str) -> bool`: Returns `true` if `str` starts with the string `start`, otherwise `false`.
- `str_ends_with(str:str end:str) -> bool`: Returns `true` if `str` ends with the string `end`, otherwise `false`.
- `str_contains(str:str substr:str) -> bool`: Returns `true` if `str` contains the substring `substr`, otherwise `false`.
- `str_index_of(str:str substr:str) -> num`: Returns the index of the start of the first occurrence of `substr` within `str`, or `-1` if the string does not include `substr`.
- `str_last_index_of(str:str substr:str) -> num`: Returns the index of the start of the last occurrence of `substr` within `str`, or `-1` if the string does not include `substr`.
- `str_replace(str:str searchStr:str replaceStr:str) -> str`: Returns `str` with the first occurrence of `searchStr` replaced with `replaceStr`.
- `str_char_code(char:str) -> num`: Returns the unicode number representation of the 1-character string `char`.
- `str_from_code(charCode:num) -> str`: Returns the text representation of the unicode code `charCode` as a string.

## File

```py
import file
```

- `file_read(path:str) -> str`: Returns the contents of the file at `path`.
- `file_write(path:str content:str) -> nil`: Writes `content` to the file at `path`. If the file already exists, its contents are overwritten.
- `file_append(path:str content:str) -> nil`: Appends `content` to the end of the file at `path`. If the file does not exists, it will make a new file first.
- `file_prepend(path:str content:str) -> nil`: Prepends `content` to the start of the file at `path`. If the file does not exists, it will make a new file first.
- `file_remove(path:str) -> nil`: Deletes the file at `path`.
- `file_rename(fromPath:str toPath:str) -> nil`: Renames the file at `fromPath` to `toPath`.
- `file_exists(path:str) -> bool`: Returns `true` if the file at `path` exists. Otherwise it returns `false`.