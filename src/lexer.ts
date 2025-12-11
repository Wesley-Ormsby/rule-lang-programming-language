import { ErrorReporter } from "./error.js";
import { type TT, type Token } from "./token.js";

// These tokens are all single character and don't prepend other tokens (like `<` is used in `<=`)
const singleCharTokens: Record<string, TT> = {
  "[": "LEFT_SQUARE",
  "]": "RIGHT_SQUARE",
  "(": "LEFT_PREN",
  ")": "RIGHT_PREN",
  "|": "OR",
  "&": "AND",
};

const KEYWORDS: Record<string, TT> = {
  true: "BOOL",
  false: "BOOL",
  nil: "NIL",
  num: "NUM_TYPE",
  str: "STR_TYPE",
  bool: "BOOL_TYPE",
  term: "TERM_TYPE",
  any: "ANY_TYPE",
  begin: "BEGIN",
  end: "END",
  as: "AS",
  if: "IF",
  import: "IMPORT",
  from: "FROM",
  def: "DEF",
};

export class Lexer {
  private charStart: number;
  private charEnd: number;
  private lineStart: number;
  private lineEnd: number;
  private lexeme: string;
  private readonly source: string;
  private tokenList: Token[];
  private errorToken: Token | false;
  private pos: number;
  private errReporter: ErrorReporter;

  constructor(source: string, reporter: ErrorReporter) {
    this.source = source;
    this.charStart = 1;
    this.charEnd = 0;
    this.lineStart = 1;
    this.lineEnd = 1;
    this.lexeme = "";
    this.tokenList = [];
    this.errorToken = false;
    this.pos = 0;
    this.errReporter = reporter;
    this.lexSource();
  }

  // Public access of token list
  public getTokenList(): Token[] {
    return this.tokenList;
  }

  // Lex source into a token list
  private lexSource() {
    while (this.charsToScan()) {
      this.lex();
    }
    // If there was an invalid token at the end of the file
    if (this.errorToken) {
      this.errReporter.pushErr(
        this.updateErrorToken(),
        "Unexpected token",
        "100001"
      );
    }
    if (this.errReporter.hasError()) {
      this.errReporter.throwAllErrs();
      return;
    }

    // Push EOF token
    this.tokenList.push({
      type: "EOF",
      charStart: this.charStart,
      charEnd: this.charStart,
      lineStart: this.lineStart,
      lexeme: " ",
    });
  }

  // Remove a character from the source and add to lexeme
  private consume() {
    this.charEnd += 1;
    this.lexeme += this.source[this.pos++];
  }

  // Add a token to the token list
  private addToken(tokenType: TT) {
    if (this.errorToken) {
      this.errReporter.pushErr(
        this.updateErrorToken(),
        "Unexpected token",
        "100001"
      );
      this.errorToken = false;
    }
    this.tokenList.push({
      type: tokenType,
      charStart: this.charStart,
      charEnd: this.charEnd,
      lineStart: this.lineStart,
      lexeme: this.lexeme,
    });
    this.charStart = this.charEnd + 1;
    this.lineStart = this.lineEnd;
    this.lexeme = "";
  }

  // Consumes and adds token
  private consumeAdd(tokenType: TT) {
    this.consume();
    this.addToken(tokenType);
  }

  // Returns char at current position
  private peek(offset: number = 0): string {
    return this.source[this.pos + offset];
  }

  // Return whether if there is a top value and it matches with `char`
  private peekEq(char: string): boolean {
    return this.charsToScan() >= 1 && this.peek() === char;
  }

