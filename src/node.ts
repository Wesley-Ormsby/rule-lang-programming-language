import { type TT, type Token } from "./token.js";

export type Node = RuleNode | ScopeNode | ValueOrFunctionNode | PatternNode | ExprNode;
export type ScopeNode = ValueScopeNode | RuleScopeNode;
export type ValueOrFunctionNode = ValueNode | FunctionNode | VariableNode;
export type ValueType = "STR" | "NUM" | "BOOL" | "NIL" | "TERM" | "ANY";
export type PatternNode =
  | ValueNode
  | PatternTypeNode
  | PatternOrNode
  | PatternNotNode
  | PatternGroupNode;
export type ExprNode =
  | ValueOrFunctionNode
  | BinaryExprNode
  | NotExprNode;

/* RULES + SCOPES */
export interface RuleNode {
  kind: "Rule";
  pattern: PatternGroupNode;
  expression: ExprNode | null;
  scopes: ScopeNode[];
  variables: Array<string | null>;
}
export interface ValueScopeNode {
  kind: "ValueScope";
  operator: TT;
  scope: ValueOrFunctionNode[];
}
export interface RuleScopeNode {
  kind: "RuleScope";
  customs: RuleNode[] | null;
  begin: ScopeNode[] | null;
  end: ScopeNode[] | null;
}

/* VALUES */
export interface ValueNode {
  kind: "Value";
  value: string;
  push: boolean;
  token: Token;
  type: ValueType;
}
export interface VariableNode {
  kind: "Variable";
   name: string;
   push: boolean;
   token: Token;
}
export interface FunctionNode {
  kind: "Function";
   name: string;
   params: ValueOrFunctionNode[];
   push: boolean;
   token: Token;
}

/* PATTERN */
export interface PatternGroupNode {
  kind:"PatternGroup"
  patterns:PatternNode[]
}
export interface PatternTypeNode {
  kind: "PatternType";
  type: string;
}
export interface PatternOrNode {
  kind: "PatternOr";
   left: PatternNode;
   right: PatternNode;
}
export interface PatternNotNode {
  kind: "PatternNot";
   right: PatternNode;
}

/* EXPRESSIONS */
export interface BinaryExprNode {
  kind: "BinaryExpr"
   left: ExprNode;
   operator: TT;
   right: ExprNode;
   token: Token;
}
export interface NotExprNode {
  kind: "NotExpr"
  right: ExprNode;
}
