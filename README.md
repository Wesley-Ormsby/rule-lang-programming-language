# The RuleLang Programming Language

***RuleLang is an esoteric matching language with bizarre control flow.***

RuleLang subverts traditional paradigms and challenges the programmer to approach problems in a new ways; You need to navigate non-linear control flow and pay close attention to patterns to ensure proper execution and eventual termination. The language is based on the idea of [term rewriting](https://en.wikipedia.org/wiki/Rewriting) programming languages, which take some input and reduce it to the desired output though the application of rules.

Here is a little taste of term rewriting. We begin with four numbers `1 1 1 1`, and we have three different rules that operate on this input. 

```py
begin >> [ 1 1 1 1 ]

1 1 -> [ 2 ]
2 2 -> [ 4 ]
4 !> print("We bundled together some numbers to make a 4!")
```

- The first rule `1 1 -> [ 2 ]` states when we see the pattern `1 1` in the record, replace it with a `2`. 
- The second rule `2 2 -> [ 4 ]` is similar, when we see the pattern `2 2` in the record, replace it with a `4`. 
- The last rule will look for the pattern `4` and when it is found, it will print out a message.

So when the program evaluates, the patterns are matched against the record, and the program ends when no matches are found. 

1. We begin with four ones: `1 1 1 1`
2. The first rule will match, replacing the first two ones with a `2`: `2 1 1` 
3. The rule with match again, replacing the last ones with a `2`: `2 2`
4. Now we have a match for the second rule, so the two twos will be replaced with a `4`:  `4`
5. Finally, the third rule will match and display the message `We bundled together some numbers to make a 4!`

As you see, this is a simple program where rule application order does not matter. We will go into detail about how rules are applied later in these tutorial-ish docs. 

RuleLang is an experimental language, attempting to answer the question *how far can we take a term rewriting programming language?* It is next to useless for scripting or any traditional programming due its unique control flow which brings lethargy. However it provides an analytical challenge for programmers to solve problems in new ways.

For now, here is a FizzBuzz program to exemplify more of RuleLang's syntax:

```py
num as x 
    if x > 100         !> empty() # Stop the loop at 100 iterations
    elif mod(x 15) = 0 >> [ add(x 1) !print("FizzBuzz")]
    elif mod(x 3) = 0  >> [ add(x 1) !print("Fizz")] 
    elif mod(x 5) = 0  >> [ add(x 1) !print("Buzz")] 
    else               >> [ add(x 1) !print(x)] 
```

You can see more examples [here](/example_programs/).

> [!NOTE]
> The code examples are highlighted in Python, so highlighting will not be 100% accurate.

## Getting Started

You can download the command line interpreter from `npm`:
```
npm i rule-lang-programming-language
```

Then run a RuleLang program using the `rule` command followed by the RuleLang file. Note that the interpreter restricts file extensions to `.rul` or `.txt`.

```
rule my_file.rul
```

## RuleLang Basics

RuleLang resolves around the Record, which is simply a list of values. When we find a Pattern in the Record, we will remove the Pattern and execute its corresponding Scope. The Scope can do many things like push values to the back of the record, replace the pattern with new values within the record, or even lead to a new subset of rules to match.

### Comments
```py
# This is a single-line comment
# This is another single-line comment
#[ 
    This is a multi-line comment
    See how it covers multiple lines?
 ]#
```

### Values

There are five different types of values within RuleLang: numbers (`num`), strings (`str`), booleans (`bool`), terms (`term`), and nil (`nil`).

#### Numbers (`num`) 
Numbers are any positive, negative, or fractional number. If it is a decimal number less than 1, it must be prepending with a `0`. Negative numbers are prepended with a `-` and no space between characters.

```py
# Valid
1 
1.2 
0.4
-0.6

# Invalid
.45
- 23
```

#### Strings (`str`)
Strings represent a sequence of characters and are naturally multi-line, but they can be typed on a single line using escape codes.
```py
"Hello, World"
"Multi-
Line
String"
"Multi-\nLine\nString"
# Escape Codes:
#   \" -> "         
#   \\ -> \
#   \n -> new line 
```

#### Booleans (`bool`)
A boolean is either `true` or `false` (not `true`).
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
Although strings can accomplish anything terms can, terms provide cleaner syntax for pattern matching. We could make a rule that duplicates a number in the record:
```py
"Duplicate" num as x -> [ x x ]
```
Then any number prepended by a `"Duplicate"` string will be doubled. But what if we have another rule that interacts with strings? Then the `"Duplicate"` indicator could be altered. Or what if we get some user input that adds `"Duplicate"` to the Record, messing up the program? Instead, we could use a term indicator, since terms are often more constant and not used in logic. 
```py
Duplicate num as x -> [ x x ]
```

#### Nil (`nil`)
This value represents a failed result or no return value from a function. 
```py
nil
```

### Matching
In this section, we will go over the basic control flow and how a RuleLang program works. In subsequent sections, we will expand on these concepts. A RuleLang program is made from a collection of Rules that execute when a match is found in the Record. 

Each rule is composed of 4 basic components.
- The **Pattern** is a sequence that is compared to the record to see if a match has occurred. The pattern will be removed from the record when the Rule matches, before the scopes execute.
- The **Condition** is an optional addition to pattern. If a Rule's pattern matches, and its condition is met, then the Rule matches and some code is executed.
- The **Scopes** are lists of values that will be inserted into the record or more rules to evaluate once a Rule matches.
- The **Rule Operators** are attached to each scopes and determine *how* to evaluate the scope. For example, `->` replaces the pattern values with the scope values and `>>` pushes scope values to the end of the record.

Each **Rule Scope** (a fancy way to say a set of Rules that will be matching) can have two special patterns. A `begin` pattern is automatically matched as soon as the rule scope is entered. It is useful for setting up record data. The `end` rule executes after all other patterns have finished executing and no more matches occur in the record. It is often used to clean up the record or interact with the post-matching results.

After the `begin` rule matches if the scope has one, Rule matching follows a specific sequence that makes up RuleLang's unique control flow. This sequence can be remembered with the mnemonic:

> Down then Across 

Or...

> Down the Rules, then Across the Record

1. First, we start with a **Pointer** that points to the first value of the record. The pointer just mean *"we are going to see if a match starts here."*
2. Now, we go *down the Rules*. Sequentially in the order the Rules are defined, each rule will attempt to match against the record. As soon as a Rule matches, the Rule's scopes are evaluated, then we immediately skip the remainder of the Rules and return to step **1** with the pointer reset to the first position in the record.
3. No rules matched at the current pointer position in the record. So, we go *across the record*, and shift the pointer to the next record value. We return to step **2** trying to find a Rule match from this new pointer position.


When no matches occur in a cycle across the full record (ie. the pointer gets to the end of the record without any matches), the `end` rule will evaluate, then the program terminates.

#### Food Chain

We will demonstrate this control flow through a food chain example. Lets say we have some flies, some frogs, and some snakes. The frogs want to eat the flies, and the snakes want to eat the frogs. Keeping it simple, lets say that all these animals are moving in a line from right to left in the record. This may seem backwards (*wouldn't it make more sense to go left to right?*), but it makes sense due to the order of matching. A `Frog` will eat a `Fly` when the `Fly` is directly in front of it in the record. Similarly a `Snake` will eat a `Frog` when the `Frog` is directly in front of it. Finally, when an animal finds its meal, it will take some time eating, so all the other animals will pass it (*Let's say the snakes are nice so they don't want to eat a frog while it is enjoying a meal*). We can make a simple program that simulates this scenario.

```py
# We populate the record with the animals
# Note that the snake is last in line (the animals are moving leftwards)
begin >> [ Fly Fly Frog Frog Fly Frog Frog Snake ]

# When a Frog catches a Fly, the Fly is removed from the record and the Frog will move to the end of the Record
Fly Frog >> Frog

# When a Snake catches a Frog, the Frog is removed from the record and the Snake will move to the end of the Record
Frog Snake >> Snake

# Add a message to the record when the program ends
end >> "The food chain has ended!"
```

Now we will walk though the flow of the program. Fist, the `begin` rule executes, adding some animals to the record. Next our custom rules are going to start matching. The pointer will be at the first value in the record, and we'll start by going *down the Rules*. 

The `Fly Frog` pattern will try to match first, and fail since it doesn't match `Fly Fly` in the record.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Fly Fly Frog Frog Fly Frog Frog Snake ]
  ^
  Pointer
```

The `Frog Snake` pattern will also fail since it doesn't match `Fly Fly` in the record.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Fly Fly Frog Frog Fly Frog Frog Snake ]
  ^
  Pointer
```

Since we've gone down all the Rules, we will go *across the record*, and shift the pointer one value right. We restart matching from first rule. Now, we have a `Fly Frog` match so the pattern will be removed from the record, then the scope will execute, pushing a `Frog` to the back of the record. The `Frog` has successfully eaten a `Fly`!

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Fly Fly Frog Frog Fly Frog Frog Snake ]
      ^
      Pointer

NEW RECORD: 
[ Fly Frog Fly Frog Frog Snake Frog ]
```

A pattern just matched, so we'll restart the process entirely. The pointer goes back to the beginning of the record and we start matching from the first rule again. Yet again, the `Fly Frog` pattern matches, so the pattern will be removed from the record, then the scope will execute, pushing a `Frog` to the back of the record.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Fly Frog Fly Frog Frog Snake Frog ]
  ^
  Pointer

NEW RECORD: 
[ Fly Frog Frog Snake Frog Frog ]
```

A pattern matched, so we restart again. The pointer goes to the beginning of the record and we start matching from the first rule. The `Fly Frog` pattern matches a third time.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Fly Frog Fly Frog Frog Snake Frog ]
  ^
  Pointer

