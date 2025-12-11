import { type TT, type Token } from "./token.js";
import {
  RuleNode,
  BinaryExprNode,
  type ExprNode,
  type ValueOrFunctionNode,
  type ScopeNode,
  type PatternNode,
  type ValueType,
  type Node,
} from "./node.js";
import { ErrorInfo, ErrorReporter } from "./error.js";
import { LIBRARIES, Library } from "./utils/libraryUtils.js";

class ParseError extends Error {
  code: string;
  message: string;
  token: Token;

  constructor(token: Token, message: string, code: string) {
    super(message);
    this.code = code;
    this.message = message;
    this.token = token;
  }
}

export class Parser {
  private tokenList: Token[];
  private ast: Node | null;
  private imports: Library;
  private defs: Defs;
  private errReporter: ErrorReporter;
  private pos: number;

  constructor(tokenList: Token[], reporter: ErrorReporter) {
    this.tokenList = tokenList;
    this.errReporter = reporter;
    this.pos = 0;
    this.imports = {};
    let delayedErrors: ErrorInfo[] = []; // Used for import errors that don't need to be displayed until a real parsing error occurs (since the code checks for hasError(), which would mess up parsing)
    let thrownErrors = false;
    try {
      this.parseImports(delayedErrors);
      this.parseDefs();
      this.ast = this.parseRuleScope(false);
    } catch (error: unknown) {
      if (error instanceof ParseError) {
        for (var err of delayedErrors)
          this.errReporter.pushErr(err.token, err.message, err.code);
        this.errReporter.throwErr(error.token, error.message, error.code);
        thrownErrors = true;
        this.ast = null;
      } else {
        throw error;
      }
    }

    if (delayedErrors.length && !thrownErrors) {
      for (var err of delayedErrors)
        this.errReporter.pushErr(err.token, err.message, err.code);
      this.errReporter.throwAllErrs();
      this.ast = null;
    }

    // Pretty Print
    // if(this.ast != null) this.prettyPrint(this.ast)
  }

  private peek(type: TT): boolean {
    return (
      this.pos < this.tokenList.length && this.tokenList[this.pos].type == type
    );
  }
  private peekArr(types: TT[]): boolean {
    return (
      this.pos < this.tokenList.length &&
      types.includes(this.tokenList[this.pos].type)
    );
  }

  public getParserResults(): ParserResults {
    return {
      ast: this.ast,
      imports: this.imports,
      defs: this.defs,
    };
  }

  private next(): Token {
    if (this.pos >= this.tokenList.length) {
      return {
        type: "EOF",
        charStart: 0,
        charEnd: 0,
        lineStart: 0,
        lexeme: "",
      }; // Empty Token that should never be returned
    }
    return this.tokenList[this.pos++];
  }

  private expect(type: TT, message: string, code: string): Token {
    if (
      this.pos >= this.tokenList.length ||
      this.tokenList[this.pos].type != type
    ) {
      throw new ParseError(this.tokenList[this.pos], message, code);
    }
    return this.tokenList[this.pos++];
  }

  private throwErrOnCurrentToken(message: string, code: string) {
    throw new ParseError(this.tokenList[this.pos], message, code);
  }

