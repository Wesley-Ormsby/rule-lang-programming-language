import { type TT, type Token } from "./token.js";
import { Error } from "./error.js";
import { Node, Rule, ValueScope, RuleScope, Value, Function, Variable, PatternValueType, PatternValueOr, PatternValueNot, BinaryExpression, UnaryNotExpression, type Expression, type ValueOrFunction, type Scope, type PatternValue, type ValueType} from "./node.js";

export class Parser {
  private tokenList: Token[];
  private ast: Node | null;

  constructor(tokenList: Token[]) {
    this.tokenList = tokenList;
    this.ast = this.parseRuleScope(false)
    // Pretty Print
     // if(this.ast != null) this.prettyPrint(this.ast)
  }

  
  public getAST(): Node | null {
    return this.ast;
  }
  private peek(type: TT): boolean {
    return this.tokenList.length != 0 && this.tokenList[0].type == type
  }
  private peekArr(types: TT[]): boolean {
    return this.tokenList.length != 0 && types.includes(this.tokenList[0].type);
  }
  private shift(): Token {
    if(this.tokenList.length == 0) {
        return { type: "EOF", char_start: 0, char_end: 0, line_start: 0, lexeme: ""} // Empty Token that should never be returned
    }
    let returnToken: Token = this.tokenList[0];
    this.tokenList.shift()
    return returnToken;
  }

  private parseRuleScope(needsSquareBrackets:boolean): Scope | null {
    if(needsSquareBrackets) {
        this.shift() // remove `=>`
        if(!this.peek("LEFT_SQUARE")) return Error.throwErr(this.shift(), `Expected \`[\` to start the rule scope`)
        this.shift()
    }
    const begin: Scope[] | null = this.parseBeginOrEnd("BEGIN");
    if(Error.hasError()) return null;

    const customs: Rule[] | null = this.parseCustomRules();
    if(Error.hasError()) return null;

    const end: Scope[] | null = this.parseBeginOrEnd("END");
    if(Error.hasError()) return null;

    if(needsSquareBrackets) {
        if(!this.peek("RIGHT_SQUARE")) return Error.throwErr(this.shift(), `Expected \`]\` to end the rule scope`)
        this.shift()
    } else if(this.tokenList.length != 1) {
        return Error.throwErr(this.shift(), `Unexpected token`)
    }

    return new RuleScope(begin, customs, end); // Filler
  }
  private parseValueScope(variables: Array<string|null>) : Scope | null {
    // -> Value or -> [ ... ]
    const operator = this.shift();
    const values: ValueOrFunction[] = [];
    if(this.peek("LEFT_SQUARE")) {
        this.shift() // remove `[`
        while(true) {
            const value = this.parseValueOrFunction(true)
            if(Error.hasError()) return null;
            if(value === null) break;
            if(value instanceof Variable && !variables.includes(value.name)) return Error.throwErr(value.token, `Variable \`${value.name}\` in not defined in the scope's pattern`);
            values.push(value)
        }
        if(!this.peek("RIGHT_SQUARE")) return Error.throwErr(this.shift(), `Expected \`]\` to end the value scope`);
        this.shift() // remove `]`
    } else {
       const value = this.parseValueOrFunction(true)
       if(Error.hasError()) return null;
       if(value === null) return Error.throwErr(this.shift(), `Expected scope after match operator \`${operator.lexeme}\``);
       if(value instanceof Variable && !variables.includes(value.name)) return Error.throwErr(value.token, `Variable \`${value.name}\` in not defined in the scope's pattern`);
       values.push(value)
    }
    return new ValueScope(operator, values);
  }