  private isAlpha(char: string): boolean {
    return (char >= "A" && char <= "Z") || (char >= "a" && char <= "z");
  }
  private isNumeric(char: string): boolean {
    return char >= "0" && char <= "9";
  }
  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isNumeric(char) || char === "_";
  }

  // Returns how many characters are left to scan
  private charsToScan() {
    return this.source.length - this.pos;
  }

  // Lex a number
  private lexNumber() {
    while (this.charsToScan() && this.isNumeric(this.peek())) {
      this.consume();
    }
    if (this.peekEq(".")) {
      this.consume();
      while (this.charsToScan() && this.isNumeric(this.peek())) {
        this.consume();
      }
    }
    this.addToken("NUM");
  }

  // Updates the error token and returns it
  private updateErrorToken() {
    this.errorToken = {
      type: "EOF",
      charStart: this.charStart,
      charEnd: this.charEnd,
      lineStart: this.lineStart,
      lexeme: this.lexeme,
    };
    return this.errorToken;
  }

  private lex() {
    const char: string = this.peek();
    // Deal with simple 1-character tokens
    if (char in singleCharTokens) {
      this.consumeAdd(singleCharTokens[char]);
      return;
    }

    switch (char) {
      case ">":
        this.consume();
        if (this.peekEq(">")) {
          this.consumeAdd("PUSH_END_MATCH");
        } else if (this.peekEq("=")) {
          this.consumeAdd("GREATER_THAN_OR_EQUAL_TO");
        } else {
          this.addToken("GREATER_THAN");
        }
        break;
      case "<":
        this.consume();
        if (this.peekEq("<")) {
          this.consumeAdd("PUSH_BEGIN_MATCH");
        } else if (this.peekEq("=")) {
          this.consumeAdd("LESS_THAN_OR_EQUAL_TO");
        } else {
          this.addToken("LESS_THAN");
        }
        break;
      case "!":
        this.consume();
        if (this.peekEq(">")) {
          this.consumeAdd("REMOVE_MATCH");
        } else if (this.peekEq("=")) {
          this.consumeAdd("NOT_EQUAL_TO");
        } else {
          this.addToken("NOT");
        }
        break;
      case "=":
        this.consume();
        if (this.peekEq(">")) {
          this.consumeAdd("RULE_MATCH");
        } else {
          this.addToken("EQUAL_TO");
        }
        break;
      case ":":
        this.consume();
        if (this.peekEq("=")) {
          this.consumeAdd("ASSIGN");
        } else {
          this.updateErrorToken();
        }
        break;
      case "-":
        this.consume();
        if (this.peekEq(">")) {
          this.consumeAdd("REPLACE_MATCH");
        } else if (this.charsToScan() && this.isNumeric(this.peek())) {
          this.lexNumber();
        } else {
          // There is an invalid token
          this.updateErrorToken();
        }
        break;
      // Whitespace (spaces and tabs)
      case " ":
      case "  ":
        if (this.errorToken) {
          this.errReporter.pushErr(
            this.updateErrorToken(),
            "Unexpected token",
            "100001"
          );
          this.errorToken = false;
        }
        this.charStart += 1;
        this.charEnd += 1;
        this.pos += 1;
        break;
      // Newlines
      case "\n":
        if (this.errorToken) {
          this.errReporter.pushErr(
            this.updateErrorToken(),
            "Unexpected token",
            "100001"
          );
          this.errorToken = false;
        }
        this.charStart = 1;
        this.charEnd = 0;
        this.lineStart += 1;
        this.lineEnd += 1;
        this.pos += 1;
        break;
      // Strings
      case '"':
        this.consume();
        const errorToken: Token = {
          type: "STR",
          charStart: this.charStart,
          charEnd: this.charEnd,
          lineStart: this.lineStart,
          lexeme: '"',
        };
        while (this.charsToScan() >= 1 && !this.peekEq('"')) {
          if (this.charsToScan() >= 2 && this.peek() === "\\") {
            if (this.peek(1) == "\\") {
              this.charEnd += 2;
              this.pos += 2;
              this.lexeme += "\\";
            } else if (this.peek(1) == "n") {
              this.charEnd += 2;
              this.pos += 2;
              this.lexeme += "\n";
            } else if (this.peek(1) == '"') {
              this.charEnd += 2;
              this.pos += 2;
              this.lexeme += '"';
            } else {
              this.consume();
            }
          } else {
            this.consume();
          }
        }
        if (this.charsToScan() === 0) {
          this.errReporter.throwErr(
            errorToken,
            "Unterminated string",
            "100002"
          );
          return;
        }
        this.consume();
        this.lexeme = this.lexeme.substring(1, this.lexeme.length - 1);
        this.addToken("STR");
        break;
      // Comments
      case "#":
        // Multiline
        if (this.charsToScan() >= 2 && this.peek(1) === "[") {
          while (this.charsToScan()) {
            if (
              this.charsToScan() >= 2 &&
              this.peek() === "]" &&
              this.peek(1) === "#"
            ) {
              this.charStart += 2;
              this.charEnd += 2;
              this.pos += 2;
              break;
            }
            if (this.peek() === "\n") {
              this.lineStart += 1;
              this.lineEnd += 1;
              this.charStart = 1;
              this.charEnd = 0;
            } else {
              this.charStart += 1;
              this.charEnd += 1;
            }
            this.pos += 1;
          }
        } else {
          // Single line (leave newline)
          while (this.charsToScan() && this.peek() !== "\n") {
            this.pos += 1;
          }
        }
        break;
      default:
        // Bools, Nils, Terms, and Keywords
        if (this.isAlpha(char)) {
          while (this.isAlphaNumeric(this.peek())) {
            this.consume();
          }
          if (char >= "A" && char <= "Z") {
            this.addToken("TERM");
          } else if (this.lexeme in KEYWORDS) {
            this.addToken(KEYWORDS[this.lexeme]);
          } else {
            this.addToken("IDENTIFIER");
          }
        } else if (this.isNumeric(char)) {
          this.lexNumber();
        } else {
          // No token was lexed, meaning this is the start of an unexpected token
          this.consume();
          this.updateErrorToken();
        }
    }
  }
}