  private parseRuleScope(needsSquareBrackets: boolean): ScopeNode | null {
    if (needsSquareBrackets) {
      this.next(); // remove `=>`
      this.expect(
        "LEFT_SQUARE",
        `Expected \`[\` to start the rule scope`,
        "200002"
      );
    }
    const begin: ScopeNode[] | null = this.parseBeginOrEnd("BEGIN");
    const customs: RuleNode[] | null = this.parseCustomRules();
    const end: ScopeNode[] | null = this.parseBeginOrEnd("END");
    if (needsSquareBrackets) {
      this.expect(
        "RIGHT_SQUARE",
        `Expected \`]\` to end the rule scope`,
        "200003"
      );
    } else {
      this.expect("EOF", `Unexpected token`, "200001");
    }

    return { kind: "RuleScope", customs, begin, end };
  }
  private parseValueScope(variables: Array<string | null>): ScopeNode | null {
    // -> Value or -> [ ... ]
    const operator = this.next();
    const scope: ValueOrFunctionNode[] = [];
    if (this.peek("LEFT_SQUARE")) {
      this.next(); // remove `[`
      while (true) {
        const value = this.parseValueOrFunction(true);
        if (value === null) break;
        scope.push(value);
      }
      this.expect(
        "RIGHT_SQUARE",
        `Expected \`]\` to end the value scope`,
        "200004"
      ); // remove `]`
    } else {
      const value = this.parseValueOrFunction(true);
      if (value === null)
        throw new ParseError(
          this.next(),
          `Expected value or scope after match operator \`${operator.lexeme}\``,
          "200006"
        );
      scope.push(value);
    }
    return { kind: "ValueScope", operator: operator.type, scope };
  }

  private parseBeginOrEnd(beginOrEnd: "BEGIN" | "END"): ScopeNode[] | null {
    if (this.peek(beginOrEnd)) {
      this.next();
      let scopes: ScopeNode[] = [];
      let hasScope: boolean = false;
      if (this.peek("REPLACE_MATCH")) {
        this.throwErrOnCurrentToken(
          `Replacing match operator (\`->\`) is invalid for the \`${beginOrEnd.toLocaleLowerCase()}\` pattern`,
          "200007"
        );
      }
      while (
        this.peekArr([
          "REMOVE_MATCH",
          "RULE_MATCH",
          "PUSH_END_MATCH",
          "PUSH_BEGIN_MATCH",
        ])
      ) {
        hasScope = true;
        if (this.peek("RULE_MATCH")) {
          let parsedScope: ScopeNode | null = this.parseRuleScope(true);
          if (parsedScope === null) return null;
          scopes.push(parsedScope);
        } else {
          let parsedScope: ScopeNode | null = this.parseValueScope([]);
          if (parsedScope === null) return null;
          scopes.push(parsedScope);
        }
      }
      if (!hasScope) {
        this.throwErrOnCurrentToken(
          `Expected match operator after \`${beginOrEnd.toLocaleLowerCase()}\` pattern`,
          "200008"
        );
      }
      return scopes;
    } else {
      return null;
    }
  }

  private parseValueOrFunction(
    canHaveNot: boolean
  ): ValueOrFunctionNode | null {
    // Parse Not if neccessary (in value scope)
    let add = true;
    if (this.peek("NOT")) {
      if (!canHaveNot) {
        return null;
      }
      this.next();
      add = false;
    }
    const token: Token = this.tokenList[this.pos];
    // Parse Value
    if (["STR", "NUM", "TERM", "BOOL", "NIL"].includes(token.type)) {
      if (token.type === "NUM") {
        token.lexeme = String(Number(token.lexeme));
      }
      this.next(); // Remove value token
      return {
        kind: "Value",
        value: token.lexeme,
        push: add,
        token,
        type: this.toValType(token),
      };
    }
    // Parse Function or variable
    if (this.peek("IDENTIFIER")) {
      let token = this.next();
      if (this.peek("LEFT_PREN")) {
        this.next(); // remove `(`
        let params: ValueOrFunctionNode[] = [];
        while (true) {
          const value = this.parseValueOrFunction(false);
          if (value === null) break;
          params.push(value);
        }
        this.expect(
          "RIGHT_PREN",
          `Expected \`)\` to end the function call`,
          "200009"
        );
        return {
          kind: "Function",
          name: token.lexeme,
          params,
          push: add,
          token,
        };
      } else {
        return { kind: "Variable", name: token.lexeme, push: add, token };
      }
    }
    if (!add)
      this.throwErrOnCurrentToken(
        `Expected value after \`!\` in the value scope`,
        "200010"
      );
    return null;
  }