  private parseBeginOrEnd(beginOrEnd:"BEGIN" | "END"): Scope[] | null {
    if(this.peek(beginOrEnd)) {
        this.shift();
        let scopes: Scope[] = [];
        let hasScope: boolean = false;
        if(this.peek("REPLACE_MATCH")) {
            return Error.throwErr(this.shift(), `Replacing match operator (\`->\`) is invalid for the \`${beginOrEnd.toLocaleLowerCase()}\` pattern`)
        }
        while(this.peekArr(["REMOVE_MATCH", "RULE_MATCH", "PUSH_END_MATCH", "PUSH_BEGIN_MATCH"])) {
            hasScope = true;
            if(this.peek("RULE_MATCH")) {
                let parsedScope: Scope | null = this.parseRuleScope(true)
                if(parsedScope === null) return null;
                scopes.push(parsedScope)
            } else {
                let parsedScope: Scope | null = this.parseValueScope([])
                if(parsedScope === null) return null;
                scopes.push(parsedScope)
            }
        }
        if(!hasScope) {
            return Error.throwErr(this.shift(), `Expected match operator after \`${beginOrEnd.toLocaleLowerCase()}\` pattern`);
        }
        return scopes
    } else {
        return null;
    }
  }

  private parseValueOrFunction(canHaveNot: boolean): ValueOrFunction | null {
    // Parse Not if neccessary (in value scope)
    let add = true;
    if(this.peek("NOT")) {
        if(!canHaveNot) {
            return null;
        }
        this.shift()
        add = false;
    }
    const token: Token = this.tokenList[0]
    // Parse Value
    if(["STR", "NUM", "TERM", "BOOL", "NIL"].includes(token.type)) {
        if(token.type === "NUM") {
            token.lexeme = String(Number(token.lexeme))
        }
        this.shift() // Remove value token
        return new Value(token, this.toValType(token), add);
    }
    // Parse Function or variable
    if(this.peek("IDENTIFIER")) {
        let token = this.shift();
        if(this.peek("LEFT_PREN")) {
            this.shift() // remove `(`
            let parms: ValueOrFunction[] = []
            while(true) {
                const value = this.parseValueOrFunction(false)
                if(Error.hasError()) return null;
                if(value === null) break;
                parms.push(value)
            }
            if(!this.peek("RIGHT_PREN")) return Error.throwErr(this.shift(), `Expected \`)\` to end the funtion call`);
            this.shift() // remove `)`
            return new Function(token, parms, add);
        } else {
            return new Variable(token, add);
        }

    } 
    if(!add) return Error.throwErr(this.shift(), `Expected value after \`!\` in the value scope`)
    return null;
  }

