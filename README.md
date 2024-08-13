# RuleLang Docs

RuleLang is an esoteric matching language with bizarre control flow. 

```py
# fizzbuzz
begin >> 1
num as x if x <= 100 & mod(x 15) = 0 >> [ add(x 1) !print("FizzBuzz")]
num as x if x <= 100 & mod(x 3) = 0 >> [ add(x 1) !print("Fizz")] 
num as x if x <= 100 & mod(x 5) = 0 >> [ add(x 1) !print("Buzz")] 
num as x if x <= 100 >> [ add(x 1) !print(x)] 
num !> [] # Remove the last number from the record
          # Although not necessary, this is good practice
```
> [!NOTE]
> The code examples are highlighted in Python, so they might not be entirely accurate, but they are easier to understand.
## Instillation for CLI

```
npm i rule-lang-programming-language
```
## Running Files via CLI

```
# .rul is the file extention for a RuleLang program
rule my_file.rul
```


## The Record

Everything in RuleLang is built on the **record**, which is the only *true* storage for values. The **record** is a list of values. You can easily add values to the **record**, remove values, or loop throughout the **record**.

### Comments
```py
# This is a comment
#[
 Comments can be multi-
 line
]#
```
### Values
There are five different types of primitive data types also known as **values** (for simplicity).

#### Numbers (`num`)
If a number is a decimal number less than 1, it must be prepended with a `0`. Negative numbers can prepended with `-` and no space in between characters.
```py
1 
1.2 
0.4
-0.6
```

#### Strings (`str`)
Strings are naturally multi-line, but they can be typed on a single line using escape codes.
```py
"Hello, World"
"Multi-
Line
String"
# Escape Codes:
#   \" -> "
#   \\ -> \
#   \n -> new line 
```

#### Booleans (`bool`)
A boolean is either `true` (has value) or `false` (does not have value).
```py
true
false
```

#### Terms (`term`)
A term is a word that starts with a capital letter and only contains alphanumeric characters and underlines. 
```py
Loop
My_Term
LOOP_TO_100
```
#### Nil (`nil`)
This value represents a failed result or no return value from a function. 
```py
nil
```

### Rules
**Rules** are the main control flow of RuleLang. Each rule consists of a **pattern** that will be matched against the **record**. When a successful match occurs, the **rule**'s **scope(s)** will be evaluated in a way determined by the **match operator(s)**. All the parts of a **rule** will be explained below, and several examples tie together these concepts at the end.

#### Pattern
Think of a **pattern** as a key to the lock. Only a specific grove sequence will open the lock. Similarly, only a specific **pattern** will *match* the record.

The RuleLang program is a big **rule scope**, a sequence of **rules** that continue attempting to *match* against the **record** until no more **patterns** match. The simplest **patterns** are `begin` and `end`. The `begin` pattern will automatically match when entering the **rule scope** before all other **patterns** attempt to match, and the `end` pattern will match when leaving the **rule scope** after all other **patterns** cease to match.

All other **patterns** are custom **patterns** that repeatably attempt to match against the record until there are no more matches.

##### Pattern Values
Custom **patterns** are made of a sequence of **pattern values**. If each **pattern value** matches the **record** value it's compared to, a successful match has taken place!

A **pattern value** can simply be any value:
```py
false           # Matches a `false` in the record
"Hello, World!" # Matches a `Hello, World!` in the record
```
A **pattern value** can also match any value of a type:
```py
num             # Matches any number in the record, like `5` or `2`
str             # Matches any string in the record, like `Hello` or `World`
term            # Matches any term in the record, like `Loop` or `If`
bool            # Matches any boolean in the record, like `true` or `false`
any             # Matches any value in the record of any type
```
**Patterns** can have multiple **pattern values** in a sequence.
```py
1 2          # Matches a `1` followed by a `2` in the record
true any str # Matches a `true` followed by any value, and then a string
```
##### Logical Pattern Operators
There are several **pattern operators** that can alter a **pattern value**.
###### Not
The **not** operator  (`!`) matches anything *but* the following pattern value.
```py
!1 # Matches any value but a `1` in the record, like `3` or `My_Term`

!str # Matches any value but a string in the record, like `1` or `false`
```

> [!WARNING]
> You cannot have a sequence of **not**s, `!!!!7` is an error.

