import {run } from "./main.js"
import {Error } from "./error.js"
import { RecordVal } from "./runtime.js";
let testsFailed = 0;
let testsRun = 0;
const reset = "\x1b[0m";
const bright = "\x1b[1m";
const red = "\x1b[31m";
const green = "\x1b[32m";

function test(label:string, source:string, simplifiedResult:Array<number|string|boolean|Term|null>, expectError:boolean) {
    console.log("========================================================================")
    const desiredResult = listToRecord(simplifiedResult)
    testsRun += 1;
    console.log(`${bright}RUNNING TEST: ${reset}${label}`)
    console.log(`${bright}EXPECTING ERROR: ${reset}${expectError}`)
    const result:RecordVal[] = run(source, "Test", true);
    if(expectError) {
        if(!Error.hasError()) {
            console.log(`   ${bright}${red}TEST FAILED: Expected Error${reset}`)
            testsFailed += 1;
            return
        }
        Error.testingRemoveError()
    } else if(Error.hasError()) {
        console.log(`   ${bright}${red}TEST FAILED: Unexpected Error${reset}`)
        Error.testingRemoveError()
        testsFailed += 1;
        return
    } else {
        if(result.length !== desiredResult.length) {
            testsFailed += 1;
                console.log(`   ${bright}${red}TEST FAILED: Record Error${reset}
    The result of the program is not the desired result.
    ${bright}Program record:${reset}
        ${recordToStr(result).split("\n").join("\n        ")}
    ${bright}Desired record:${reset}
        ${recordToStr(desiredResult).split("\n").join("\n        ")}`)
                return;
        }
        for(const [i, val] of result.entries()) {
            if(val.type != desiredResult[i].type || val.value != desiredResult[i].value) {
                testsFailed += 1;
                console.log(`   ${bright}${red}TEST FAILED: Record Error${reset}
    The result of the program is not the desired result.
    ${bright}Program record:${reset}
        ${recordToStr(result).split("\n").join("\n        ")}
    ${bright}Desired record:${reset}
        ${recordToStr(desiredResult).split("\n").join("\n        ")}`)
                return;
            }
        }
    }
    console.log(`   ${bright}${green}TEST PASSED${reset}`)
}
function recordToStr(record:RecordVal[]) {
    const lines:string[] = []
    for(var val of record) {
        lines.push(`(${val.type}) ${bright}${val.value}${reset}`)
    }
    return lines.join("\n")
}
class Term {
    public name:string;
    constructor(name:string) {
        this.name = name
    }
}
function listToRecord(list:Array<number|string|boolean|Term|null>):RecordVal[] {
    return list.map((val:number|string|boolean|Term|null)=>{
        if(val instanceof Term) {
            return {type:"TERM", value:val.name}
        } else if(val === null) {
            return {type:"NIL", value:"nil"}
        } else if(typeof val === "boolean") {
            return {type:"BOOL", value:String(val)}
        } else if(typeof val === "string") {
            return {type:"STR", value:String(val)}
        } else {
            return {type:"NUM", value:String(val)}
        }
    })
}
/* TESTING ERRORS */
/* Lexer */
test("Unexpected token", `1 $%* 8`, [], true)
test("Unexpected token [at end of file]", `1 $%*`, [], true)
test("Unexpected Token [at newline]", `1 $%*\n1`, [], true)
test("Unexpected \`-\` [at end of file]", `1-`, [], true)
test("Unterminated string", `1 "34`, [], true)
/* Parser */
test("Expected \`[\` to start the rule scope", `begin => 7`, [], true)
test("Expected \`]\` to end the rule scope", `begin => [ 7`, [], true)
test("Unexpected token", `begin => [ 8 ] This_Token`, [], true)
test("Variable \`name\` in not defined in the scope's pattern", `begin >> my_var`, [], true)
test("Expected \`]\` to end the value scope", `begin => [ 1`, [], true)
test("Expected scope after match operator \`match_operator\`", `begin >> &`, [], true)
test("Variable \`name\` in not defined in the scope's pattern [with a value scope]", `begin => [ my_var ]`, [], true)
test("Replacing match operator (\`->\`) is invalid for the \`begin/end\` pattern", `begin -> 7`, [], true)
test("Expected match operator after \`begin/end\` pattern", `begin 8`, [], true)
test("Expected \`)\` to end the funtion call", `1 if 4 < myFun(3 4 -> 7`, [], true)
test("Expected value after \`!\` in the value scope", `begin >> !`, [], true)
test("Expected expression after \`if\`", `4 if &`, [], true)
test("Expected rule operator after the pattern", `1 2 []`, [], true)
test("Expected single non-group pattern value after \`!\` in the pattern", `num !(1 2) -> 7`, [], true)
test("Expected pattern value in the pattern group", `1 () >> 7`, [], true)
test("Expected \`)\` to end the pattern group", `1 ( 5 >>`, [], true)
test("Expected pattern value after \`!\` in pattern", `num ! -> 7`, [], true)
test("The \`|\` pattern operator cannot be combined with \`as\` within the same group", `1 as y 2 | 5 -> 6`, [], true)
test("Expected pattern value(s) to the right of \`|\` pattern operator", `1 | => `, [], true)
test("The left side of  \`|\` pattern operator must have the same number of pattern values as right side", `1 2 | 5 => 7`, [], true)
test("Cannot use \`as\` in the middle of the \`|\` condition", `1 | 2 as x`, [], true)
test("Expected \`)\` to end \`as\` group", `1 2 as (x >>`, [], true)
test("Expected variable name or group of variable names after \`as\`", `1 as >>`, [], true)
test("Expected variable name(s) in \`as\` group", `1 2 as () >> 4`, [], true)
test("Variable \`var_name\` is already declared in the pattern", `1 as x 2 as x >> x`, [], true)
test("Too many variables for the number of pattern values", `1 2 as (x y z)`, [], true)
test("Expected value after \`!\` expression operator", `1 as x if ! >> 7`, [], true)
test("Expected expression after \`(\`", `1 if 3 < () >> 7`, [], true)
test("Expected \`)\` to end expression", `1 if 3 < (6 >> 6`, [], true)
test("Expected expression after \`op\` expression operator [left op >= right op]", `1 if 6 > 8 & >> 8`, [], true)
test("Expected expression after \`op\` expression operator [left op < right op]", `1 if 6 & 7 < >> 8`, [], true)
test("Expected expression after \`op\` expression operator [no right op]", `1 if 5 & >>`, [], true)
/* Runtime */
test("Left operand of \`op\` operator must be a number", `begin >> 1 1 if nil > 2 -> 2`, [], true)
test("Right operand of \`op\` operator must be a number", `begin >> 1 1 if 2 > nil -> 2`, [], true)
test("Function \`fun_name\` does not exist", `begin >> my_fun_dne()`, [], true)
test("Function \`fun_name\` is not a safe function and cannot be used in expressions or within replaceing value scopes (eg. \`-> [ ... ]\`) [in expression]", `begin >> 1 1 if push(7) -> 6`, [], true)
test("Function \`fun_name\` is not a safe function and cannot be used in expressions or within replaceing value scopes (eg. \`-> [ ... ]\`) [in replaceing value scope]", `begin >> 1 1 -> push(5)`, [], true)
test("Invalid number of parameters, function \`fun_name\` must have x parameter(s)", `begin >> print(3 4)`, [], true)
test("Parameter x of \`fun_name\` function must be a \`type\` type", `begin >> add(6 nil)`, [], true)