  private parseCustomRules(): Rule[] | null {
    let rules: Rule[] = []
    while(true) {
        // Parse Ruels
        let pattern: RecursivePatternRerturn | null = this.parsePattern([], [], false, false);
        if(Error.hasError()) return null;
        if(pattern == null) break;
        let ifExpression: Expression | null = null;
        if(this.peek("IF")) {
            this.shift() // remove `if`
            ifExpression = this.parseExpression(null, null, false)
            if(Error.hasError()) return null;
            if(ifExpression === null) return Error.throwErr(this.shift(), `Expected expression after \`if\``)
        }
        let scopes:Scope[] = []
        if(this.peek("REPLACE_MATCH")) {
                let parsedScope: Scope | null = this.parseValueScope(pattern.as)
                if(parsedScope === null) return null;
                scopes.push(parsedScope)
        }
        while(this.peekArr(["REMOVE_MATCH", "RULE_MATCH", "PUSH_END_MATCH", "PUSH_BEGIN_MATCH"])) {
            let parsedScope: Scope | null = null;
            if(this.peek("RULE_MATCH")) {
                parsedScope = this.parseRuleScope(true)
            } else {
                parsedScope = this.parseValueScope(pattern.as)
            }
            if(parsedScope === null) return null;
            scopes.push(parsedScope)
        }
        if(scopes.length === 0) return Error.throwErr(this.shift(), `Expected rule operator after the pattern`)
        rules.push(new Rule(pattern.patternValues,ifExpression,scopes,pattern.as))
    }

    return rules
  }
  private parsePattern(patternValues: PatternValue[], as: Array<string|null>, inOr: boolean, notLookAhead:boolean) : RecursivePatternRerturn | null {
    let patternValue: PatternValue;

    // Traditional Values
    if(this.peek("NOT")) {
        this.shift() // remove `!`
        let lookAheadPatternValue: RecursivePatternRerturn | null = this.parsePattern(patternValues, as, inOr, true);
        if(lookAheadPatternValue === null) return null;
        patternValue = new PatternValueNot(lookAheadPatternValue.patternValues)
    } else if(this.peekArr(["STR", "NUM", "TERM", "BOOL", "NIL"])) {
        const token = this.shift();
        if(token.type === "NUM") {
            token.lexeme = String(Number(token.lexeme))
        }
        patternValue = new Value(token,this.toValType(token), false);
        as.push(null)
    } else if(this.peekArr(["NUM_TYPE", "STR_TYPE", "TERM_TYPE", "BOOL_TYPE", "ANY_TYPE"])) {
        patternValue = new PatternValueType(this.shift());
        as.push(null)
    } else if(this.peek("LEFT_PREN")) {
        if(notLookAhead) return Error.throwErr(this.shift(), `Expected single non-group pattern value after \`!\` in the pattern`)
        this.shift() // remove `(`
        let pattern: RecursivePatternRerturn | null = this.parsePattern([], [], inOr, false);
        if(Error.hasError()) return null;
        if(pattern == null) return Error.throwErr(this.shift(), `Expected pattern value in the pattern group`);
        if(!this.peek("RIGHT_PREN")) return Error.throwErr(this.shift(), `Expected \`)\` to end the pattern group`)
        this.shift() // remove `)`
        patternValue = pattern.patternValues
        as = as.concat(pattern.as)
    } else {
        if(notLookAhead) return Error.throwErr(this.shift(), `Expected pattern value after \`!\` in pattern`)
        return null
    }

    if(notLookAhead && !Array.isArray(patternValue)) {
        return {
            patternValues: [patternValue],
            as: as,
        }
    } else if(Array.isArray(patternValue)) {
        patternValues = patternValues.concat(patternValue)
    } else { 
        patternValues.push(patternValue)
    }

    // Ors
    if(this.peek("OR")) {
        if(!as.every((el) => el == null)) {
            return Error.throwErr(this.shift(), `The \`|\` pattern operator cannot be combined with \`as\` within the same group`)
        }
        let orToken = this.shift() // remove `|`
        let pattern: RecursivePatternRerturn | null = this.parsePattern([], [], true, false);
        if(Error.hasError()) return null;
        if(pattern == null) return Error.throwErr(this.shift(), `Expected pattern value(s) to the right of \`|\` pattern operator`);
        if(as.length != pattern?.as.length) return Error.throwErr(orToken, `The left side of  \`|\` pattern operator must have the same number of pattern values as right side`)
        patternValues = [new PatternValueOr(patternValues, pattern.patternValues)]
    }

    // As variables
    if(this.peek("AS")) {
        if(inOr) return Error.throwErr(this.shift(), `Cannot use \`as\` in the middle of the \`|\` condition`)
        let identifiers: Token[] = []
        this.shift() // remove `as`
        if(this.peek("LEFT_PREN")) {
            this.shift() // remove `(`
            while(this.peek("IDENTIFIER")) {
                identifiers.push(this.shift())
            }
            if(identifiers.length===0) return Error.throwErr(this.shift(), `Expected variable name(s) in \`as\` group`)
            if(!this.peek("RIGHT_PREN")) return Error.throwErr(this.shift(), `Expected \`)\` to end \`as\` group`)
                this.shift() // remove `)`
        } else if(this.peek("IDENTIFIER")) {
            identifiers.push(this.shift());
        } else {
            return Error.throwErr(this.shift(), `Expected variable name or group of variable names after \`as\``)
        }
        let lastVarIndex = -1;
        for(var i = 0; i <= as.length; i++) {
            if(as[i] != null) {
                lastVarIndex = i;
            }
        }
        // Either var after last var (for too many variables)
        const index1 =  lastVarIndex + 1;
        // Or index at the end of the `as` arr to receive all variables
        const index2 = as.length - identifiers.length
        let index = Math.max(index1, index2)
        for(var identifier of identifiers) {
            if(as.length > index) {
                if(as.includes(identifier.lexeme)) return Error.throwErr(identifier, `Variable \`${identifier.lexeme}\` is already declared in the pattern`)
                as[index] = identifier.lexeme;
            } else {
                return Error.throwErr(identifier, `Too many variables for the number of pattern values`)
            }
            index += 1;
        }
    }
    let nextValue = this.parsePattern(patternValues, as, inOr, false)
    if(Error.hasError()) return null;
    if(nextValue == null) {
        return {
            patternValues: patternValues,
            as: as,
        }
    } else {
        return {
            patternValues: nextValue.patternValues,
            as: nextValue.as,
        }
    }
  }