NEW RECORD: 
[ Frog Snake Frog Frog Frog ]
```

After resetting the pointer and starting from the first Rule, we see that the `Fly Frog` pattern does not match. So we will move *down* onto the next Rule.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Frog Snake Frog Frog Frog ]
  ^
  Pointer
```

The `Frog Snake` Rule matches, so the pattern is removed from the record and `Snake` is pushed to the back of the record.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Frog Snake Frog Frog Frog ]
  ^
  Pointer

NEW RECORD:
[ Frog Frog Frog Snake ]
```

A pattern matches so we reset again and see that the `Fly Frog` doesn't match.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Frog Frog Frog Snake ]
  ^
  Pointer
```

The `Frog Snake` pattern also doesn't match, so we move *across the record*, shifting the pointer one value right.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Frog Frog Frog Snake ]
  ^
  Pointer
```

Beginning again at the top of the Rule set, the `Fly Frog` Rule doesn't match.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Frog Frog Frog Snake ]
       ^
       Pointer
```

Neither does the `Frog Snake` Rule, so we move *across* again.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Frog Frog Frog Snake ]
       ^
       Pointer
```

Going down the Rule set, `Fly Frog` doesn't match.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Frog Frog Frog Snake ]
            ^
            Pointer
```

But the pattern `Frog Snake` does.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Frog Frog Frog Snake ]
            ^
            Pointer

NEW RECORD:
[ Frog Frog Snake ]
```

We reset, and see that the `Fly Frog` pattern doesn't match.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Frog Frog Snake ]
  ^
  Pointer
```

The `Frog Snake` pattern also doesn't match, so we shift the pointer.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Frog Frog Snake ]
  ^
  Pointer
```


The `Fly Frog` pattern doesn't match.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Frog Frog Snake ]
       ^
       Pointer
```

The `Frog Snake` pattern matches.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Frog Frog Snake ]
       ^
       Pointer

NEW RECORD:
[ Frog Snake ]
```

After resetting, the `Fly Frog` pattern doesn't match.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Frog Snake ]
  ^
  Pointer
```

But the `Frog Snake` Rule does.

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Frog Snake ]
  ^
  Pointer

NEW RECORD:
[ Snake ]
```

We reset the pointer for the last time, and try matching down the Rule set. `Fly Frog` doesn't match.

```
RULES:
  > Fly Frog >> Frog
    Frog Snake >> Snake

RECORD:
[ Snake ]
  ^
  Pointer
```

The `Frog Snake` pattern doesn't match. So we try to move across again. Since the pointer is at the end of the record, we completed a cycle without any matches, meaning no more matches are in the record. Thus, we are done matching!

```
RULES:
    Fly Frog >> Frog
  > Frog Snake >> Snake