  private parseCustomRules(): RuleNode[] | null {
    let rules: RuleNode[] = [];
    while (true) {
      // Parse Ruels
      let pattern: RecursivePatternReturn | null = this.parsePattern(
        [],
        [],
        false,
        false
      );
      if (pattern == null) break;
      let ifExpression: ExprNode | null = null;
      if (this.peek("IF")) {
        this.next(); // remove `if`
        ifExpression = this.parseExpression(null, null, false);
        if (ifExpression === null)
          this.throwErrOnCurrentToken(
            `Expected expression after \`if\``,
            "200011"
          );
      }
      let scopes: ScopeNode[] = [];
      if (this.peek("REPLACE_MATCH")) {
        let parsedScope: ScopeNode | null = this.parseValueScope(pattern.as);
        if (parsedScope === null) return null;
        scopes.push(parsedScope);
      }
      while (
        this.peekArr([
          "REMOVE_MATCH",
          "RULE_MATCH",
          "PUSH_END_MATCH",
          "PUSH_BEGIN_MATCH",
        ])
      ) {
        let parsedScope: ScopeNode | null = null;
        if (this.peek("RULE_MATCH")) {
          parsedScope = this.parseRuleScope(true);
        } else {
          parsedScope = this.parseValueScope(pattern.as);
        }
        if (parsedScope === null) return null;
        scopes.push(parsedScope);
      }
      if (scopes.length === 0)
        this.throwErrOnCurrentToken(
          `Expected rule operator after the pattern`,
          "200012"
        );
      rules.push({
        kind: "Rule",
        pattern: { kind: "PatternGroup", patterns: pattern.patternValues },
        expression: ifExpression,
        scopes,
        variables: pattern.as,
      });
    }

    return rules;
  }
  private parsePattern(
    patternValues: PatternNode[],
    as: Array<string | null>,
    inOr: boolean,
    notLookAhead: boolean
  ): RecursivePatternReturn | null {
    let patternValue: PatternNode;
    // Traditional Values
    if (this.peek("NOT")) {
      this.next(); // remove `!`
      let lookAheadPatternValue: RecursivePatternReturn | null =
        this.parsePattern(patternValues, as, inOr, true);
      if (lookAheadPatternValue === null) return null;
      patternValue = {
        kind: "PatternNot",
        right: {
          kind: "PatternGroup",
          patterns: lookAheadPatternValue.patternValues,
        },
      };
    } else if (this.peekArr(["STR", "NUM", "TERM", "BOOL", "NIL"])) {
      const token = this.next();
      if (token.type === "NUM") {
        token.lexeme = String(Number(token.lexeme));
      }
      patternValue = {
        kind: "Value",
        value: token.lexeme,
        push: false,
        token,
        type: this.toValType(token),
      };
      as.push(null);
    } else if (
      this.peekArr([
        "NUM_TYPE",
        "STR_TYPE",
        "TERM_TYPE",
        "BOOL_TYPE",
        "ANY_TYPE",
      ])
    ) {
      patternValue = {
        kind: "PatternType",
        type: this.next().type,
      };
      as.push(null);
    } else if (this.peek("LEFT_PREN")) {
      if (notLookAhead)
        this.throwErrOnCurrentToken(
          `Expected pattern value after \`!\` in the pattern, not a group`,
          "200013"
        );
      this.next(); // remove `(`
      let pattern: RecursivePatternReturn | null = this.parsePattern(
        [],
        [],
        inOr,
        false
      );
      if (pattern == null)
        throw new ParseError(
          this.next(),
          `Expected pattern value in the pattern group`,
          "200014"
        );
      this.expect(
        "RIGHT_PREN",
        `Expected \`)\` to end the pattern group`,
        "200015"
      );
      patternValue = { kind: "PatternGroup", patterns: pattern.patternValues };
      as = as.concat(pattern.as);
    } else {
      if (notLookAhead)
        this.throwErrOnCurrentToken(
          `Expected pattern value after \`!\` in pattern`,
          "200016"
        );
      return null;
    }

    if (notLookAhead && patternValue.kind != "PatternGroup") {
      return {
        patternValues: [patternValue],
        as: as,
      };
    } else if (patternValue.kind == "PatternGroup") {
      patternValues = patternValues.concat(patternValue);
    } else {
      patternValues.push(patternValue);
    }

    // Ors
    if (this.peek("OR")) {
      if (!as.every((el) => el == null)) {
        this.throwErrOnCurrentToken(
          `The \`|\` pattern operator cannot be combined with \`as\` within the same group`,
          "200017"
        );
      }
      let orToken = this.next(); // remove `|`
      let pattern: RecursivePatternReturn | null = this.parsePattern(
        [],
        [],
        true,
        false
      );
      if (this.errReporter.hasError()) return null;
      if (pattern == null)
        this.throwErrOnCurrentToken(
          `Expected pattern value(s) to the right of the \`|\` pattern operator`,
          "200018"
        );
      if (as.length != pattern?.as.length)
        throw new ParseError(
          orToken,
          `The left side of the \`|\` pattern operator must have the same number of pattern values as right side`,
          "200019"
        );
      patternValues = [
        {
          kind: "PatternOr",
          left: { kind: "PatternGroup", patterns: patternValues },
          right: { kind: "PatternGroup", patterns: pattern.patternValues },
        },
      ];
    }

    // As variables
    if (this.peek("AS")) {
      if (inOr)
        this.throwErrOnCurrentToken(
          `Cannot use \`as\` in the middle of the \`|\` condition`,
          "200020"
        );
      let identifiers: Token[] = [];
      this.next(); // remove `as`
      if (this.peek("LEFT_PREN")) {
        this.next(); // remove `(`
        while (this.peek("IDENTIFIER")) {
          identifiers.push(this.next());
        }
        if (identifiers.length === 0)
          this.throwErrOnCurrentToken(
            `Expected variable name(s) in \`as\` group`,
            "200021"
          );
        if (!this.peek("RIGHT_PREN"))
          this.throwErrOnCurrentToken(
            `Expected \`)\` to end \`as\` group`,
            "200022"
          );
        this.next(); // remove `)`
      } else if (this.peek("IDENTIFIER")) {
        identifiers.push(this.next());
      } else {
        this.throwErrOnCurrentToken(
          `Expected variable name or group of variable names after \`as\``,
          "200023"
        );
      }
      let lastVarIndex = -1;
      for (var i = 0; i <= as.length; i++) {
        if (as[i] != null) {
          lastVarIndex = i;
        }
      }
      // Either var after last var (for too many variables)
      const index1 = lastVarIndex + 1;
      // Or index at the end of the `as` arr to receive all variables
      const index2 = as.length - identifiers.length;
      let index = Math.max(index1, index2);
      for (var identifier of identifiers) {
        if (as.length > index) {
          if (as.includes(identifier.lexeme))
            throw new ParseError(
              identifier,
              `Variable \`${identifier.lexeme}\` is already declared in the pattern`,
              "200024"
            );
          as[index] = identifier.lexeme;
        } else {
          throw new ParseError(
            identifier,
            `Too many variables for the number of pattern values`,
            "200025"
          );
        }
        index += 1;
      }
    }
    let nextValue = this.parsePattern(patternValues, as, inOr, false);
    if (this.errReporter.hasError()) return null;
    if (nextValue == null) {
      return {
        patternValues: patternValues,
        as: as,
      };
    } else {
      return {
        patternValues: nextValue.patternValues,
        as: nextValue.as,
      };
    }
  }

