import { Error } from "./error.js";
import {
  Node,
  type ValueType,
  ValueScope,
  RuleScope,
  Value,
  Function,
  Variable,
  PatternValueType,
  PatternValueOr,
  PatternValueNot,
  BinaryExpression,
  type Expression,
  type ValueOrFunction,
  type PatternValue,
} from "./node.js";
import { STDLIB, STDLIBFunction } from "./stdlib.js"
export class Runtime {
  private record: RecordVal[];

  public getRecord(): RecordVal[]{
    return this.record
  }

  constructor(ast: Node | null) {
    this.record = [];
    if (ast instanceof RuleScope) {
      this.evaluateRuleScope(ast);
    }
  }

  private evaluate(
    node: Node | null,
    pointer: number = 0,
    variables: VarMap = {}
  ): void {
    if (node === null) return;
    if (node instanceof RuleScope) {
      this.evaluateRuleScope(node);
    } else if (node instanceof ValueScope) {
      this.evaluateValueScope(node, pointer, variables);
    }
  }

  private evaluateRuleScope(ruleScope: RuleScope): void {
    if (ruleScope.begin !== null) {
      for (var scope of ruleScope.begin) {
        if (Error.hasError()) return;
        this.evaluate(scope);
      }
    }

    // Custom Rules
    if (ruleScope.customs !== null) {
      matchingLoop: while (true) {
        acrossLoop: for (
          var pointer = 0;
          pointer <= this.record.length;
          pointer++
        ) {
          downLoop: for (var rule of ruleScope.customs) {
            const as: Array<string | null> = rule.variables;
            const pattern: PatternValue[] = rule.pattern;
            const expression: Expression | null = rule.expression;
            // Check if the pattern matches
            if (as.length > this.record.length - pointer) continue downLoop;
            const patternMatches = this.testPatternValueMatch(pattern, pointer);
            if (!patternMatches) continue downLoop;
            // Pattern matches, so get variables and remove the match from the record
            //const varValues = this.record.splice(pointer, as.length);
            let variables: VarMap = {};
            as.forEach((name: string | null, index: number) => {
              if (name !== null) {
                variables[name] = this.record[pointer + index];
              }
            });
            // Check if the expression matches
            if (expression !== null) {
              const expressionEval = this.evaluateExpression(
                expression,
                variables
              );
              if (expressionEval === null) return;
              if (!hasValue(expressionEval)) continue downLoop;
            }
            // Everythin matched, so run the scope and re-try matching
            // First, remove the matched values from the record
            this.record.splice(pointer, as.length);
            for (var scope of rule.scopes) {
              this.evaluate(scope, pointer, variables);
              if (Error.hasError()) return;
            }
            continue matchingLoop;
          }
        }
        break;
      }
    }

    if (ruleScope.end !== null) {
      for (var scope of ruleScope.end) {
        if (Error.hasError()) return;
        this.evaluate(scope);
      }
    }
  }

  private testPatternValueMatch(patVal: PatternValue, pointer: number) {
    let currentRecordValue = this.record[pointer];
    if (patVal instanceof Value) {
      return (
        patVal.type === currentRecordValue.type &&
        patVal.value === currentRecordValue.value
      );
    } else if (patVal instanceof PatternValueType) {
      switch (patVal.type) {
        case "NUM_TYPE":
          return currentRecordValue.type === "NUM";
        case "STR_TYPE":
          return currentRecordValue.type === "STR";
        case "TERM_TYPE":
          return currentRecordValue.type === "TERM";
        case "BOOL_TYPE":
          return currentRecordValue.type === "BOOL";
        default:
          // ANY_TYPE
          return true;
      }
    } else if (patVal instanceof PatternValueOr) {
      return (
        this.testPatternValueMatch(patVal.left, pointer) |
        this.testPatternValueMatch(patVal.right, pointer)
      );
    } else if (patVal instanceof PatternValueNot) {
      return !this.testPatternValueMatch(patVal.right, pointer);
    } else {
      for (var patternValue of patVal) {
        let test = this.testPatternValueMatch(patternValue, pointer);
        if (!test) return false;
        pointer += 1;
      }
      return true;
    }
  }