###### Or
The **or** operator  (`|`) matches one group of **pattern values** *or* the other group of **pattern values**. Each side of the **or** operator must have the same number of **pattern values**.
```py
1 | 2      # Matches `1` or `2` in the record
num | str  # Matches any number or string in the record
1 2 | 3    # Error! The left group has 2 pattern values, and the right has 1
```
Parenthesis can be used to make more complex patterns.
```py
1 2 | 3 4    # Matches `1` followed by `2`, or `3` followed by a `4` in the record

# We can wrap the "or" in parenthesis to limit the pattern groups

1 (2 | 3) 4  # Matches `1`, followed by a `2` or `3`, followed by a 4 in the record
```
The **or** operator can be *chained*, so several **or**s can be used at once.
```py
1 | 2 | 3     # Matches `1` or `2` or `3` number in the record

# This simplifies to (1 | (2 | 3))
```

#### Rule Operator and Scope
The second part of a rule, after the **pattern**, is the **rule operator(s)** and accompanying **scope(s)**. There are two different kinds of scopes: **rule scopes**, a list of rules, and **value scopes**, a list of values, both of which are surrounded by square brackets (`[ ... ]`). 

> [!TIP]
> A **value scope** could also be a single value without square brackets. Both of these are value scopes: `[ 1 2 3 ]` and `1`

When a **pattern** successfully matches, the **pattern** will be removed from the **record** and the **rule operator** will determine what happens to the result of the scope.

##### End Pushing Match (`>>`)
The end-pushing match rule operator (`>>`) will add all values within the scope to the end of the record.
```py
begin >> [ 1 2 ]
end >> [ 3 4 ]

# Record Result: [ 1 2 3 4 ]
```
##### Beginning Pushing Match (`<<`)
The beginning-pushing match rule operator (`<<`) will add all values within the scope to the start of the record.
```py
begin << [ 3 4 ]
end << [ 1 2 ]

# Record Result: [ 1 2 3 4 ]
```
##### Removing Match (`!>`)
The removing match rule operator (`!>`) will not add any values from the scope to the record.
```py
begin !> [ 1 2 ]

# Record Result: [ ]
```
##### Replacing Match (`->`)
The replacing match rule operator (`->`) will add the values from the scope to the record at the index of where the pattern was removed. Therefore, the pattern in the record is replaced by the scope. 

```py
begin >> [ 1 2 3 4 ]
2 3 -> [ 5 ] # When a `2` followed by a `3` is matched, replace it with `5`
# Record Result: [ 1 5 4]

# The custom rule can omit the square brackets because it is a single value:

begin >> [ 1 2 3 4 ]
2 3 -> 5 # When a `2` followed by a `3` is matched, replace it with `5`
# Record Result: [ 1 5 4]
```

> [!WARNING]
> This match operator does not work with the `begin` or `end` rules because there are no patterns to replace.

##### Rule Match (`=>`)
The rule match operator (`=>`) will enter a new **rule scope** and match within the scope until no more matches exist.
```py
begin >> [ 1 2 3 ]
# Current Record: [ 1 2 3 ]
end => [
 begin >> [ 4 5 6 ]
    # Current Record: [ 1 2 3 4 5 6 ]
    5 -> "five" # Match a `5` to replace with `five`
    # Current Record: [ 1 2 3 4 "five" 6 ]
 end >> [ 7 8 9 ]
]
# Final Record: [ 1 2 3 4 "five" 6 7 8 9 ]
```
##### Additional Value Scope Matching Information
All of the value scope matching operators (`>>`, `<<`, `!>`, and `=>`) evaluate the scope entirely before the values are added to the record. This way, matches like the beginning-pushing match don't push values in a reverse order:
```py
begin << [ 3 4 ]
end << [ 1 2 ]
# Values pushed as the entire scope at once: [ 1 2 3 4 ]
# Values pushed separately: [ 2 1 3 4 ]
```
See how the `end` rule pushes the `1` to the start of the **record**, then the `2`. This seems complicated and unnecessary because it is. So RuleLang doesn't work this way.

> [!NOTE]
> This can lead to several minor annoyances like the function `empty`, which empties the record when evaluated.
> `begin >> [ 1 2 3 empty() ]` does not empty the record, because `1`, `2`, and `3` are not added to the record until the scope finishes evaluating. Therefore, you can use **rule chaining**: `begin >> [ 1 2 3 ] !> empty()`