/* TESTING RESULTS */
test(`Pushing match and chaining`, `begin >> [1 2] >> [3 4]`, [1, 2, 3, 4], false)
test(`Beginning pushing match and chaining`, `begin >> [3 4] << [1 2]`, [1, 2, 3, 4], false)
test(`Replacing match`, `begin >> [1 2 3 2 4] 2 -> [ "two" "two" ]`, [1,"two", "two", 3, "two", "two", 4], false)
test(`Replacing match with multiple pattern values`, `begin >> [1 2 3 2 4] 1 2 -> [ "one" "two" ]`, ["one", "two", 3, 2, 4], false)
test(`Value Scope without []`, `begin >> 1`, [1], false)
test(`Variables and function with parameters`, `begin >> [1 2 3 ] num as x num as y -> add(x y)`, [6], false)
test(`Variables with as (...)`, `begin >> [ 1 2 3] num num num as (x y z) -> sub(add(x y) z)`, [0], false)
test(`Nots in value scope`, `begin >> [ !1 5 !2 !add(1 2)]`, [5], false)
test(`Not in non-[] value scope`, `begin >> !add(3 4)`, [], false)
test(`Chaining`, `begin >> 1 << 2 num as x -> to_str(x) !> nil end << 1 >> 4`, [1, "2", "1", 4], false)
test(`Traditional values`, `begin >> [ "str" 1 Term true nil ]`, ["str", 1, new Term("Term"), true, null], false)
test(`End`, `end >> [ 1 ]`, [1], false)
/* Patern Groups and Ors */
test(`Pattern group`, `begin >> [ 1 2 3 1 2] (1 (2)) -> 3`, [3, 3, 3], false)
test(`Pattern group and variable`, `begin >> [ 1 2 3 1 2] (1 (2) as x) -> x`, [2, 3, 2], false)
test(`Or`, `begin >> [ 1 2 3 ] 1 | 2 >> 3`, [3, 3, 3], false)
test(`Or and groups`, `begin >> [ 1 2 3 ] (1|2) 3 -> 5`, [1, 5], false)
test(`Multiple Ors`, `begin >> [1 2 3 4 ] (1|2) (3|4) ->8`, [1, 8, 4], false)
test(`Multiple patter values in Or`, `begin >> [ 1 2 3 4] 1 2 | 3 4 -> 5`, [5, 5], false)
/* Expression Operators */
test(`Less Than, case 1: x < y`, `begin >> [false] false if 1 < 2 -> true`, [true], false)
test(`Less Than, case 2: x > y`, `begin >> [false] false if 2 < 1 -> true`, [false], false)
test(`Less Than, case 3: x = y`, `begin >> [false] false if 1 < 1 -> true`, [false], false)
test(`Greater Than, case 1: x < y`, `begin >> [false] false if 1 > 2 -> true`, [false], false)
test(`Greater Than, case 2: x > y`, `begin >> [false] false if 2 > 1 -> true`, [true], false)
test(`Greater Than, case 3: x = y`, `begin >> [false] false if 1 > 1 -> true`, [false], false)
test(`Less Than Or Equal To, case 1: x < y`, `begin >> [false] false if 1 <= 2 -> true`, [true], false)
test(`Less Than Or Equal To, case 2: x > y`, `begin >> [false] false if 2 <= 1 -> true`, [false], false)
test(`Less Than Or Equal To, case 3: x = y`, `begin >> [false] false if 1 <= 1 -> true`, [true], false)
test(`Greater Than Or Equal To, case 1: x < y`, `begin >> [false] false if 1 >= 2 -> true`, [false], false)
test(`Greater Than Or Equal To, case 2: x > y`, `begin >> [false] false if 2 >= 1 -> true`, [true], false)
test(`Greater Than Or Equal To, case 3: x = y`, `begin >> [false] false if 1 >= 1 -> true`, [true], false)
test(`Equal To, case 1: =`, `begin >> [false] false if 1 = 1 -> true`, [true], false)
test(`Equal To, case 2: type !=`, `begin >> [false] false if 1 = "1" -> true`, [false], false)
test(`Equal To, case 3: value !=`, `begin >> [false] false if 1 = -1 -> true`, [false], false)
test(`Equal To, case 3: value & type !=`, `begin >> [false] false if 1 = "one" -> true`, [false], false)
test(`Not Equal To, case 1: =`, `begin >> [false] false if 1 != 1 -> true`, [false], false)
test(`Not Equal To, case 2: type !=`, `begin >> [false] false if 1 != "1" -> true`, [true], false)
test(`Not Equal To, case 3: value !=`, `begin >> [false] false if 1 != -1 -> true`, [true], false)
test(`Not Equal To, case 4: value & type !=`, `begin >> [false] false if 1 != "one" -> true`, [true], false)
test(`And, case 1: left has value`, `begin >> [false] false if 1 & 0 -> true`, [false], false)
test(`And, case 2: right has value`, `begin >> [false] false if 0 & 1 -> true`, [false], false)
test(`And, case 3: both have value`, `begin >> [false] false if 1 & 1 -> true`, [true], false)
test(`And, case 4: neither have value`, `begin >> [false] false if 0 & 0 -> true`, [false], false)
test(`Or, case 1: left has value`, `begin >> [false] false if 1 | 0 -> true`, [true], false)
test(`Or, case 2: right has value`, `begin >> [false] false if 0 | 1 -> true`, [true], false)
test(`Or, case 3: both have value`, `begin >> [false] false if 1 | 1 -> true`, [true], false)
test(`Or, case 4: neither have value`, `begin >> [false] false if 0 | 0 -> true`, [false], false)
test(`Not, case 1: right has value`, `begin >> [false] false if !1 -> true`, [false], false)
test(`Not, case 2: right does not have value`, `begin >> [false] false if !0 -> true`, [true], false)
/* Order of Operations */
test(`Order of operations wtih ()`, `begin >> [false] false if (3 > 2) & (5 <= 5) | (7 < 6) & !(4 >= 4) -> true`, [true], false)
/* Has Value */
test(`Str has Value`, `begin >> [false] false if "1" -> true`, [true], false)
test(`Str does not have Value`, `begin >> [false] false if "" -> true`, [false], false)
test(`Num has Value`, `begin >> [false] false if 7 -> true`, [true], false)
test(`Num does not have Value`, `begin >> [false] false if 0 -> true`, [false], false)
test(`Bool has Value`, `begin >> [false] false if true -> true`, [true], false)
test(`Bool does not have Value`, `begin >> [false] false if false -> true`, [false], false)
test(`Term has Value`, `begin >> [false] false if Term -> true`, [true], false)
test(`Nil does not have Value`, `begin >> [false] false if nil -> true`, [false], false)
/* Down then Across */
test(`Down then across rule matching`, `begin >> [ 1 1 2 4 2 1 ] 1 1 -> 2 1 2 -> 3 2 2 -> 4 4 4 -> 8`, [ 8, 2, 1 ], false)
test(`Down then across rule matching with nested rule scope`, `begin >> [ 1 2 Three_Ones ] 1 => [ num -> "NUMBER" ] Three_Ones -> [ 1 1 1 ]`, [ "NUMBER", "NUMBER", "NUMBER" ], false)

