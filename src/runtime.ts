import { ErrorReporter } from "./error.js";
import {
  ExprNode,
  Node,
  PatternNode,
  RuleScopeNode,
  ValueNode,
  ValueOrFunctionNode,
  ValueScopeNode,
  ValueType,
} from "./node.js";
import { Defs } from "./parser.js";
import { RecordTape, RecordVal } from "./record.js";
import { StandardLibrary } from "./stdlib.js";
import { Token } from "./token.js";
import { Library, ModuleFunction } from "./utils/libraryUtils.js";

export interface RunContext {
  record: RecordTape;
  variables: VarMap;
  mustBeSafe: boolean;
  lazyparams: ValueOrFunctionNode[];
  errorToken: Token;
  errorReporter: ErrorReporter;
  nameSpace: Library;
}

export class Runtime {
  private record: RecordTape;
  private errReporter: ErrorReporter;
  private nameSpace: Library;

  public getRecord(): RecordVal[] {
    return this.record.getRecord();
  }

  constructor(
    ast: Node | null,
    imports: Library,
    defs: Defs,
    reporter: ErrorReporter
  ) {
    this.record = new RecordTape();
    this.errReporter = reporter;

    // Add standard library functions to namespace
    this.nameSpace = imports;
    Object.assign(this.nameSpace, StandardLibrary);

    let varMap: VarMap = {};
    // Evaluate defs and add them to the map
    for (let key of Object.keys(defs)) {
      const result = evaluateValVarFun(
        defs[key],
        varMap,
        this.record,
        false,
        this.errReporter,
        this.nameSpace
      );
      // We know defs are unique (from the parser)
      if(result != null) varMap[key] = [result];
    }

    if (ast != null && ast.kind == "RuleScope") {
      this.evaluateRuleScope(ast, varMap);
    }
  }

  private evaluate(
    node: Node | null,
    variables: VarMap,
    pointer: number = 0
  ): void {
    if (node === null) return;
    if (node.kind == "RuleScope") {
      this.evaluateRuleScope(node, variables);
    } else if (node.kind == "ValueScope") {
      this.evaluateValueScope(node, variables, pointer);
    }
  }

  private evaluateRuleScope(ruleScope: RuleScopeNode, variables: VarMap): void {
    // Begin rules
    if (ruleScope.begin !== null) {
      for (let scope of ruleScope.begin) {
        if (this.errReporter.hasError()) return;
        this.evaluate(scope, variables);
      }
    }

    // Custom Rules
    if (ruleScope.customs !== null) {
      matchingLoop: while (true) {
        acrossLoop: for (
          let pointer = 0;
          pointer < this.record.size();
          pointer++
        ) {
          downLoop: for (let rule of ruleScope.customs) {
            const as: Array<string | null> = rule.variables;
            const pattern: PatternNode = rule.pattern;
            const expression: ExprNode | null = rule.expression;
            // Check if the pattern matches
            if (as.length > this.record.size() - pointer) continue downLoop;
            const patternMatches = this.testPatternValueMatch(pattern, pointer);
            if (!patternMatches) continue downLoop;
            // Pattern matches, so get variables and remove the match from the record
            as.forEach((name: string | null, index: number) => {
              if (name !== null) {
                const val = this.record.get(pointer + index) as RecordVal;
                if (variables.hasOwnProperty(name)) {
                  variables[name].push(val);
                } else {
                  variables[name] = [val];
                }
              }
            });
            // Check if the expression matches
            if (expression !== null) {
              const expressionEval = this.evaluateExpression(
                expression,
                variables
              );
              if (expressionEval === null) return; // Error
              if (!hasValue(expressionEval)) {
                // Remove variables from scope
                as.forEach((name: string | null, _: number) => {
                  if (name !== null) {
                    if (variables[name].length == 1) {
                      delete variables[name];
                    } else {
                      variables[name].pop();
                    }
                  }
                });
                continue downLoop;
              }
            }
            // Everything matched, so run the scope and re-try matching
            // First, remove the matched values from the record
            for (let i = 0; i < as.length; i++) {
              this.record.remove(pointer); // since we are removing items, the pointer always points to the removed item
            }

            // Run the scope
            for (var scope of rule.scopes) {
              this.evaluate(scope, variables, pointer);
              if (this.errReporter.hasError()) return;
            }

            // Remove local variables
            as.forEach((name: string | null, _: number) => {
              if (name !== null) {
                if (variables[name].length == 1) {
                  delete variables[name];
                } else {
                  variables[name].pop();
                }
              }
            });

            continue matchingLoop;
          }
        }
        break;
      }
    }

    // End rules
    if (ruleScope.end !== null) {
      for (var scope of ruleScope.end) {
        if (this.errReporter.hasError()) return;
        this.evaluate(scope, variables);
      }
    }
  }