RECORD:
[ Snake ]
  ^
  Pointer
```

Finally, the `end` rule will execute, pushing the string `"The food chain has ended!"` to the record, then the program terminates. Phew! That was **long**, wasn't it? This *down* than *across* matching is the sequence that all RuleLang programs operate in, so understanding this control flow is crucial.

### Introduction to Variable and Function
Before we dive into each of the components that make up a Rule, we are going to briefly introduce the concept of **variables** and **functions**, which will allow examples to be more dynamic and interesting. Later, we will expand on these concepts.

Variables provide a way to bind matched values to an identifier as they are removed from the record so they can be used later in conditions and scopes. Variables use the `as` keyword. For example, in the food chain program, we can give each of the animals names. We need to keep track of the name in addition to the animal type, so when an animal is eaten, we also need to get rid of the name. Additionally, when an animal finds a meal and returns to the end of the list, the name will be moved as well. We will structure an animal as `<AnimalType: Term> <AnimalName: Str>`. The program will use the `str` pattern value too. This value matches any string making it useful for matching our animal names.

```py
# We populate the record with the animals
begin >> [ Fly "Larry" Fly "Gertrude" Frog "Kermit" Frog "Tiana" Fly "George" Frog "Trevor" Frog "Mildred" Snake "Jörmungandr"]

# When a Frog catches a Fly, the Fly is removed from the record and the Frog will move to the end of the Record
Fly str Frog str as frogName >> [ Frog frogName ]

# When a Snake catches a Frog, the Frog is removed from the record and the Snake will move to the end of the Record
Frog str Snake str as snakeName >> [ Snake snakeName ]

# Add a message to the record when the program ends
end >> "The food chain has ended!"
```

Functions take a certain number of parameters, apply some computation, and return a result. Some of the most useful functions are:
- `print()`: displays parameters in the console. Returns `nil`. This allows us to get output from the record so we can see program results!
- `add(a b)`: Calculates and returns the sum of `a` and `b`.

Now we can alter the food chain program to display a message when an animal is eaten, and when the program ends, we can show who survived. Since `print()` returns `nil`, we can avoid pushing it to the record using the `!` operator. We can avoid adding an entire value scope to the record using the `!>` match operator. This example also makes use of nested rule scopes. When a rule matches with a `=>` match operator, a new rule scope is entered. This new rule scope matches the in the same *down the Rules then across the record* method but only with the rules it contains. Once it stops matching, the scope is exited rules will continue matching on the global scope again.

```py
# We populate the record with the animals
begin >> [ Fly "Larry" Fly "Gertrude" Frog "Kermit" Frog "Tiana" Fly "George" Frog "Trevor" Frog "Mildred" Snake "Jörmungandr"]

# When a Frog catches a Fly, the Fly is removed from the record and the Frog will move to the end of the Record
Fly str as flyName Frog str as frogName >> [ Frog frogName !print(flyName "was eaten by" frogName)]

# When a Snake catches a Frog, the Frog is removed from the record and the Snake will move to the end of the Record
Frog str as frogName Snake str as snakeName >> [ Snake snakeName !print(frogName "was eaten by" snakeName)]

# When the rules end matching, we will enter a new rule scope that matches animals until the record is empty, printing who survived
end => [
  begin !> print("Let's see who survived!")
  term str as animalName !> print(animalName "Survived!")
]
```

When we run the code, we get this output:
```
Gertrude was eaten by Kermit
Larry was eaten by Tiana
George was eaten by Trevor
Mildred was eaten by Jörmungandr
Trevor was eaten by Jörmungandr
Tiana was eaten by Jörmungandr
Kermit was eaten by Jörmungandr
Let's see who survived!
Jörmungandr Survived!
```

Now our programs can actually accomplish something by showing useful information using `print()`.

## Patterns
Think of a pattern as a key to the lock. Only a specific grove sequence will open the lock. Similarly, only a specific pattern will match the record.

The simplest patterns are `begin` and `end`. The `begin` pattern will automatically match when entering the rule scope before the *down then across* matching occurs, and the `end` pattern will match when leaving the rule scope after all other patterns cease to match. All other patterns are custom patterns sandwiched between the optional `begin` and `end` patterns. These custom patterns are evaluate and match according to the *down then across* principle.

### Pattern Values

A pattern is made from a sequence of one or more pattern values. It can be as simple as any traditional value.

```py
false  # Matches a `false` in the record
10     # Matches the number 10 in the record
```

A pattern value can also be a type generalization, matching any value of the given type.
```py
num    # Matches any number in the record, like `5` or `2`
str    # Matches any string in the record, like `"Hello"` or `"World"`
term   # Matches any term in the record, like `Loop` or `If`
bool   # Matches any boolean in the record, like `true` or `false`
```

The `any` pattern value matches all record values. A common design pattern that displays all values in the record and empty it uses the `any` pattern value:
```py
begin >> [ 1 2 3 ]
end => [
  any as x !> print(x)
]

# RESULT: 
# 1
# 2
# 3
```

As you've seen in previous examples, you can make complex patterns by combining patterns value together into a sequence. In our food chain program, we made a pattern that matches a named fly followed by a named frog:
```py
Fly str Frog str
```

### Not Pattern Operator (`!`)

The `!` operator can be prepended to a pattern value to match anything but the following pattern value. Let's say we wanted to filter the record to keep all strings but remove all other values. We can accomplish this using the not (`!`) operator.

```py
begin >> [ true "one" 2 "two" Three "three" ]
!str as removedValue !> print("We just removed" removedValue)

# CONSOLE:
# We just removed true
# We just removed 2
# We just removed Three
```

### Or Pattern Operator (`|`)

The **or** (`|`) operator allows the pattern to match one group of pattern values or another group of pattern values. Each side of the `|` operator must have the same number of pattern values. This simplifies variable assignment and pattern matching.

If we had a list of pets, and we want to remove all the `Cats` and `Dogs`, we could make a small program:

```py
begin >> [ Cat Fish Dog Dog Turtle Cat Bird ]
Cat !> print("Removed a pet")
Dog !> print("Removed a pet")
```

We can combine the Rules into one with an `|` operator:

```py
begin >> [ Cat Fish Dog Dog Turtle Cat Bird ]
Cat | Dog !> print("Removed a pet")
```

If we wanted to remove `Fish` as well, our program is easy to extend:

```py
begin >> [ Cat Fish Dog Dog Turtle Cat Bird ]
Cat | Dog | Fish !> print("Removed a pet")
```

We can use parenthesis to group pattern values for an *or*, so we can include other pattern values outside of the *or*. What if all of the pets were named we wanted to display the names of all `Cat`s, `Dog`s, and `Fish`? 

```py
begin >> [ 
    Cat "Garfield" 
    Fish "Nemo" 
    Dog "Scooby-Doo"
    Dog "Snoopy"
    Turtle "Leonardo"
    Cat "Tom" 
    Bird "Tweety"
  ]