  private evaluateExpression(exp: Expression, variables: VarMap): RecordVal|null {
    if(exp instanceof Value || exp instanceof Variable || exp instanceof Function) {
        return evaluateValVarFun(exp, variables, this.record, true);
    } else if(exp instanceof BinaryExpression) {
        let left = this.evaluateExpression(exp.left, variables);
        if(left===null) return null;
        switch(exp.operator) {
            case "GREATER_THAN":
            case "LESS_THAN":
            case "GREATER_THAN_OR_EQUAL_TO":
            case "LESS_THAN_OR_EQUAL_TO":
                if(left.type !== "NUM") return Error.throwErr(exp.token, `Left operand of \`${exp.token.lexeme}\` operator must be a number`)
                let right = this.evaluateExpression(exp.right, variables);
                if(right===null) return null;
                if(right.type !== "NUM") return Error.throwErr(exp.token, `Right operand of \`${exp.token.lexeme}\` operator must be a number`)
                const leftNum = Number(left.value);
                const rightNum = Number(right.value)
                switch(exp.operator) {
                    case "GREATER_THAN":
                        return newRecordVal("BOOL", leftNum > rightNum)
                    case "LESS_THAN":
                        return newRecordVal("BOOL", leftNum < rightNum)
                    case "GREATER_THAN_OR_EQUAL_TO":
                        return newRecordVal("BOOL", leftNum >= rightNum)
                    case "LESS_THAN_OR_EQUAL_TO":
                        return newRecordVal("BOOL", leftNum <= rightNum)
                }
            default:
                if(exp.operator === "OR") {
                    if(hasValue(left)) return left;
                    let right = this.evaluateExpression(exp.right, variables);
                    if(right===null) return null;
                    return right;
                } else if(exp.operator === "AND") {
                    if(!hasValue(left)) return left;
                    let right = this.evaluateExpression(exp.right, variables);
                    if(right===null) return null;
                    return right;
                } else {
                    let right = this.evaluateExpression(exp.right, variables);
                    if(right===null) return null;
                    if(exp.operator === "EQUAL_TO") {
                        return newRecordVal("BOOL", left.type === right.type && left.value === right.value)
                    } else {
                        return newRecordVal("BOOL", left.type !== right.type || left.value !== right.value)
                    }
                }
        }
    } else {
        // Unary Expression
        let right: RecordVal|null = this.evaluateExpression(exp.right, variables);
        if(right === null) return null
        return {type:"BOOL", value:String(!hasValue(right))}
    }
  }

  private evaluateValueScope(
    valueScope: ValueScope,
    pointer: number = 0,
    variables: VarMap = {}
  ): void {
    let toAddToRecord:RecordVal[] = []
    for (var valueVarOrFunction of valueScope.scope) {
      let value: RecordVal|null = evaluateValVarFun(valueVarOrFunction, variables, this.record, valueScope.operator === "REPLACE_MATCH");
      if(value === null) return;
      if (!valueVarOrFunction.push) continue;
      toAddToRecord.push(value);
    }
      if (valueScope.operator === "REPLACE_MATCH") {
        this.record.splice(pointer, 0, ...toAddToRecord);
      } else if (valueScope.operator === "PUSH_END_MATCH") {
        this.record.push(...toAddToRecord);
      } else if (valueScope.operator === "PUSH_BEGIN_MATCH") {
        this.record.unshift(...toAddToRecord);
      }
      // Otherwise, it is a REMOVE_MATCH
    }
}

export type VarMap = { [key: string]: RecordVal };
export interface RecordVal {
  type: ValueType;
  value: string;
}
export function newRecordVal(type:ValueType, value:any) {
    return {type:type, value:String(value)}
}
export function hasValue(value: RecordVal) {
    switch (value.type) {
      case "STR":
        return value.value !== "";
      case "NUM":
        return Number(value.value) !== 0;
      case "BOOL":
        return value.value === "true";
      case "NIL":
        return false;
      case "TERM":
        return true;
    }
}
export function toRecordVal(val: Value): RecordVal {
    return {
      type: val.type,
      value: val.value,
    };
  }
export function evaluateValVarFun(value:ValueOrFunction, variables: VarMap, record:RecordVal[], mustBeSafe:boolean):RecordVal|null {
if(value instanceof Value) {
    return toRecordVal(value);
} else if(value instanceof Variable) {
    return variables[value.name]
} else {
    const parms = value.parms;
    const name = value.name;
    const errorToken = value.token;
    // FUNCTION
    if(typeof STDLIB[name] !== "object") return Error.throwErr(errorToken, `Function \`${name}\` does not exist`)
    const funObj:STDLIBFunction = STDLIB[name];
    if(!funObj.safe && mustBeSafe) return Error.throwErr(errorToken, `Function \`${name}\` is not a safe function and cannot be used in expressions or replaceing value scopes (\`-> [ ... ]\`)`)
    if(funObj.parms.length !== parms.length) return Error.throwErr(errorToken, `Invalid number of parameters, function \`${name}\` must have ${funObj.parms.length} parameter${funObj.parms.length===1?"":"s"}`)
    if(funObj.lazy) {
        // Lazy run
        return funObj.run([], record, variables, mustBeSafe, value.parms, errorToken)
    } else {
        const runParms: RecordVal[] = []
        for (let [index, parm] of parms.entries()) {
            let newParm = evaluateValVarFun(parm, variables, record, mustBeSafe);
            if (newParm === null) return null;
            if (funObj.parms[index] !== "ANY" && funObj.parms[index] !== newParm.type) {
                return Error.throwErr(parm.token, `Parameter ${index + 1} of \`${name}\` function must be a \`${funObj.parms[index].toLowerCase()}\` type`);
            }
            runParms.push(newParm);
        }
        return funObj.run(runParms, record, variables, mustBeSafe, value.parms, errorToken)
        // Unlazy run, test types
    }
}
}
/*
TODO
- WHen add values to record, when run or as list latter eg [ 1 2 3 get(2)] and replace? do you push the pointer over?
*/