##### Rule Chaining
Each **rule scope** can have up to one `begin` and one `end` rule, but there are an unlimited number of custom rules in between. A rule is not just limited to a single **rule operator** and **scope**. You can chain **rule operators** and **scopes** so they evaluate sequentially, however, you can only use a replacing match (`->`) as the start of a chain (the first match operator).
```py
begin >> [ 1 2 3 ] # Current Record: [ 1 2 3 ]
 >> [ 4 5 6 ] # Current Record: [ 1 2 3 4 5 6 ]
 => [
        5 -> "five" # Match a `5` to replace with `five`
        # Current Record: [ 1 2 3 4 "five" 6 ]
 ]
 >> [ 7 8 9 ]
# Final Record: [ 1 2 3 4 "five" 6 7 8 9 ]
```

> [!NOTE]
> The replacing match (`->`) can only be first and once because otherwise, other scopes could push values to the **record** messing up where the replacing replaces values. For example `begin >> [ 1 2 3 4 ] 2 << 0 -> "two"`. Should the result be `[ 0 1 "two` 3 4 ]` or `[ 0 "two" 2 3 4 ]`?

#### In-Scope Not
The in-scope not operator (`!`) can be used within a value scope to *NOT* add the following value to the record.
```py
begin >> [ 1 2 3 !4 !5 ] # [ 1 2 3 ]
```
Although the same result can be found using rule chaining, this simplifies the program and is mostly beneficial for functions.
```py
begin >> [ 1 2 3 !print(4) ] # [ 1 2 3 ] and displays `4` in the console
end >> !print(5) # this is the same as `end !> print(5)`
```
#### Sequence of Rule Matching
When a **rule scope** is entered, if there is a `begin` rule, it will be evaluated first. Then, all custom rules attempt to evaluate until there are no more matches. These custom rules attempt to match first *down* rules, then *across* the record. 

Rule matching follows this sequence:
1. A **pointer** points towards the first value in the record. The **pointer** always points to the value in the record that will be compared to the first **pattern value** in the **pattern**.
2. Rules are descended. Sequentially, each rule's **pattern** will try to match against the record.
3. If a **pattern** matches, the rule's scope evaluates. Then, return to **1.**
4. If no rule matched, slide the **pointer** over to the next record value, going *across*. If there are no more record values, no more matches will occur so the `end` rule will evaluate, then the rule scope will be exited. Otherwise, there was a new record value, so return to **2** to go *down*.

Here are several examples to demonstrate the sequence:

**Single Rule (*across*)**
```py
begin >> [ 2 1 2 2 1 2 ]
1 2 -> "three"
```
Initially, the record and pointer will look like the following:
```
Record  [ 2 1 2 2 1 2 ]
Pointer   ^
```
First, we go *down* the rules, which is easy because we just have one. The pattern `1 2` will attempt to match against the record at the index of the pointer, resulting in no match.
```
Record  [ 2 1 2 2 1 2 ]
Pointer   ^
Pattern   1 2
Result: No Match
```
Because no matches took place going *down*, we go *across*. The pointer will slide over one value in the record, and we'll attempt to make another match going *down* our rules. In this case, there is a match, so `1 2` is replaced by `"three"`.
```
Record  [ 2 1 2 2 1 2 ]
Pointer     ^
Pattern     1 2
Result: Match
New Record: [ 2 "three" 2 1 2 ]
```
A pattern matched, so the **pointer** reverts back to the start of the record.
```
Record  [ 2 "three" 2 1 2 ]
Pointer   ^
```
Now, we continue going *down* and *across* until another pattern is matched.
```
Record  [ 2 "three" 2 1 2 ]
Pointer   ^
Pattern   1 2
Result: No Match

Record  [ 2 "three" 2 1 2 ]
Pointer     ^
Pattern     1 2
Result: No Match

Record  [ 2 "three" 2 1 2 ]
Pointer             ^
Pattern             1 2
Result: No Match

Record  [ 2 "three" 2 1 2 ]
Pointer               ^
Pattern               1 2
Result: Match
New Record: [ 2 "three" 2 "three" ]
```
Because a pattern was matched, the **pointer** goes back to the start of the record and we continue attempting to match. However, the *down* and *across* methods yield no more matches, so the rule scope is exited.
```
Record  [ 2 "three" 2 "three" ]
Pointer   ^
Pattern   1 2
Result: No Match