  private parseExpression(left: Expression|null = null, operator:Token|null=null,returnNotValue:boolean): Expression | null {
    let expression: Expression;
    if(this.peek("NOT")) {
        this.shift() // Remove `!`
        let value = this.parseExpression(null, null, true);
        if(value === null) return Error.throwErr(this.shift(), `Expected value after \`!\` operator`)
        expression = new UnaryNotExpression(value)
    } else if(this.peek("LEFT_PREN")) { 
        this.shift() // remove `(`
        let innerExp: Expression | null = this.parseExpression(null, null,false);
        if(Error.hasError()) return null;
        if(innerExp == null) return Error.throwErr(this.shift(), `Expected expression after \`(\``)
        expression = innerExp;
        if(!this.peek("RIGHT_PREN")) return Error.throwErr(this.shift(), `Expected \`)\` to end expression`)
        this.shift() // remove `)`
    } else {
        let value = this.parseValueOrFunction(false);
        if(value === null) return null;
        expression = value;
    }
    if(returnNotValue) return expression;
    // Parse operators
    if(this.peekArr(["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL_TO", "LESS_THAN_OR_EQUAL_TO", "EQUAL_TO", "NOT_EQUAL_TO", "OR", "AND"])) {
        let nextOperator = this.shift()
        if(left && operator) {
            if(this.precedence(operator.type) >= this.precedence(nextOperator.type)) {
                let newLeft = new BinaryExpression(operator, left, expression)
                let returnExp = this.parseExpression(newLeft, nextOperator, false)
                if(Error.hasError()) return null;
                if(returnExp === null) return Error.throwErr(this.shift(), `Expected expression after \`${nextOperator.lexeme}\` expression operator`)
                return returnExp;
            } else {
                let newRight = this.parseExpression(expression, nextOperator, false)
                if(Error.hasError()) return null;
                if(newRight === null) return Error.throwErr(this.shift(), `Expected expression after \`${nextOperator.lexeme}\` expression operator`)
                return new BinaryExpression(operator, left, newRight)
            }
        } else {
            let returnExp = this.parseExpression(expression,nextOperator,false)
            if(Error.hasError()) return null;
            if(returnExp === null) return Error.throwErr(this.shift(), `Expected expression after \`${nextOperator.lexeme}\` expression operator`)
            return returnExp;
        }
    }
    if(left && operator) {
        return new BinaryExpression(operator, left, expression)
    }
    return expression; // Single value with no operator
  }

  private precedence(type:TT): number {
    switch(type) {
        case "AND":
            return 2
        case "OR":
            return 1
        default:
            return 3
    }
}

private toValType(token: Token): ValueType {
    let type: ValueType;
        switch (token.type) {
            case "STR":
              return "STR"
            case "NUM":
            return "NUM"
            case "BOOL":
                return "BOOL"
            case "TERM":
                return "TERM"
            default:
              return "NIL";
          }
}



  private prettyPrint(node: Node) {
    function serialize(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
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

  private prettyPrintExp(spaces: number, exp: Expression):string {
    let spacer = " ".repeat(spaces)
    if(exp instanceof BinaryExpression) {
        return `${spacer}Operator: ${exp.operator}
${spacer}left:
${spacer}${this.prettyPrintExp(spaces + 2, exp.left)}
${spacer}right:
${spacer}${this.prettyPrintExp(spaces + 2, exp.right)}`
    } else if(exp instanceof UnaryNotExpression) {
        return `${spacer}NOT:
${spacer}${this.prettyPrintExp(spaces + 2, exp.right)}`
    } else if(exp instanceof Function) {
        return `${spacer}FUNCTION:
${spacer}${exp.name}`
    } else if(exp instanceof Variable) {
        return `${spacer}${exp.name}`
    } else {
        return `${spacer}${exp.value}`
    }
  }
}

interface RecursivePatternRerturn {
    patternValues: PatternValue[];
    as: Array<string|null>;
}