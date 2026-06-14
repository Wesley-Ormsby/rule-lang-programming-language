import { ErrorReporter } from "./error.js";
import {
  ExpressionBranch,
  ExprNode,
  Node,
  PatternNode,
  RuleScopeNode,
  ScopeNode,
  ValueNode,
  ValueOrFunctionNode,
  ValueScopeNode,
  ValueType,
} from "./node.js";
import { Defs } from "./parser.js";
import { RecordTape, RecordVal } from "./record.js";
import { StandardLibrary } from "./stdlib.js";
import { Token, TT } from "./token.js";
import { Library, ModuleFunction } from "./utils/libraryUtils.js";

export interface RunContext {
  record: RecordTape;
  variables: VarMap;
  mustBeSafe: boolean;
  lazyparams: ValueOrFunctionNode[];
  errorToken: Token;
  errorReporter: ErrorReporter;
  nameSpace: Library;
  baseDirectory: string;
}

export class Runtime {
  private record: RecordTape;
  private errReporter: ErrorReporter;
  private nameSpace: Library;
  private defs: Defs;
  private ast: Node | null;
  private baseDirectory: string;

  public getRecord(): RecordVal[] {
    return this.record.getRecord();
  }

  constructor(
    ast: Node | null,
    imports: Library,
    defs: Defs,
    reporter: ErrorReporter,
    baseDirectory: string,
  ) {
    this.errReporter = reporter;

    // Add standard library functions to namespace
    this.nameSpace = imports;
    Object.assign(this.nameSpace, StandardLibrary);

    this.defs = defs;
    this.ast = ast;
    this.baseDirectory = baseDirectory;
    this.record = new RecordTape();
  }

  public async init() {
    const record = new RecordTape();
    let varMap: VarMap = {};
    // Evaluate defs and add them to the map
    for (let key of Object.keys(this.defs)) {
      const result = await evaluateValVarFun(
        this.defs[key],
        varMap,
        record,
        false,
        this.errReporter,
        this.nameSpace,
        this.baseDirectory,
      );
      // We know defs are unique (from the parser)
      if (result != null) varMap[key] = [result];
    }

    if (this.ast != null && this.ast.kind == "RuleScope") {
      await this.evaluateRuleScope(this.ast, varMap, record);
    }
    this.record = record;
  }

  private async evaluate(
    node: Node | null,
    variables: VarMap,
    record: RecordTape,
    pointer: number = 0,
  ): Promise<void> {
    if (node === null) return;
    if (node.kind == "RuleScope") {
      await this.evaluateRuleScope(node, variables, record, pointer);
    } else if (node.kind == "ValueScope") {
      await this.evaluateValueScope(node, variables, record, pointer);
    }
  }