Record  [ 2 "three" 2 "three" ]
Pointer     ^
Pattern     1 2
Result: No Match

Record  [ 2 "three" 2 "three" ]
Pointer             ^
Pattern             1 2
Result: No Match

Record  [ 2 "three" 2 "three" ]
Pointer               ^
Pattern               1 2
Result: No Match
```

**Multiple Rules (*down then across*)** 
```py
begin >> [ 1 1 2 4 2 1 ]
1 1 -> 2
1 2 -> 3
2 2 -> 4
4 4 -> 8
```
This program has four custom rules, which we will label:
① `1 1 -> 2`
② `1 2 -> 3`
③ `2 2 -> 4`
④`4 4 -> 8`
Initially, the record and pointer will look like the following:
```
Record  [ 1 1 2 4 2 1 ]
Pointer   ^
```
First, we go *down* the rules. ① attempts to match and succeeds, replacing `1 1` with `2`.
```
Record   [ 1 1 2 4 2 1 ]
Pointer    ^
Pattern ① 1 1
Result: Match
New Record: [ 2 2 4 2 1 ]
```
Because a match was found, the **pointer** moves to the beginning of the record, and rules are matched going *down* again. ① and ② both fail to match, but ③ succeeds, replacing `2 2` with `4`.
```
Record   [ 2 2 4 2 1 ]
Pointer    ^
Pattern ① 1 1
Result: No Match

Record   [ 2 2 4 2 1 ]
Pointer    ^
Pattern ② 1 2
Result: No Match

Record   [ 2 2 4 2 1 ]
Pointer    ^
Pattern ③ 2 2
Result: Match
New Record: [ 4 4 2 1 ]
```
A match was found, so we start with the **pointer** at the beginning of the record, going *down* again. ①, ②, and  ③ all fail to match, but ④ succeeds, replacing `4 4` with `8`.
```
Record   [ 4 4 2 1 ]
Pointer    ^
Pattern ① 1 1
Result: No Match

Record   [ 4 4 2 1 ]
Pointer    ^
Pattern ② 1 2
Result: No Match

Record   [ 4 4 2 1 ]
Pointer    ^
Pattern ③ 2 2
Result: No Match

Record   [ 4 4 2 1 ]
Pointer    ^
Pattern ④ 4 4
Result: Match
New Record: [ 8 2 1 ]
```
For the final time, a match took place, so we start by going *down* with the pointer at the beginning of the record. ①, ②,  ③, and ④ all fail to match, so the **pointer** slides over a value in the record. ①, ②,  ③, and ④ all fail to match again, causing the **pointer** to slide an additional time. Finally, ①, ②,  ③, and ④ all fail to match at the end of the record, so matching ceases and the scope is exited
```
Record   [ 8 2 1 ]
Pointer    ^
Patterns ①, ②,  ③, and ④
Result: All Fail

Record   [ 8 2 1 ]
Pointer      ^
Patterns ①, ②,  ③, and ④
Result: All Fail

Record   [ 8 2 1 ]
Pointer        ^
Patterns ①, ②,  ③, and ④
Result: All Fail
```

**Multiple Rule Scopes**
```py
begin >> [ 1 2 Three_Ones ]
1 => [
 num -> "NUMBER"
]
Three_Ones -> [ 1 1 1 ]
```
This program has three custom rules, which we will label:
① `1 => [ ... ]`
② `Three_Ones -> [ 1 1 1 ]`
③ `num -> "NUMBER"`
Initially, the record and pointer will look like the following:
```
Record  [ 1 2 Three_Ones ]
Pointer   ^
```
First, we go *down* the rules, which causes ① to match, removing `1` from the record.
```
Record  [ 1 2 Three_Ones ]
Pointer   ^
Pattern   1
Result: Match
New Record: [ 2 Three_Ones ]
```
Now, a new rule scope is entered with only rule ③. The **pointer** goes to the start of the record, and matching begins. ③ will match with the first item in the record, replacing it with "NUMBER". Then, after the pointer shifts a couple of times, no more matches occur, so the scope is exited.
```
Record  [ 2 Three_Ones ]
Pointer   ^
Pattern   num
Result: Match
New Record: [ "NUMBER" Three_Ones ]

Record  [ "NUMBER" Three_Ones ]
Pointer   ^
Pattern   num
Result: No Match