(Cat | Dog | Fish) str as name !> print(name "was removed.")

# RESULT:
# Garfield was removed.
# Nemo was removed.
# Scooby-Doo was removed.
# Snoopy was removed.
# Tom was removed.
```

## Conditions

Conditions are another optional addition to patterns, adding another layer of validation before the Rule successfully matches. They make patterns more specific. Condition's are checked after a pattern matches. If the condition evaluates to a *truthy* value, a match occurs and the Rule's scopes evaluate. Otherwise, the match does not happen.

Truthiness means how values are interpreted as either `true` or `false` in boolean contexts, like in conditions. In RuleLang, truthiness is represented by either *truthy* (acting like `true`) or *falsy* (acting like `false`). Truthiness follows a different rule for each type:
- Numbers are **truthy** when they are non-zero (ie. `0` is the only **falsy** number)
- Strings are **truthy** when they are not empty (ie. `""` is the only **falsy** string)
- Booleans are **truthy** when they are `true` (ie. `false` is the only **falsy** boolean)
- Terms are always **truthy**
- Nils are always **falsy**

### Condition Operators
Conditions allow you to use some operators for terseness. These operators are ONLY allowed to be used in conditions. You can find functions that model these operators if you want to use them elsewhere, like `greater(num num)` must be used instead of `>` in scopes.

#### Greater Than (`num > num`)
Greater than compares if the left operand is greater than the right operand and returns `true` if it is, and `false` otherwise.
```py
1 > 2 # false
8 > 1 # true 
1 > 1 # false
```
#### Less Than (`num < num`)
Less than compares if the left operand is less than the right operand and returns `true` if it is, and `false` otherwise.
```py
1 < 2 # true
8 < 1 # false 
1 < 1 # false
```
#### Greater Than Or Equal To (`num >= num`)
Greater than or equal to compares if the left operand is greater than or equal to the right operand and returns `true` if it is, and `false` otherwise.
```py
1 >= 2 # false
8 >= 1 # true 
1 >= 1 # true
```
#### Less Than Or Equal To (`num <= num`)
Less than or equal to compares if the left operand is less than or equal to the right operand and returns `true` if it is, and `false` otherwise.
```py
1 <= 2 # true
8 <= 1 # false 
1 <= 1 # true
```
#### Equal (`any = any`)
Equal compares if the left operand is the same type **and** value as the right operand and returns `true` if it is, and `false` otherwise.
```py
1 = 1    # true
"1" = 1  # false
2 = 1    # false
```
#### Not Equal (`any != any`)
Not equal compares if the left operand has a different type or different value than the right operand and returns `true` if they are different, and `false` otherwise.
```py
1 != 1    # false
"1" != 1  # true
2 != 1    # true
```
#### Not (`! any`)
Not is a unary operator. If the right operand is *truthy*, it return `false`, otherwise it return `true`.
```py
!true    # false
!false   # true
!1       # false
!0       # true
!My_Term # false
!nil     # true
```
#### Or (`any | any`)
**Or** is a binary operator. If the left operand is *truthy*, the left operand is returned, otherwise the right operand is returned. 
```py
true | true    # true
true | false   # true
false | true   # true
false | false  # false

1 | 2          # 1
0 | 2          # 2
5 | 0          # 5
nil | 0        # 0
```
The **or** operator is short-circuiting, meaning the right operand will not even evaluate if the left operand is *truthy*. 
```py
false | print("This will print")       # `nil` is returned and the print statement runs
true  | print("This will NOT print")   # `true` is returned, so the print will not be evaluated
```

#### And (`any & any`)
**And** is a binary operator. If the left operand is *truthy*, the right operand is returned, otherwise the left operand is returned. 
```py
true & true    # true
true & false   # false
false & true   # false
false & false  # false

1 & 2   # 2
0 & 1   # 0
5 & 0   # 0
nil & 0 # nil
```

The **and** operator is short-circuiting, meaning the right operator will not be evaluated if the left operand is *falsy*. 
```py
false & print("This will NOT print") # `false` is returned, so the print will not be evaluated
true  & print("This will print")     # `nil` is returned and the print statement runs
```

#### Operator Precedence
There are four levels of precedence for condition operators that determine which operations take priority:
1. Unary Not (`!`)
2. Conditionals (`>`, `<`, `>=`, `<=`, `=`, and `!=`)
3. Logical And (`&`)
4. Logical Or (`|`)

Parenthesis can also be used to change the precedence of a condition. The condition within parenthesis is ignored until it needs to be evaluated, then everything within is evaluated before continuing evaluation. Also, remember that `|` and `&` are short-circuiting, meaning the right operand will not be evaluated unless necessary. All of this along with associativity lead to complex evaluation order.

For example, let's tackle this big condition:
```py
3 > 2 & (7 | 5 <= 5) < 9 & !(4 >= 4)
```
The parser will convert this into a tree that will be traversed by inorder fashion:
```py
         &
       /   \
      /     \
     /        \
    <           &
  /   \       /   \
 3     2     <     !
           /  \     \
          |    9     >=
        /   \       /  \
       7     <=    4    4
            /  \
           5    5
```
First, `3 > 2` will evaluate to `true`. Since the left operand of the `&` is *truthy*, the condition will return the right evaluated operand.
```py
3 > 2 & (7 | 5 <= 5) < 9 & !(4 >= 4)
true  & (7 | 5 <= 5) < 9 & !(4 >= 4)
        (7 | 5 <= 5) < 9 & !(4 >= 4)