  private parseExpression(
    left: ExprNode | null = null,
    operator: Token | null = null,
    returnNotValue: boolean
  ): ExprNode | null {
    let expression: ExprNode;
    if (this.peek("NOT")) {
      this.next(); // Remove `!`
      let value = this.parseExpression(null, null, true);
      if (value === null)
        throw new ParseError(
          this.next(),
          `Expected value after \`!\` operator`,
          "200026"
        );
      expression = {
        kind: "NotExpr",
        right: value,
      };
    } else if (this.peek("LEFT_PREN")) {
      this.next(); // remove `(`
      let innerExp: ExprNode | null = this.parseExpression(null, null, false);
      if (this.errReporter.hasError()) return null;
      if (innerExp == null)
        throw new ParseError(
          this.next(),
          `Expected expression after \`(\``,
          "200027"
        );
      expression = innerExp;
      this.expect("RIGHT_PREN", `Expected \`)\` to end expression`, "200028");
    } else {
      let value = this.parseValueOrFunction(false);
      if (value === null) return null;
      expression = value;
    }
    if (returnNotValue) return expression;
    // Parse operators
    if (
      this.peekArr([
        "GREATER_THAN",
        "LESS_THAN",
        "GREATER_THAN_OR_EQUAL_TO",
        "LESS_THAN_OR_EQUAL_TO",
        "EQUAL_TO",
        "NOT_EQUAL_TO",
        "OR",
        "AND",
      ])
    ) {
      let nextOperator = this.next();
      if (left && operator) {
        if (
          this.precedence(operator.type) >= this.precedence(nextOperator.type)
        ) {
          let newLeft: BinaryExprNode = {
            kind: "BinaryExpr",
            left,
            operator: operator.type,
            right: expression,
            token: operator,
          };
          let returnExp = this.parseExpression(newLeft, nextOperator, false);
          if (this.errReporter.hasError()) return null;
          if (returnExp === null)
            this.throwErrOnCurrentToken(
              `Expected expression after \`${nextOperator.lexeme}\` expression operator`,
              "200029"
            );
          return returnExp;
        } else {
          let newRight = this.parseExpression(expression, nextOperator, false);
          if (this.errReporter.hasError()) return null;
          if (newRight === null)
            throw new ParseError(
              this.next(),
              `Expected expression after \`${nextOperator.lexeme}\` expression operator`,
              "200029"
            );
          return {
            kind: "BinaryExpr",
            left,
            operator: operator.type,
            right: newRight,
            token: operator,
          };
        }
      } else {
        let returnExp = this.parseExpression(expression, nextOperator, false);
        if (this.errReporter.hasError()) return null;
        if (returnExp === null)
          this.throwErrOnCurrentToken(
            `Expected expression after \`${nextOperator.lexeme}\` expression operator`,
            "200029"
          );
        return returnExp;
      }
    }
    if (left && operator) {
      return {
        kind: "BinaryExpr",
        left,
        operator: operator.type,
        right: expression,
        token: operator,
      };
    }
    return expression; // Single value with no operator
  }