Record  [ "NUMBER" Three_Ones ]
Pointer            ^
Pattern            num
Result: No Match
```
Because a rule was just matched, the method repeats with the **pointer** at the start in the main rule scope. Neither ① nor ② match going *down*, so the pointer slides, going *across*. ① doesn't match again, but ② does, replacing `Three_Ones` with `1 1 1`.
```
Record  [ "NUMBER" Three_Ones ]
Pointer   ^
Pattern   ①, and ②
Result: Both Fail

Record  [ "NUMBER" Three_Ones ]
Pointer            ^
Pattern            1
Result: No Match

Record  [ "NUMBER" Three_Ones ]
Pointer            ^
Pattern            Three_Ones
Result: Match
New Record: [ "NUMBER" 1 1 1 ]
```
A rule was matched, so we restart going *down*. Both ① and ② fail before the pointer shifts and  ① matches. `1` is removed from the record, and the rule scope is entered.
```
Record  [ "NUMBER" 1 1 1 ]
Pointer   ^
Pattern   ①, and ②
Result: Both Fail

Record  [ "NUMBER" 1 1 1 ]
Pointer            ^
Pattern            1
Result: Match
New Record: [ "NUMBER" 1 1 ]
```
Now rule ③ attempts to match, eventually succeeding twice before the scope is exited.
```
Record  [ "NUMBER" 1 1 ]
Pointer   ^
Pattern   num
Result: No Match

Record  [ "NUMBER" 1 1 ]
Pointer            ^
Pattern            num
Result: Match
New Record: [ "NUMBER" "NUMBER" 1 ]

Record  [ "NUMBER" "NUMBER" 1 ]
Pointer   ^
Pattern   num
Result: No Match

Record  [ "NUMBER" "NUMBER" 1 ]
Pointer            ^
Pattern            num
Result: No Match

Record  [ "NUMBER" "NUMBER" 1 ]
Pointer                     ^
Pattern                     num
Result: Match
New Record: [ "NUMBER" "NUMBER" "NUMBER" ]

Record  [ "NUMBER" "NUMBER" "NUMBER" ]
Pointer   ^
Pattern   num
Result: No Match

Record  [ "NUMBER" "NUMBER" "NUMBER" ]
Pointer            ^
Pattern            num
Result: No Match

Record  [ "NUMBER" "NUMBER" "NUMBER" ]
Pointer                     ^
Pattern                     num
Result: No Match
```
Patterns ① and ② will attempt to match against the record and fail three times with the **pointer** shifting each time. After the third attempt, no matches have taken place and the **pointer** is at the end of the record, so the program ends.

#### Variables
Variables provide a way to bind a matched value to use later in conditions or value scopes. Variables are declared directly following a **pattern value** and assigned to a variable name that follows the criteria:
- Starts with a lowercase alphabetical character
- Contains only alphanumeric and underscore (`_`) characters
This way, there is a distinction between terms (uppercase start) and variables (lowercase start).

The following example binds a number to the variable `my_number`. When the pattern is matched `my_number` will be assigned to the record value it matched with. In this case, `my_number` is set to `1`. Then, the variable is used within the scope.
```py
begin >> [ Type 1 ]
Type num as my_num -> [ my_num "is a number" ]

# Record Result [ 1 "is a number" ]
```
Multiple variables can be declared in the same rule.
```py
begin >> [ Type 1 2 ]
Type num as num_1 num as num_2 -> [ num_1 "and" num_2 "are both numbers" ]

# Record Result [ 1 "and 2 "are both numbers" ]
```
This can be streamlined by using parenthesis around the variable names. 
```py
begin >> [ Type 1 2 ]
Type num num as (num_1 num_2) -> [ num_1 "and" num_2 "are both numbers" ]

