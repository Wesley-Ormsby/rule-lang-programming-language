export type TT =
  // Values
  | "NUM"
  | "STR"
  | "BOOL"
  | "TERM"
  | "NIL"

  // Function call or variable
  | "IDENTIFIER"

  // Symbols
  | "LEFT_PREN"
  | "RIGHT_PREN"
  | "LEFT_SQUARE"
  | "RIGHT_SQUARE"

  // Matches
  | "REPLACE_MATCH"
  | "PUSH_END_MATCH"
  | "PUSH_BEGIN_MATCH"
  | "REMOVE_MATCH"
  | "RULE_MATCH"

  // Keywords
  | "NUM_TYPE"
  | "STR_TYPE"
  | "BOOL_TYPE"
  | "TERM_TYPE"
  | "ANY_TYPE"
  | "BEGIN"
  | "END"
  | "AS"
  | "IF"

  // Logicals
  | "NOT"
  | "OR"
  | "AND"

  // Other Operators
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_THAN_OR_EQUAL_TO"
  | "LESS_THAN_OR_EQUAL_TO"
  | "EQUAL_TO"
  | "NOT_EQUAL_TO"

  // End of file
  | "EOF";

// Token interface
export interface Token {
  type: TT;
  char_start: number;
  char_end: number;
  line_start: number;
  lexeme: string;
}