```
There is another *and* condition, so we prioritize the left operand `(7 | 5 <= 5) < 9`. This expression requires us to evaluate the parenthesis. Since `7` is *truthy*, the *or* condition evaluates to `7` without even looking at the right side of the `|`. 
```py
(7 | 5 <= 5) < 9 & !(4 >= 4)
           7 < 9 & !(4 >= 4)
```
Continuing the evaluation of `(7 | 5 <= 5) < 9`, we get `7 < 9` is `true`. Again, since the left operand of an `&` is *truthy*, the right operand is returned.
```py
7 < 9 & !(4 >= 4)
 true & !(4 >= 4)
        !(4 >= 4)
```
We evaluate the condition in the parenthesis since it is needed for the *not*. The condition `4 >= 4` is `true`. Then `!true` is converted to `false`. Thus, the condition evaluates to `false`.
```py
!(4 >= 4)
!true
false
```

### Conditions in Rules
Conditions leverage variables to make even more specific patterns. We can match integers between `1` and `10` like this:
```py
1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 -> "Integer Between 1 and 10"
```
But this solution is not very extendable. What if we wanted to go up to `100` or `1000`? Instead, a condition can be used.
```py
num as x
  if 1 <= x & x <= 1000 & is_integer(x) -> "Integer Between 1 and 1000"
```

We can use a condition to make a program that sorts a list of numbers.
```py
begin >> [ 1 4 1 -8 4 2 7 ]
num as x num as y 
  if x > y -> [ y x ] # Swap the order of x and y
end => [
  any as x !> print(x)
]

# RESULT:
# -8
# 1
# 1
# 2
# 4
# 4
# 7
```

We can make a FizzBuzz program using conditions. FizzBuzz is a classic demo program. It will loop from `1` to `100` and:
- If the number is divisible by `15`, it will display `FizzBuzz`
- If the number is divisible by `3`, it will display `Fizz`
- If the number is divisible by `5`, it will display `Buzz`
- Otherwise, it will display the number

The output will look like:
```py
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Fizz, 11, Fizz, 13, 14, FizzBuzz, 16, ...
```

First, lets make a loop that repeats from `1` to `100`:

```py
begin >> 1

# Empty the record when the loop counter is greater than 100
num as x 
  if x > 100 !> empty() 

# Match a number, increment it by one and push it back to the record and print the loop counter
num as x >> [ add(x 1) !print(x)] 

# RESULT:
# 1
# 2
# ...
# 100
```

Now we need to add all of the cases. We will use the `mod()` function that returns the remainder of integer division. For example `mod(5 2)` will be `1`. When `mod()` returns `0`, we know that the number is wholly divisible (like `mod(9 3)` is `0`). We also need to be particular when ordering the conditions. When the number is divisible by `15`, we need to display `FizzBuzz`, but the number is also divisible by `3` and `5`. Therefore, the `FizzBuzz` Rule must be defined before the `Fizz` and `Buzz` Rules.

```py
begin >> 1

# Empty the record when the loop counter is greater than 100
num as x 
  if x > 100 !> empty() 

num as x if mod(x 15) = 0 >> [ add(x 1) !print("FizzBuzz")]
num as x if mod(x 3) = 0  >> [ add(x 1) !print("Fizz")] 
num as x if mod(x 5) = 0  >> [ add(x 1) !print("Buzz")] 

# This is the default case, if it doesn't meet any previous condition, it will match this 
num as x >> [ add(x 1) !print(x)] 

# RESULT:
# 1
# 2
# Fizz
# ...
# 98
# Fizz
# Buzz
```

This seems awfully repetitive; The same pattern is repeated 5 times! Luckily we can simplify this with `if`, `elif`, `else` chains.

### Branching

You can add more conditional branches to a pattern, so when the pattern matches, depending on which condition is *truthy*, certain scopes are evaluated. To add another condition, use the `elif` keyword. This means *if the previous condition did not match, try this condition*. Therefore, the scopes of the first *truthy* condition will execute. Then, since a pattern has matched, we reset the *pointer* to the start of the record and start matching *down than across* again (ignoring all other condition in the Rule). 

By using the `else` keyword, you can add a default condition that matches if none of the previous conditions are *truthy*. The `else` branch is optional, and must be the last branch. If we update the FizzBuzz program, we get:

```py
begin >> 1

num as x 
    if x > 100         !> empty() # Stop the loop at 100 iterations
    elif mod(x 15) = 0 >> [ add(x 1) !print("FizzBuzz")]
    elif mod(x 3) = 0  >> [ add(x 1) !print("Fizz")] 
    elif mod(x 5) = 0  >> [ add(x 1) !print("Buzz")] 
    else               >> [ add(x 1) !print(x)] 
```

## Scopes

The last part of a Rule, other than a pattern and optional condition, are the scopes. Scopes are the things that actually *do* stuff when the Rule matches. There are two different kinds of scopes: value scopes and rule scopes. You have seen both of these kinds of scopes in previous examples, but now you will get a deeper understanding.

### Value Scopes
A value scope is a list of values wrapped in square brackets (`[ ... ]`). These values are sequentially evaluated. Then, the resulting list of values are inserted into the record at a point that depends on the Rule operator.

```py
begin >> [ 1 2 3 ]
end >> [ 4 5 ]
```

If a value scope only have one value, it can be written concisely without the square brackets.

```py
begin >> 1 # This is the same as `begin >> [1]`
end !> print("1 was added to the record.")
```

### Rule Scopes
A rule scope is a collection of rules wrapped in square brackets (`[ ... ]`). The RuleLang program itself is a rule scope too! Rule scopes can start with an optional `begin` pattern, and finish with an optional `end` pattern. The patterns sandwiched between are custom rules that follow the *down than across* matching algorithm. 

When a rule scope is entered, we ignore everything about the previous rule scope since the the old rule scope (which we call the *parent*) will pause matching until the new rule scope (the *child*) terminates. We've already seen how rule scopes can be used to display all the results in the record, like in this number sorting program.

```py
begin >> [ 1 4 1 -8 4 2 7 ]

num as x num as y 
  if x > y -> [ y x ] # Swap the order of x and y

# Display all the record results
end => [
  any as x !> print(x)
]