# Record Result [ 1 "and 2 "are both numbers" ]
```
A variable cannot be defined in the middle of an **or** expression, and an **or** cannot be used on the same level (group `(...)`) as a variable declaration.
```py
num as x | "one" >> x # Error!
"one" | (num as x) >> x # Error!
"one" | num as x >> x # Fine: ("one" | num) as x
```
#### Conditions
Conditions are an optional addition to **patterns** to make them more terse and concise. Conditions are checked after a  **pattern value** match occurs. If the condition evaluates to `true`, meaning it *has value*, a match occurs, otherwise, the match does not happen.
- Numbers *have value* when they are non-zero
- Strings *have value* when they are not empty
- Booleans *have value* when they are *true*
- Terms always *have value*
- Nils never *have value*
##### Conditional and Logical Operators
Several operators work within conditions.
###### Greater Than (`num > num`)
Greater than compares if the left operand is greater than the right operand and returns `true` if it is, and `false` otherwise.
```py
1 > 2 # false
8 > 1 # true 
1 > 1 # false
```
###### Less Than (`num < num`)
Less than compares if the left operand is less than the right operand and returns `true` if it is, and `false` otherwise.
```py
1 < 2 # true
8 < 1 # false 
1 < 1 # false
```
###### Greater Than Or Equal To (`num >= num`)
Greater than or equal to compares if the left operand is greater than or equal to the right operand and returns `true` if it is, and `false` otherwise.
```py
1 >= 2 # false
8 >= 1 # true 
1 >= 1 # true
```
###### Less Than Or Equal To (`num <= num`)
Less than or equal to compares if the left operand is less than or equal to the right operand and returns `true` if it is, and `false` otherwise.
```py
1 <= 2 # true
8 <= 1 # false 
1 <= 1 # true
```
###### Equal (`num = num`)
Equal compares if the left operand is the same type and value as the right operand and returns `true` if it is, and `false` otherwise.
```py
1 = 1    # true
"1" = 1  # false
2 = 1    # false
```
###### Not Equal (`num != num`)
Not equal compares if the left operand is not the same type or value as the right operand and returns `true` if it's not, and `false` otherwise.
```py
1 != 1    # false
"1" != 1  # true
2 != 1    # true
```
###### Not (`! any`)
Not is a unary operator. If the right operand *has value* return `false`, otherwise return `true`.
```py
!1       # false
!0       # true
!My_Term # false
!nil     # true
```
###### Or (`any | any`)
**Or** is a binary operator. If the left operand *has value*, the left operand is returned, otherwise the right operand is returned. The **or** operator is short-circuiting, meaning the right operator will not be evaluated unless necessary. 
```py
1 | 2   # 1
0 | 1   # 1
5 | 0   # 5
nil | 0 # 0
```
###### And (`any & any`)
**And** is a binary operator. If the left operand *has value*, the right operand is returned, otherwise the left operand is returned. The **and** operator is short-circuiting, meaning the right operator will not be evaluated unless necessary. 
```py
1 | 2   # 2
0 | 1   # 0
5 | 0   # 0
nil | 0 # nil
```
###### Operator Precedence
There are four levels of precedence for expression operators that determine which operations evaluate first:
1. Unary Not (`!`)
2. Conditionals (`>`, `<`, `>=`, `<=`, `=`, and `!=`)
3. Logical And (`&`)
4. Logical Or (`|`)
```
3 > 2 & 5 <= 5 | 7 < 6 & !(4 >= 4) # true
Equivalent expression order:
((3 > 2) & (5 <= 5)) | ((7 < 6) & (!(4 >= 4)))  # true
```
Parenthesis can be used to evaluate subexpressions before others.
```
1 & !3 >= -1            # ERROR: left operand for `>=` is not a number