  private async evaluateRuleScope(
    ruleScope: RuleScopeNode,
    variables: VarMap,
    parentRecord: RecordTape,
    parentPointer: number = 0,
  ): Promise<void> {
    // Get the record the the scope will operate on
    let record = parentRecord;
    if (ruleScope.modifier) {
      if (ruleScope.modifier === "NEW") {
        record = new RecordTape();
      } else {
        record = RecordTape.clone(parentRecord);
      }
    }

    // Begin rules
    if (ruleScope.begin !== null) {
      for (let scope of ruleScope.begin) {
        if (this.errReporter.hasError()) return;
        await this.evaluate(scope, variables, record);
      }
    }

    // Custom Rules
    if (ruleScope.customs !== null) {
      matchingLoop: while (true) {
        acrossLoop: for (let pointer = 0; pointer < record.size(); pointer++) {
          downLoop: for (let rule of ruleScope.customs) {
            const as: Array<string | null> = rule.variables;
            const pattern: PatternNode = rule.pattern;

            // Check if the pattern matches
            if (as.length > record.size() - pointer) continue downLoop;
            const patternMatches = await this.testPatternValueMatch(
              pattern,
              pointer,
              record,
            );
            if (!patternMatches) continue downLoop;
            // Pattern matches, so get variables and remove the match from the record
            as.forEach((name: string | null, index: number) => {
              if (name !== null) {
                const val = record.get(pointer + index) as RecordVal;
                if (variables.hasOwnProperty(name)) {
                  variables[name].push(val);
                } else {
                  variables[name] = [val];
                }
              }
            });
            // Check each branch for an expression match
            let matchedScopes: ScopeNode[] | null = null;
            for (const branch of rule.branches) {
              if (branch.condition === null) {
                matchedScopes = branch.scopes;
                break; // No condition, so it matches
              }
              const expressionEval = await this.evaluateExpression(
                branch.condition,
                variables,
                record,
              );
              if (expressionEval === null) return; // Error
              if (hasValue(expressionEval)) {
                matchedScopes = branch.scopes;
                break;
              }
            }
            // There are no matches, remove variables from scope
            if (!matchedScopes) {
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
            // Everything matched, so run the scope and re-try matching
            // First, remove the matched values from the record
            for (let i = 0; i < as.length; i++) {
              record.remove(pointer); // since we are removing items, the pointer always points to the removed item
            }

            // Run the scope
            for (var scope of matchedScopes) {
              await this.evaluate(scope, variables, record, pointer);
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
        await this.evaluate(scope, variables, record);
      }
    }

    // If there was a scope modifier,
    // depending on the type of scope, we need to insert or push into the parent record
    if (ruleScope.modifier) {
      const recordResult = record.getRecord();
      this.modifyRecordWithRecordValues(
        parentRecord,
        ruleScope.operator,
        parentPointer,
        recordResult,
      );
    }
  }

  private modifyRecordWithRecordValues(
    record: RecordTape,
    operator: TT,
    pointer: number,
    recordValues: RecordVal[],
  ) {
    if (operator === "REPLACE_MATCH") {
      let addAtPointer = pointer;
      for (let i = 0; i < recordValues.length; i++) {
        record.add(addAtPointer++, recordValues[i]);
      }
    } else if (operator === "PUSH_END_MATCH") {
      recordValues.forEach((val) => record.addLast(val));
    } else if (operator === "PUSH_BEGIN_MATCH") {
      for (let i = recordValues.length - 1; i >= 0; i--) {
        record.addFirst(recordValues[i]);
      }
    }
    // Otherwise, it is a REMOVE_MATCH or PATTERN_MATCH, so skip the adding
  }

  private async testPatternValueMatch(
    patVal: PatternNode,
    pointer: number,
    record: RecordTape,
  ): Promise<boolean> {
    let currentRecordValue = record.get(pointer);
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
        (await this.testPatternValueMatch(patVal.left, pointer, record)) ||
        (await this.testPatternValueMatch(patVal.right, pointer, record))
      );
    } else if (patVal.kind == "PatternNot") {
      return !(await this.testPatternValueMatch(patVal.right, pointer, record));
    } else {
      for (var patternValue of patVal.patterns) {
        let test = await this.testPatternValueMatch(
          patternValue,
          pointer,
          record,
        );
        if (!test) return false;
        pointer += 1;
      }
      return true;
    }
  }

  private async evaluateExpression(
    exp: ExprNode,
    variables: VarMap,
    record: RecordTape,
  ): Promise<RecordVal | null> {
    if (
      exp.kind == "Value" ||
      exp.kind == "Variable" ||
      exp.kind == "Function"
    ) {
      return await evaluateValVarFun(
        exp,
        variables,
        record,
        true,
        this.errReporter,
        this.nameSpace,
        this.baseDirectory,
      );
    } else if (exp.kind == "BinaryExpr") {
      let left = await this.evaluateExpression(exp.left, variables, record);
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
              "300001",
            );
          let right = await this.evaluateExpression(
            exp.right,
            variables,
            record,
          );
          if (right === null) return null;
          if (right.type !== "NUM")
            return this.errReporter.throwErr(
              exp.token,
              `Right operand of \`${exp.token.lexeme}\` operator must be a number`,
              "300002",
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
            let right = await this.evaluateExpression(
              exp.right,
              variables,
              record,
            );
            if (right === null) return null;
            return right;
          } else if (exp.operator === "AND") {
            if (!hasValue(left)) return left;
            let right = await this.evaluateExpression(
              exp.right,
              variables,
              record,
            );
            if (right === null) return null;
            return right;
          } else {
            let right = await this.evaluateExpression(
              exp.right,
              variables,
              record,
            );
            if (right === null) return null;
            if (exp.operator === "EQUAL_TO") {
              return newRecordVal(
                "BOOL",
                left.type === right.type && left.value === right.value,
              );
            } else {
              return newRecordVal(
                "BOOL",
                left.type !== right.type || left.value !== right.value,
              );
            }
          }
      }
    } else {
      // Unary Expression
      let right: RecordVal | null = await this.evaluateExpression(
        exp.right,
        variables,
        record,
      );
      if (right === null) return null;
      return { type: "BOOL", value: String(!hasValue(right)) };
    }
  }