# RESULT:
# -8
# 1
# 1
# 2
# 4
# 4
# 7
```

To exemplify more rule scope matching, let's modify the food chain example. Instead of the animal getting tiered after eating it's prey, it gets ravenous and continues trying to eat more! We will do this by keeping the predator in place, instead of moving the predator to the end of the record. We will also make the assumption that our snakes are nocturnal (they can be [Dragon Snakes](https://en.wikipedia.org/wiki/Xenodermus), since they love eating frogs). The program will start in the daytime where the frogs go hunting. Then, once the frogs finish eating, it will switch to nighttime for the snakes to start hunting.

```py
# We populate the record with the animals
begin >> [ 
  Daytime            # This will allow us to enter the daytime rule scope
  Fly "Cornelius"    # We added a couple new animal that weren't in previous examples
  Snake "Kaa"
  Fly "Larry" 
  Fly "Gertrude" 
  Frog "Kermit" 
  Frog "Tiana" 
  Fly "George" 
  Frog "Trevor" 
  Frog "Mildred" 
  Snake "Jörmungandr"
]

Daytime => [
  begin !> print("The day has started!")

  # When a Frog catches a Fly, the Fly is removed from the record and the frog remains in place
  Fly str as flyName Frog str as frogName -> [ Frog frogName !print(flyName "was eaten by" frogName)]

  end << Nighttime
]

Nighttime => [
  begin !> print("The night has started!")

  # When a Snake catches a Frog, the Frog is removed from the record and the Snake remains in place
  Frog str as frogName Snake str as snakeName -> [ Snake snakeName !print(frogName "was eaten by" snakeName)]

  end !> print("Let's see who survived!")
]

# When the night rules end matching, we will display who survived
term str as animalName !> print(animalName "Survived!")
```

The results will be:

```
The day has started!
Gertrude was eaten by Kermit
Larry was eaten by Kermit
George was eaten by Trevor
The night has started!
Mildred was eaten by Jörmungandr
Trevor was eaten by Jörmungandr
Tiana was eaten by Jörmungandr
Kermit was eaten by Jörmungandr
Let's see who survived!
Cornelius Survived!
Kaa Survived!
Jörmungandr Survived!
```

### Rule Operators
For the most part, you have probably taken for granted where the vales from a value scope are inserted back into the record. This insertion depends on the rule operator used.

#### Back-Pushing Match (`>>`)
The back-pushing match rule operator (`>>`) will add all values within the scope to the end of the record.
```py
begin >> [ 1 2 ]
end >> [ 3 4 ]

# Record Result: [ 1 2 3 4 ]
```
#### Font-Pushing Match (`<<`)
The front-pushing match rule operator (`<<`) will add all values within the scope to the start of the record.
```py
begin << [ 3 4 ]
end << [ 1 2 ]

# Record Result: [ 1 2 3 4 ]
```
#### Removing Match (`!>`)
The removing match rule operator (`!>`) will not add any values from the scope to the record. This can be useful for functions like `print()`, which return `nil` and we don't want to add `nil` to the record.
```py
begin >> print("Too bad! `nil` is added to the record here. ")
# Record Result: [ nil ]
```
```py
begin !> print("Cool. `nil` won't be added to the record.")
# Record Result: [ ]
```
#### Replacing Match (`->`)
The replacing match rule operator (`->`) will insert the values from the scope to the position where the pattern was removed within the record.

This program merges adjacent numbers if they are equal.

```py
begin >> [ 16 4 1 1 2 8 ]

num as x num as y
  if x = y -> add(x y)

end => [
  num as x !> print(x)
]

# RESULT:
# 32
```

With replacing, evaluation in the record will look something like:
```py
[ 16 4 1 1 2 8 ]
[ 16 4 2 2 8 ]
[ 16 4 4 8 ]
[ 16 8 8 ]
[ 16 16 ]
[ 32 ]
```

> [!WARNING]
> This match operator does not work with the `begin` or `end` rules because there are no patterns to replace.

#### Rule Match (`=>`)
The rule match operator (`=>`) will enter a new rule scope and match within that scope until no more matches occur. The previous day/night food chain exemplifies its use. There is also the traditional pattern to display all the items in the record after a program ends.
```py
end => [
  num as x !> print(x)
]
```

### Rule Chaining
When a pattern matches, multiple scopes can be executed sequentially though rule chaining. 

For our nocturnal food chain, we don't even need the `Daytime` and `Nighttime` terms to signify order (although they do make the code cleaner).

```py
# We populate the record with the animals
begin >> [ 
    Fly "Cornelius"
    Snake "Kaa"
    Fly "Larry" 
    Fly "Gertrude" 
    Frog "Kermit" 
    Frog "Tiana" 
    Fly "George" 
    Frog "Trevor" 
    Frog "Mildred" 
    Snake "Jörmungandr"
  ]
  !> print("The day has started!")
  => [
    # When a Frog catches a Fly, the Fly is removed from the record and the frog remains in place
    Fly str as flyName Frog str as frogName -> [ Frog frogName !print(flyName "was eaten by" frogName)]
  ]
  !> print("The night has started!")
  => [
    # When a Snake catches a Frog, the Frog is removed from the record and the Snake remains in place
    Frog str as frogName Snake str as snakeName -> [ Snake snakeName !print(frogName "was eaten by" snakeName)]
  ]
  !> print("Let's see who survived!")

# When the night rules end matching, we will display who survived
term str as animalName !> print(animalName "Survived!")
```

When making a rule chain, a replacing match (`->`) can only be used as the first scope in a chain. This restriction is in place because replacing introduces some ambiguity if the record is modified before the replacement occurs. The rule execution procedure follows three steps:

1. First, the pattern is removed from the record.
2. Then, the scope executes.
3. Finally, the values are scope values are inserted back into the record.

Let us assume to the contrary that we can use `->` in the middle of a chain:

```py
begin >> [ 1 2 3 ]

2 !> empty()      # Empties the record
  >> [ "a" "c" ]
  -> "b"
```

When the pattern matches, the *pointer* (where the pattern would be inserted) is between the `1` and `3`. However, the record gets emptied, then we add a couple more values to the record. So where should be *replace* the `"b"` into? There are several ways it could be handled. The pointer could shift right when a value is added before it, keeping relative positioning. But what happens when the array is emptied? When we add a value to the empty array, should the pointer shift over or should it remain at the front? Instead, the simple solution is to not allow the usage since it is not intuitive and prone to nightmarish debugging unless the case is extremely well documented and known.

Some functions interact with the record, so rule chaining can be used to split up dependent execution. For example, `empty()` removes all values from the record. This program may have unexpected behaviour. But it makes sense since the values within a value scope are inserted into the record after the entire scope is executed.
```py
begin >> [ 1 2 3 Empty ]
Empty >> [ 3 2 1 !empty() ]