  private precedence(type: TT): number {
    switch (type) {
      case "AND":
        return 2;
      case "OR":
        return 1;
      default:
        return 3;
    }
  }

  private toValType(token: Token): ValueType {
    let type: ValueType;
    switch (token.type) {
      case "STR":
        return "STR";
      case "NUM":
        return "NUM";
      case "BOOL":
        return "BOOL";
      case "TERM":
        return "TERM";
      default:
        return "NIL";
    }
  }

  /* Parse Imports */
  private parseImports(delayedErrors: ErrorInfo[]) {
    const importedLibs = new Set<string>();
    while (this.peek("IMPORT")) {
      this.next();
      if (this.peek("IDENTIFIER")) {
        // Import everything from library
        const libraryToken = this.next();
        if (importedLibs.has(libraryToken.lexeme)) {
          delayedErrors.push({
            token: libraryToken,
            message: `Multiple imports to library \`${libraryToken.lexeme}\``,
            code: "200034",
          });
        } else if (LIBRARIES.hasOwnProperty(libraryToken.lexeme)) {
          Object.assign(this.imports, LIBRARIES[libraryToken.lexeme]);
          importedLibs.add(libraryToken.lexeme);
        } else {
          delayedErrors.push({
            token: libraryToken,
            message: `Library \`${libraryToken.lexeme}\` does not exist`,
            code: "200035",
          });
        }
      } else {
        // Import only specific functions from library
        this.expect(
          "LEFT_SQUARE",
          "Expected library name or `[` in import statement",
          "200030"
        );
        let tokenList: Token[] = [];
        while (this.peek("IDENTIFIER")) {
          tokenList.push(this.next());
        }
        this.expect(
          "RIGHT_SQUARE",
          "Expected `]` to close function group in import statement",
          "200031"
        );
        this.expect(
          "FROM",
          "Expected `from` after function group in import statement",
          "200032"
        );
        const libraryToken = this.expect(
          "IDENTIFIER",
          "Expected library name after `from` in import statement",
          "200033"
        );
        if (importedLibs.has(libraryToken.lexeme)) {
          delayedErrors.push({
            token: libraryToken,
            message: `Multiple imports to library \`${libraryToken.lexeme}\``,
            code: "200034",
          });
        } else if (LIBRARIES.hasOwnProperty(libraryToken.lexeme)) {
          const lib = LIBRARIES[libraryToken.lexeme];
          const addedFunctionSet = new Set<string>();
          for (let fn of tokenList) {
            if (lib.hasOwnProperty(fn.lexeme)) {
              if (addedFunctionSet.has(fn.lexeme)) {
                delayedErrors.push({
                  token: fn,
                  message: `Duplicate function \`${fn.lexeme}\` import`,
                  code: "200037",
                });
              } else {
                this.imports[fn.lexeme] = lib[fn.lexeme];
                addedFunctionSet.add(fn.lexeme);
              }
            } else {
              delayedErrors.push({
                token: fn,
                message: `Function \`${fn.lexeme}\` not found in \`${libraryToken.lexeme}\` library`,
                code: "200036",
              });
            }
          }
          importedLibs.add(libraryToken.lexeme);
        } else {
          delayedErrors.push({
            token: libraryToken,
            message: `Library \`${libraryToken.lexeme}\` does not exist`,
            code: "200035",
          });
        }
      }
    }
  }