/* TESTING FUNCTIONS */
test(`type`, `begin >> [type(0) type("this") type(Term) type(true) type(nil)]`, ["num", "str", "term", "bool", "nil"], false)
test(`less`, `begin >> [ less(0 1) less(1 0) less(1 1)]`, [true, false, false], false)
test(`greater`, `begin >> [ greater(0 1) greater(1 0) greater(1 1)]`, [false, true, false], false)
test(`less_or_equal`, `begin >> [ less_or_equal(0 1) less_or_equal(1 0) less_or_equal(1 1)]`, [true, false, true], false)
test(`greater_or_equal`, `begin >> [ greater_or_equal(0 1) greater_or_equal(1 0) greater_or_equal(1 1)]`, [false, true, true], false)
test(`equal`, `begin >> [ equal(1 1) equal(1 0) equal(1 "1") equal(1 Term)]`, [true, false, false, false], false)
test(`not_equal`, `begin >> [ not_equal(1 1) not_equal(1 0) not_equal(1 "1") not_equal(1 Term)]`, [false, true, true, true], false)
test(`add`, `begin >> [ add(1 4) add(-4 8)]`, [5, 4], false)
test(`sub`, `begin >> [ sub(1 4) sub(-4 -8)]`, [-3, 4], false)
test(`mult`, `begin >> [ mult(1 4) mult(-4 8)]`, [4, -32], false)
test(`div`, `begin >> [ div(16 4) div(2 4)]`, [4, 0.5], false)
test(`mod`, `begin >> [ mod(15 4) mod(16 4)]`, [3, 0], false)
test(`floor_div`, `begin >> [ floor_div(15 4) floor_div(16 4)]`, [3, 4], false)
test(`floor`, `begin >> [ floor(0.7) floor(1.0)]`, [0, 1], false)
test(`ceil`, `begin >> [ ceil(0.7) ceil(1.0)]`, [1, 1], false)
test(`when`, `begin >> [ when(1 true flase) when(0 true false)]`, [true, false], false)
test(`or`, `begin >> [ or(0 1) or(1 0) or(1 2) or(0 "")]`, [1, 1,1,""], false)
test(`and`, `begin >> [ and(0 1) and(1 0) and(1 2) and(0 "")]`, [0, 0, 2, 0], false)
test(`not`, `begin >> [ not(1) not(0)]`, [false, true], false)
test(`empty`, `begin >> [ 1 2 3 ] !> empty()`, [], false)
test(`size`, `begin >> [ 1 2 3 ] >> size()`, [1, 2, 3, 3], false)
test(`length`, `begin >> [ length("123") length("") ]`, [3, 0], false)
test(`join`, `begin >> [ join("1" " 2") join("" "1") ]`, ["1 2", "1"], false)
test(`join_with`, `begin >> [ join_with("1" "2" ", ") join_with("" "1" ", ") ]`, ["1, 2", ", 1"], false)
test(`trim`, `begin >> [ trim(" one ") trim("1") ]`, ["one", "1"], false)
test(`is_str`, `begin >> [ is_str("1") is_str(1) ]`, [true, false], false)
test(`is_num`, `begin >> [ is_num(1) is_num("1") ]`, [true, false], false)
test(`is_term`, `begin >> [ is_term(Term) is_term(1) ]`, [true, false], false)
test(`is_bool`, `begin >> [ is_bool(true) is_bool(1) ]`, [true, false], false)
test(`is_nil`, `begin >> [ is_nil(nil) is_nil(1) ]`, [true, false], false)
test(`to_term`, `begin >> [ to_term("") to_term("a") to_term("Afa f") to_term(" My_Term ") ]`, [null, null, null, new Term("My_Term")], false)
test(`to_str`, `begin >> [ to_str(nil) to_str(1.0) to_str(false) to_str(Term)]`, ["nil", "1", "false", "Term"], false)
test(`to_num`, `begin >> [ to_num("") to_num("-") to_num("-.") to_num("-0.8f") to_num("-0.93")]`, [null, null, null, null, -0.93], false)
test(`get`, `begin >> [ 1 2 3 ] >> [ get(1) get(-1) ]`, [1, 2, 3, 1, 3], false)
test(`get [Error: Parameter for \`get\` function must be an integer]`, `begin >> [ get(8.3) ]`, [], true)
test(`get [Error: \`y\` is out of range for \`get\` function, the record has x values`, `begin >> [ get(8) ]`, [], true)
test(`push`, `begin >> [ 1 2 3 ] !> push(4)`, [1, 2, 3, 4], false)
test(`push_begin`, `begin >> [ 1 2 3 ] !> push_begin(0)`, [0, 1, 2, 3], false)
test(`pop_begin`, `begin >> pop_begin() => [ nil -> "this" ] >> [ 1 2 3 ] >> pop_begin()`, [1, 2, 3, "this"], false)
test(`pop`, `begin >> pop() => [ nil -> "this" ] >> [ 1 2 3 ] >> to_str(pop())`, ["this", 1, 2, "3"], false)
test(`insert`, `begin >> [ 1 2 4 ] !> [ insert(0 1) insert(3 -1) ]`, [0, 1, 2, 3, 4], false)
test(`insert [Error: Parameter for \`insert\` function must be an integer]`, `begin >> [ insert(9 8.23) ]`, [], true)
test(`insert [Error: \`y\` is out of range for \`insert\` function, the record has x values`, `begin >> [ insert(8 8) ]`, [], true)
test(`split_push`, `begin >> "0" !> split_push("1, 2, 3, 4" ", ")`, ["0", "1", "2", "3", "4"], false)
test(`reverse`, `begin >> [1 2 3 4] !> reverse()`, [4, 3, 2, 1], false)

if(testsFailed) {
    console.log(`========================================================================\n${red}${bright} ${testsFailed}/${testsRun} OF ALL TESTS FAILD${reset}`)
} else {
    console.log(`========================================================================\n${green}${bright}ALL TESTS PASSED${reset}`)
}