This can be fixed using parenthesis
(1 & !3) >= -1         # true
```
##### Conditions in Rules
Conditions can also include variables, making the syntax more concise.
```py
1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 -> "Number Between 1 and 10"
# With a condition:
num as x if x >= 1 && x <= 10 ->  "Number Between 1 and 10"
```
The following program uses conditions to sort a record of numbers from least to greatest.
```py
begin >> [ 1 4 1 -8 4 2 7 ]
(num num) as (x y) if x > y -> [ y x ]
```
### Functions
Functions provide more features in RuleLang. They are all pre-made and follow the same naming convention as variables
- Starts with a lowercase alphabetical character
- Contains only alphanumeric and underscore (`_`) characters
Functions take in several parameters and return a result. For example, the `print` function takes a parameter, displays it in the console, and returns `nil`.
```py
# Display all values in the record
begin >> [ 1 2 3 4 ]
any as x !> print(x)
```
Functions can have multiple parameters, like the `add` function, which returns the sum of two numbers. These parameters are separated by whitespace. 
```py
# Sum all the numbers in the record
begin >> [ 1 2 3 4 ]
num num as (x y) -> add(x y)
```
Some functions are **lazy**, meaning the parameters are not evaluated unless necessary. This allows functions to do some interesting logic, like the `when` function that has three parameters, a condition, a *has value* parameter 'scope', and a *has no value* parameter 'scope'. If the condition *has value*, the *has value* parameter will be evaluated, otherwise, the *has no value* parameter will be evaluated. Because the function is lazy, only one of the 'scopes' is ever evaluated when the function evaluates. This function can be read like: **when**(**condition** has value, evaluate **parameter2**, otherwise evaluate **parameter3**).
```py
# Print all values in the record that have value
begin >> [ 1 0 3 nil false true ]
any as x !> when(x print(x) print("No value"))
# Console: 1 "No value" 3 "No value" "No value" true
```
#### Safe and Unsafe
Some functions are designated **unsafe** meaning they cannot be used within rule conditions or replacing match scopes because they manipulate the record or mess up the pattern matching in some way. For example, the `push` function adds a value to the end of the record. If it were used in a condition, it could easily result in an infinite loop
```py
begin >> [ 1 ]
num as x if push(x) | true !> [] 
```


## Function Docs
- `print(message:any) -> nil`: Displays `message` in the console.
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
- `floor(value:num) -> num`: Returns the largest integer less than or equal to `value`.
- `ceil(value:num) -> num`: Returns the smallest integer greater than or equal to `value`.
- `when(condition:any, true_val:any, false_val:any) -> any [LAZY]`: Evaluate and returns `true_val` if `condition` *has value*, otherwise evaluate and returns `false_val`.
- `or(left:any, right:any) -> any [LAZY]`: Evaluates `left`. If it is true, return `left`, otherwise evaluate and return `right`.
- `and(left:any, right:any) -> any [LAZY]`: Evaluates `left`. If it is false, return `left`, otherwise evaluate and return `right`.
- `not(value:any) -> bool`: Returns `true` if `value` is *has value*, otherwise `false`.
- `empty() -> nil [UNSAFE]`: Clears the record.
- `size() -> num`: Returns the size of the record.
- `length(str:str) -> num`: Returns the length of `str`.
- `join(left:str, right:str) -> str`: Returns the concatenation of `left` and `right`.
- `join_with(left:str, right:str, combiner:str) -> str`: Returns `left`, `combiner`, and `right` concatenated together.
- `trim(str:str) -> str`: Returns `str` with leading and trailing whitespace removed.
- `is_str(value:any) -> bool`: Returns `true` if `value` is a string, otherwise `false`.
- `is_num(value:any) -> bool`: Returns `true` if `value` is a number, otherwise `false`.
- `is_term(value:any) -> bool`: Returns `true` if `value` is a term, otherwise `false`.
- `is_bool(value:any) -> bool`: Returns `true` if `value` is a boolean, otherwise `false`.
- `is_nil(value:any) -> bool`: Returns `true` if `value` is nil, otherwise `false`.
- `to_term(str:str) -> term`: Converts `str` to a term if possible, otherwise returns nil.
- `to_str(value:any) -> str`: Converts `value` to a string.
- `to_num(str:str) -> num`: Converts `str` to a number if possible, otherwise returns nil.
- `get(index:num) -> any`: Returns the value at `index` in the record. Indexes start at `1` and the record is also indexed negatively with `-1` as the final index.
- `push(value:any) -> any [unsafe]`: Appends `value` to the end of the record and returns it.
- `push_begin(value:any) -> any [unsafe]`: Prepends `value` to the beginning of the record and returns it.
- `pop() -> any [unsafe]`: Removes and returns the last value in the record. If the record is empty, returns `nil`.
- `pop_begin() -> any [unsafe]`: Removes and returns the first value in the record. If the record is empty, returns `nil`.
- `insert(value:any, index:num) -> any [unsafe]`: Inserts `value` at the given `index` in the record and returns it. If `index` is out of range, throws an error.
- `split_push(str:str, delimiter:str) -> nil [unsafe]`: Splits `str` by `delimiter` and appends the resulting substrings as new values to the record. Returns `nil`.
- `reverse() -> nil [unsafe]`: Reverses the order of values in the record and returns `nil`.




## Future Additions to RuleLang
- More functions
- `input` function
- Modules
- `else` pattern that matches whenever the previous pattern fails to match
```py
begin >> [ 1 2 3 ]
num as x if mod(x 2) = 0 
 !> print("Even")
    else !> print("Odd")
```