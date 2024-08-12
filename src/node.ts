import { type TT, type Token } from "./token.js";

export type Node = Rule | Scope | ValueOrFunction | PatternValue | Expression;

/* RULES + SCOPES */
export class Rule {
  public pattern: PatternValue[];
  // Scopes have match type as well!
  public expression: Expression | null;
  public scopes: Scope[];
public variables: Array<string|null>;
  constructor(
    pattern: PatternValue[],
    expression: Expression | null,
    scopes: Scope[],
    variables: Array<string|null>
  ) {
    this.pattern = pattern;
    this.expression = expression;
    this.scopes = scopes;
    this.variables = variables;
  }
}
export type Scope = ValueScope | RuleScope;
export class ValueScope {
  public operator: TT;
  public scope: ValueOrFunction[];
  constructor(operatorToken: Token, scope: ValueOrFunction[]) {
    this.operator = operatorToken.type;
    this.scope = scope;
  }
}
export class RuleScope {
  public operator: TT;
  public customs: Rule[] | null;
  public begin: Scope[] | null;
  public end: Scope[] | null;
  constructor(
    begin: Scope[] | null,
    customs: Rule[] | null,
    end: Scope[] | null
  ) {
    this.customs = customs;
    this.begin = begin;
    this.end = end;
  }
}
/* VALUES */
export type ValueOrFunction = Value | Function | Variable;

export type ValueType = "STR" | "NUM" | "BOOL" | "NIL" | "TERM" | "ANY";
export class Value {
  public value: string;
  public push: boolean;
  public token: Token;
  public type: ValueType;

  constructor(token: Token, type: ValueType, push: boolean) {
    this.token = token;
    this.value = token.lexeme;
    this.type = type;
    this.push = push;
  }
}
export class Variable {
  public name: string;
  public push: boolean;
  public token: Token;

  constructor(token: Token, push: boolean) {
    this.token = token;
    this.name = token.lexeme;
    this.push = push;
  }
}
export class Function {
  public name: string;
  public parms: ValueOrFunction[];
  public push: boolean;
  public token: Token;
  constructor(token: Token, parms: ValueOrFunction[], push = false) {
    this.token = token;
    this.name = token.lexeme;
    this.parms = parms;
    this.push = push;
  }
}

/* PATTERN */
export type PatternValue =
  | Value
  | PatternValueType
  | PatternValueOr
  | PatternValueNot
  | PatternValue[];

export class PatternValueType {
  public type: string;
  constructor(token: Token) {
    this.type = token.type;
  }
}
export class PatternValueOr {
  public left: PatternValue;
  public right: PatternValue;
  constructor(left: PatternValue, right: PatternValue) {
    this.left = left;
    this.right = right;
  }
}
export class PatternValueNot {
  public right: PatternValue;
  constructor(right: PatternValue) {
    this.right = right;
  }
}
/* EXPRESSIONS */
export type Expression =
  | ValueOrFunction
  | BinaryExpression
  | UnaryNotExpression;
export class BinaryExpression {
  public left: Expression;
  public operator: TT;
  public right: Expression;
  public token: Token;
  constructor(token: Token, left: Expression, right: Expression) {
    this.operator = token.type;
    this.token = token
    this.left = left;
    this.right = right;
  }
}
export class UnaryNotExpression {
  public right: Expression;
  constructor(right: Expression) {
    this.right = right;
  }
}