  private testPatternValueMatch(patVal: PatternNode, pointer: number): boolean {
    let currentRecordValue = this.record.get(pointer);
    if (currentRecordValue == null) return false; // This should never run, if it does, pointer is out of sync
    if (patVal.kind == "Value") {
      return (
        patVal.type === currentRecordValue.type &&
        patVal.value === currentRecordValue.value
      );
    } else if (patVal.kind == "PatternType") {
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
    } else if (patVal.kind == "PatternOr") {
      return (
        this.testPatternValueMatch(patVal.left, pointer) ||
        this.testPatternValueMatch(patVal.right, pointer)
      );
    } else if (patVal.kind == "PatternNot") {
      return !this.testPatternValueMatch(patVal.right, pointer);
    } else {
      for (var patternValue of patVal.patterns) {
        let test = this.testPatternValueMatch(patternValue, pointer);
        if (!test) return false;
        pointer += 1;
      }
      return true;
    }
  }

  private evaluateExpression(
    exp: ExprNode,
    variables: VarMap
  ): RecordVal | null {
    if (
      exp.kind == "Value" ||
      exp.kind == "Variable" ||
      exp.kind == "Function"
    ) {
      return evaluateValVarFun(
        exp,
        variables,
        this.record,
        true,
        this.errReporter,
        this.nameSpace
      );
    } else if (exp.kind == "BinaryExpr") {
      let left = this.evaluateExpression(exp.left, variables);
      if (left === null) return null;
      switch (exp.operator) {
        case "GREATER_THAN":
        case "LESS_THAN":
        case "GREATER_THAN_OR_EQUAL_TO":
        case "LESS_THAN_OR_EQUAL_TO":
          if (left.type !== "NUM")
            return this.errReporter.throwErr(
              exp.token,
              `Left operand of \`${exp.token.lexeme}\` operator must be a number`,
              "300001"
            );
          let right = this.evaluateExpression(exp.right, variables);
          if (right === null) return null;
          if (right.type !== "NUM")
            return this.errReporter.throwErr(
              exp.token,
              `Right operand of \`${exp.token.lexeme}\` operator must be a number`,
              "300002"
            );
          const leftNum = Number(left.value);
          const rightNum = Number(right.value);
          switch (exp.operator) {
            case "GREATER_THAN":
              return newRecordVal("BOOL", leftNum > rightNum);
            case "LESS_THAN":
              return newRecordVal("BOOL", leftNum < rightNum);
            case "GREATER_THAN_OR_EQUAL_TO":
              return newRecordVal("BOOL", leftNum >= rightNum);
            case "LESS_THAN_OR_EQUAL_TO":
              return newRecordVal("BOOL", leftNum <= rightNum);
          }
        default:
          if (exp.operator === "OR") {
            if (hasValue(left)) return left;
            let right = this.evaluateExpression(exp.right, variables);
            if (right === null) return null;
            return right;
          } else if (exp.operator === "AND") {
            if (!hasValue(left)) return left;
            let right = this.evaluateExpression(exp.right, variables);
            if (right === null) return null;
            return right;
          } else {
            let right = this.evaluateExpression(exp.right, variables);
            if (right === null) return null;
            if (exp.operator === "EQUAL_TO") {
              return newRecordVal(
                "BOOL",
                left.type === right.type && left.value === right.value
              );
            } else {
              return newRecordVal(
                "BOOL",
                left.type !== right.type || left.value !== right.value
              );
            }
          }
      }
    } else {
      // Unary Expression
      let right: RecordVal | null = this.evaluateExpression(
        exp.right,
        variables
      );
      if (right === null) return null;
      return { type: "BOOL", value: String(!hasValue(right)) };
    }
  }