  private parseDefs() {
    this.defs = {};
    while (this.peek("DEF")) {
      this.next();
      const identifier = this.expect(
        "IDENTIFIER",
        "Expected identifier for global variable name",
        "200005"
      );
      if (this.defs.hasOwnProperty(identifier.lexeme))
        return this.errReporter.throwErr(
          this.next(),
          `Duplicate global variable, \`${identifier.lexeme}\` has already been defined`,
          "200040"
        );
      this.expect(
        "ASSIGN",
        "Expected `:=` for global variable definition",
        "200038"
      );
      const val = this.parseValueOrFunction(false);
      if (val == null)
        return this.errReporter.throwErr(
          this.next(),
          "Expected value for global variable definition",
          "200039"
        );
      this.defs[identifier.lexeme] = val;
    }
  }

  private prettyPrint(node: Node) {
    function serialize(obj: any): any {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(serialize);
      }
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = serialize(obj[key]);
      }
      return result;
    }
    console.log(JSON.stringify(serialize(node), null, 2));
  }

  private prettyPrintExp(spaces: number, exp: ExprNode): string {
    let spacer = " ".repeat(spaces);
    if (exp.kind == "BinaryExpr") {
      return `${spacer}Operator: ${exp.operator}
${spacer}left:
${spacer}${this.prettyPrintExp(spaces + 2, exp.left)}
${spacer}right:
${spacer}${this.prettyPrintExp(spaces + 2, exp.right)}`;
    } else if (exp.kind == "NotExpr") {
      return `${spacer}NOT:
${spacer}${this.prettyPrintExp(spaces + 2, exp.right)}`;
    } else if (exp.kind == "Function") {
      return `${spacer}FUNCTION:
${spacer}${exp.name}`;
    } else if (exp.kind == "Variable") {
      return `${spacer}${exp.name}`;
    } else {
      return `${spacer}${exp.value}`;
    }
  }
}

export type ParserResults = { ast: Node | null; imports: Library; defs: Defs };
export type Defs = Record<string, ValueOrFunctionNode>;
interface RecursivePatternReturn {
  patternValues: PatternNode[];
  as: Array<string | null>;
}