# Record: [ 3 2 1 ]
```

To remove all values within the record, we can use chaining:

```py
begin >> [ 1 2 3 Empty ]
Empty >> [ 3 2 1 ] !> empty()
```

Although this example is rather useless, it illustrates the some of the dangers of functions that interact with the stack.

### In-Scope Not (`!`)

The in-scope not operator allows functions to evaluate without inserting their result in the record. For example, `print()` returns `nil`; so if we do not want to add `nil` to the record, we can prepend the function with `!`.

```py
begin >> [ 1 print("Hello, World!") 2 ]
# Record: [ 1 nil 2 ]
```

```py
begin >> [ 1 !print("Hello, World!") 2 ]
# Record: [ 1 2 ]
```
### Scope Modifiers

Scope modifiers are used to isolate the record and enter a new child record that cannot modify the parent. There are two different modifiers:

- `new`: opens a new empty record to start matching on
- `clone`: copies all values within the record into a new record to start matching on

These modifiers work on any kind of rule operator, but the scope must be a rule scope instead of a value scope. Once this child rule scope is exited, the record results will be inserted into the parent according to the rule operator used. For example, `>> new` will push the child record's results to the back of the parent record.

We can make a program the sums the numbers in the record, but keeps them there for later operations by using an indicator term:

```py
begin >> [ 0 Sum 1 4 3 2 5 3 4 ]
num as cumulativeSum Sum num as x -> [ x add(cumulativeSum x) Sum]
Sum !> nil

end => [
  any as x !> print(x)
]

# RESULT:
# 1
# 4
# 3
# 2
# 5
# 3
# 4
# 22   (this is the sum)
```

However, this is awfully slow due to the RuleLang matching algorithm. As the `Sum` term keeps shifting over, it will take longer and longer to reach the next match, resulting in `O(n²)` time. This can be simplified and made more efficiently in `O(n)` by cloning the record to calculate the sum. Without the shifting, all the pattern matching for calculating the sum will occur at the front of the record, removing the need to traverse *across* the record while matching.

```py
begin >> [ 1 4 3 2 5 3 4 ]
      # Clone the record and reduce it to its sum
      >> clone [
        num as x num as y -> add(x y)
      ]

end => [
  any as x !> print(x)
]

# RESULT:
# 1
# 4
# 3
# 2
# 5
# 3
# 4
# 22   (this is the sum)
```

See how the back-pushing match can be attached to a rule scope now? This works because the **child** scope's result (the sum of the record) will be the values inserted back into the parent. This example also demonstrates how isolating the record is a powerful tool, allowing subprocesses (the summation) to not interfere with the main record.

## Variables

Variables provide a way to bind a matched value to use later in conditions or value scopes. Variables are declared directly following a **pattern value** and assigned to a variable name that follows the criteria:
- Starts with a lowercase alphabetical character
- Contains only alphanumeric and underscore (`_`) characters

This way, there is a distinction between terms (uppercase start) and variables (lowercase start).

You are probably already familiar with defining variables using the `as` keyword.

```py
begin >> [ "Hello, World!" ]
str as myStr !> print(myStr)

# RESULT:
# Hello, World!
```

Multiple variables can be declared in the same rule.
```py
# Let's sort the record!
begin >> [ 1 5 6 4 3 5 ]
num as x num as y
  if x > y -> [ y x ]

# Record Result [ 1 3 4 5 5 6 ]
```
You can define multiple variables at the same time by wrapping variables names in parenthesis. This means we expect the previous two pattern values to map to the variables. The last program is equivalent to this: 
```py
# Let's sort the record!
begin >> [ 1 5 6 4 3 5 ]
num num as (x y)
  if x > y -> [ y x ]

# Record Result [ 1 3 4 5 5 6 ]
```
A variable cannot be defined in the middle of an **or** pattern, and an **or** cannot be used on the same level as a variable declaration.
```py
num as x | str >> x      # Error! If the `str` branch matches, what would the `x` variable be?
str | (num as x) >> x    # Error! If the `str` branch matches, what would the `x` variable be?
(str | num) as x >> x    # Fine
```

Variables can also map to a pattern group. 
```py
(str num | num str) as (x y)

((str num | num str) num) as (x y z)
```

Variables are available in children scope (but never as pattern values!). They can also be *shadowed*. A variable in the parent scope with a same name as a variable defined in the child will be *hidden* by the child.

```py
begin >> [1 2]

num as x num as y => [
   begin >> ["One" "Two"]
         !> print("x =" x "\ny =" y)
   str as x str as z => [
        begin !> print("Inner Scope:\nx =" x "\ny =" y "\nz =" z)
   ] # Exit inner scope, so x=3 and z=4 are no longer available
   end !> print("Back to the Outer Scope:\nx =" x "\ny =" y)
]

# RESULT:
# x = 1 
# y = 2
# Inner Scope:
# x = One 
# y = 2 
# z = Two
# Back to the Outer Scope:
# x = 1 
# y = 2
```

### Global Variables
Global variables can be defined at the top of a file (below imports). These variables are available in any condition or scope. They follow the same naming conventions as normal variables.

- It must start with a lowercase alphabetical character
- It must contain only alphanumeric and underscore (`_`) characters

Global variables are defined using the `def` keyword and assignment operator `:=` (which contains a colon to differentiate it from the conditional equals operator `=`).

```py
def pi := 3.14
def radius := 3

begin >> [ radius radius pi ]
num as x num as y -> mult(x y)
num as area !> print("The area of the circle is around" area)

# RESULT: 28.26
```

Global variables can often simplify getting input at the start of the program. To demonstrate, we will make a palindrome checker. A **palindrome** is a word that reads the same forwards as backwards, like "racecar". 

```py
import string # Allows us to use some string functions

# Get the word input
begin 
    >> [ CheckPalindrome input("Enter a word: ") ]