  private evaluateValueScope(
    valueScope: ValueScopeNode,
    variables: VarMap,
    pointer: number = 0
  ): void {
    let toAddToRecord: RecordVal[] = [];
    for (let valueVarOrFunction of valueScope.scope) {
      let value: RecordVal | null = evaluateValVarFun(
        valueVarOrFunction,
        variables,
        this.record,
        valueScope.operator === "REPLACE_MATCH",
        this.errReporter,
        this.nameSpace
      );
      if (value === null) return;
      if (!valueVarOrFunction.push) continue;
      toAddToRecord.push(value);
    }
    if (valueScope.operator === "REPLACE_MATCH") {
      let addAtPointer = pointer;
      for (let i = 0; i < toAddToRecord.length; i++) {
        this.record.add(addAtPointer++, toAddToRecord[i]);
      }
    } else if (valueScope.operator === "PUSH_END_MATCH") {
      toAddToRecord.forEach((val) => this.record.addLast(val));
    } else if (valueScope.operator === "PUSH_BEGIN_MATCH") {
      for (let i = toAddToRecord.length - 1; i >= 0; i--) {
        this.record.addFirst(toAddToRecord[i]);
      }
    }
    // Otherwise, it is a REMOVE_MATCH
  }
}

export type VarMap = Record<string, RecordVal[]>;

export function newRecordVal(type: ValueType, value: any) {
  return { type: type, value: String(value) };
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
export function toRecordVal(val: ValueNode): RecordVal {
  return {
    type: val.type,
    value: val.value,
  };
}
export function evaluateValVarFun(
  value: ValueOrFunctionNode,
  variables: VarMap,
  record: RecordTape,
  mustBeSafe: boolean,
  errorReporter: ErrorReporter,
  nameSpace: Library
): RecordVal | null {
  if (value.kind == "Value") {
    return toRecordVal(value);
  } else if (value.kind == "Variable") {
    if (!variables.hasOwnProperty(value.name)) {
      return errorReporter.throwErr(
        value.token,
        `Variable \`${value.name}\` is not defined`,
        "300007"
      );
    }
    return variables[value.name][variables[value.name].length - 1];
  } else {
    const params = value.params;
    const name = value.name;
    const errorToken = value.token;
    // FUNCTION
    if (!nameSpace.hasOwnProperty(name))
      return errorReporter.throwErr(
        errorToken,
        `Function \`${name}\` does not exist`,
        "300003"
      );
    const funObj: ModuleFunction = nameSpace[name];
    if (!funObj.safe && mustBeSafe)
      return errorReporter.throwErr(
        errorToken,
        `Function \`${name}\` is not a safe function and cannot be used in expressions or replacing value scopes (\`-> [ ... ]\`)`,
        "300004"
      );
    if (funObj.params.length !== params.length)
      return errorReporter.throwErr(
        errorToken,
        `Invalid number of parameters, function \`${name}\` must have ${funObj.params.length} parameter${funObj.params.length === 1 ? "" : "s"}`,
        "300005"
      );
    let runtimeContext = {
      record,
      variables,
      mustBeSafe,
      lazyparams: value.params,
      errorToken,
      errorReporter,
      nameSpace,
    };
    if (funObj.lazy) {
      // Lazy run
      return funObj.run([], runtimeContext);
    } else {
      const runparams: RecordVal[] = [];
      for (let [index, param] of params.entries()) {
        let newparam = evaluateValVarFun(
          param,
          variables,
          record,
          mustBeSafe,
          errorReporter,
          nameSpace
        );
        if (newparam === null) return null;
        if (
          funObj.params[index] !== "ANY" &&
          funObj.params[index] !== newparam.type
        ) {
          return errorReporter.throwErr(
            param.token,
            `Parameter ${index + 1} of \`${name}\` function must be a \`${funObj.params[index].toLowerCase()}\` type`,
            "300006"
          );
        }
        runparams.push(newparam);
      }
      return funObj.run(runparams, runtimeContext);
    }
  }
}