  private async evaluateValueScope(
    valueScope: ValueScopeNode,
    variables: VarMap,
    record: RecordTape,
    pointer: number = 0,
  ): Promise<void> {
    let toAddToRecord: RecordVal[] = [];
    for (let valueVarOrFunction of valueScope.scope) {
      let value: RecordVal | null = await evaluateValVarFun(
        valueVarOrFunction,
        variables,
        record,
        valueScope.operator === "REPLACE_MATCH",
        this.errReporter,
        this.nameSpace,
        this.baseDirectory,
      );
      if (value === null) return;
      if (!valueVarOrFunction.push) continue;
      toAddToRecord.push(value);
    }
    // Modify the record with these new values based on scope operator (eg. >> to push values, !> to add nothing, ...)
    this.modifyRecordWithRecordValues(
      record,
      valueScope.operator,
      pointer,
      toAddToRecord,
    );
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
export async function evaluateValVarFun(
  value: ValueOrFunctionNode,
  variables: VarMap,
  record: RecordTape,
  mustBeSafe: boolean,
  errorReporter: ErrorReporter,
  nameSpace: Library,
  baseDirectory: string,
): Promise<RecordVal | null> {
  if (value.kind == "Value") {
    return toRecordVal(value);
  } else if (value.kind == "Variable") {
    if (!variables.hasOwnProperty(value.name)) {
      return errorReporter.throwErr(
        value.token,
        `Variable \`${value.name}\` is not defined`,
        "300007",
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
        "300003",
      );
    const funObj: ModuleFunction = nameSpace[name];
    if (!funObj.safe && mustBeSafe)
      return errorReporter.throwErr(
        errorToken,
        `Function \`${name}\` is not a safe function and cannot be used in expressions or replacing value scopes (\`-> [ ... ]\`)`,
        "300004",
      );
    if (
      funObj.variadic
        ? params.length < funObj.params.length
        : funObj.params.length !== params.length
    )
      return errorReporter.throwErr(
        errorToken,
        `Invalid number of parameters, function \`${name}\` must have ${funObj.variadic ? "at least" : ""} ${funObj.params.length} parameter${funObj.params.length !== 1 || funObj.variadic ? "s" : ""}`,
        "300005",
      );
    let runtimeContext = {
      record,
      variables,
      mustBeSafe,
      lazyparams: value.params,
      errorToken,
      errorReporter,
      nameSpace,
      baseDirectory,
    };
    if (funObj.lazy) {
      // Lazy run
      return await funObj.run([], runtimeContext);
    } else {
      const runparams: RecordVal[] = [];
      for (let [index, param] of params.entries()) {
        let newparam = await evaluateValVarFun(
          param,
          variables,
          record,
          mustBeSafe,
          errorReporter,
          nameSpace,
          baseDirectory,
        );
        if (newparam === null) return null;
        if (funObj.variadic && index >= funObj.params.length) {
          if (funObj.variadic != "ANY" && funObj.variadic !== newparam.type)
            return errorReporter.throwErr(
              param.token,
              `Parameter ${index + 1} of \`${name}\` function must be a \`${funObj.variadic.toLowerCase()}\` type`,
              "300006",
            );
        } else if (
          funObj.params[index] !== "ANY" &&
          funObj.params[index] !== newparam.type
        ) {
          return errorReporter.throwErr(
            param.token,
            `Parameter ${index + 1} of \`${name}\` function must be a \`${funObj.params[index].toLowerCase()}\` type`,
            "300006",
          );
        }
        runparams.push(newparam);
      }
      return await funObj.run(runparams, runtimeContext);
    }
  }
}