# Now we will reverse the string
CheckPalindrome str as word
    # Split the word by each character, pushing each character to the record
    !> str_split(str_lowercase(word) "")
    # Reverse the record, which contains the characters of the word
    !> reverse()
    # Combine these reversed characters back together into the reversed word
    => [
        str str as (part1 part2) -> join(part1 part2)
    ]
    # Push the original word to the record, so the reversed word and the original word are both on the record
    >> word

# Check if it is a palindrome, where the word is equal to the reversed word
str str as (reversed word) 
    if reversed = str_lowercase(word) 
        !> printf(word "is a palindrome!")
    else 
        !> printf(word "is not a palindrome!")
```

Using a global variable to get input, we can simplify the program.

```py
import string

def word := input("Enter a word: ")

begin 
    !> str_split(str_lowercase(word) "")
    !> reverse()
    => [
        str str as (part1 part2) -> join(part1 part2)
    ]
    
str as reversed 
    if reversed = str_lowercase(word) 
        !> printf("% is a palindrome!" word)
    else 
        !> printf("% is not a palindrome!" word)
```

## Functions

Functions give RuleLang more interactivity and computational power. Functions follow some naming conventions:
- They start with a lowercase alphabetical character
- They contain only alphanumeric and underscore (`_`) characters

Functions take in some amount of parameters, does some computation, and return a result. For example, the `print` function takes one or more parameters, displays them in the console, and returns `nil`.
```py
# Display all values in the record
begin >> [ 1 2 3 4 ]
any as x !> print(x)
```
Functions parameters are separated by whitespace. 
```py
# Sum all the numbers in the record
begin >> [ 1 2 3 4 ]
num num as (x y) -> add(x y)
```
Some functions take a variable number of parameters. These are called **variadic** functions. For example, the `join()` function takes two or more strings, combines them together, and returns the joined string. 

```py
# These are both valid calls for `join()` and result in "Hello, World!"
join("Hello, " "World!")
join("H" "e" "l" "l" "o" "," " " "W" "o" "r" "l" "d" "!")
```

For a full reference of functions, visit the [Function Reference](extended_docs/function_reference.md).

### Laziness
Some functions are **lazy**, meaning the parameters are not evaluated unless necessary. This allows functions to do some dynamic logic, like the `when()` function that has three parameters, a condition and two 'branches'. If the condition is *truthy*, the second parameter will be evaluated, otherwise, the third parameter will be evaluated. Because the function is lazy, only one of the 'branch' parameters is ever evaluated. This function can be read like: **when**(**condition** has value, evaluate **parameter2**, otherwise evaluate **parameter3**). It will then return the result of the executed parameter.

```py
# Print all values in the record that are truthy
begin >> [ 1 2 3 4 5 ]
any as x !> when(
              greater(x 3) 
              print(x "is greater than 3") 
              print(x "is not greater than 3")
            )
# RESULT:
# 1 is not greater than 3
# 2 is not greater than 3
# 3 is not greater than 3
# 4 is greater than 3
# 5 is greater than 3
```

### Unsafe Functions
Some functions are designated **unsafe** meaning they cannot be used within rule conditions or replacing match scopes because they manipulate the record in some way. For example, the `push` function adds a value to the end of the record. If it were used in a condition, it could easily result in an infinite loop.

```py
begin >> [ 1 ]
num as x if push(x) | true !> [] 
```

We have [already discussed](#rule-chaining) how manipulating the record before a replacing match scope would cause issues. Manipulating the record within the replacing match scope would case a similar issue, which is why designating functions as unsafe is necessary.

```py
begin >> [ 1 2 3 ]
2 -> [ !push(1) 1 ] # Error! Where exactly should we insert 1 into the record?
```

### Libraries
RuleLand has several built-in libraries that extend functionality. Unlike standard library functions (like `print()`), you need to `import` these functions before you use them. You can import the full library and all functions within, or you can specify which functions to import. Regardless, imports must be at the top of the file.

```py
import string                             # Imports all functions from the string library
import [ math_floor math_ceil ] from math # Imports only the math_floor and math_ceil functions from the math library

begin >> [ math_floor(3.4) math_ceil(3.4) str_uppercase("Hello, World!") ]
any as x !> print(x) 

# RESULTS
# 3
# 4
# "HELLO, WORLD!"
```

For a full reference of libraries, visit the [Function Reference](extended_docs/function_reference.md).

### String Formatting
Some functions have string formatting where additional arguments are formatted and written into placeholders within the string. Placeholders have the form `%[flags][width][.precision][!]` where all components in square brackets are optional.

An explanation of each of the components:

- `flags`: A sequence of the following characters
   - `>`: Makes the output right-justified by adding any padding spaces to the left instead of to the right
   - `^`: Makes the output center-justified where padding is evenly distributed on either side (an extra space defaults to the left)
   - `+`: Causes positive numbers to be prefixed with `+`
   - `_`: Prefixes a space to positive numbers (so digits can be lined up with the digits of negative numbers)
   - `,`: Groups digits (like by thousands, based on user's locale)
- `width`: A whole number specifying the minimum number of characters that the output should occupy. If necessary, extra spaces will default to the right of the content (unless the `>` flag is used)
- `.precision`: A `.` followed by a whole number which indicates how many decimal digits to show in the formatted data
- `!`: Optional delimiter 

The `format()` function takes a format string and any number parameters, inserts the arguments into the placeholders, and returns the result.
```py
def pi := 3.14159265359
def mil := 1000000

def s1 := format("PI: %" pi) # becomes "PI: 3.14159265359"
def s2 := format("PI: %.2" pi) # becomes "PI: 3.14"
def s3 := format("PI: %_.3" pi) # becomes "PI:  3.141"
def s4 := format("Million: %," mil) # becomes "Million: 1,000,000"
def s5 := format("PI: %.2 | Million: %" pi mil) # becomes "PI: 3.14 | Million: 1000000"

def widthStr := format("| %5 |\n| %^5 |\n| %>5 |" 1 2 3) 
# becomes: 
# | 1     |
# |   2   |
# |     3 |
```

A delimiter is used to write placeholder characters without including them in the placeholder:
```py
# See how this avoids including the `,` in the first placeholder and `!` in the next?
def s := format("%!, %!!" "Hello" "World") # becomes "Hello, World!"
```

To display a `%` character, you can use the code `%%`.
```py
def s := format("%!%%" 56) # becomes "56%"
```

## Conclusion
