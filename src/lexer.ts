import { type TT, type Token } from "./token.js";
import { Error } from "./error.js";
import { Console } from "console";

export class Lexer {
  private charStart: number;
  private charEnd: number;
  private lineStart: number;
  private lineEnd: number;
  private lexeme: string;
  private source: string;
  private tokenList: Token[];
  private errorToken: Token | false;

  constructor(source: string) {
    this.source = source;
    this.charStart = 1;
    this.charEnd = 0;
    this.lineStart = 1;
    this.lineEnd = 1;
    this.lexeme = "";
    this.tokenList = [];
    this.errorToken = false;
    this.errorToken;
    this.lexSource();
  }

  // Public access of token list
  public getTokenList(): Token[] {
    return this.tokenList;
  }

  // Lex source into a token list
  private lexSource() {
    while (this.source.length) {
      this.lex();
      if (Error.hasError()) {
        return;
      }
    }
    // If there was an invalid token at the end of the file
    if (this.errorToken) {
      Error.throwErr(this.errorToken, "Unexpected token");
      return;
    }

    // Push EOF token
    this.tokenList.push({
      type: "EOF",
      char_start: this.charStart,
      char_end: this.charStart,
      line_start: this.lineStart,
      lexeme: " ",
    });
  }

  // Remove a character from the source and add to lexeme
  private consume() {
    this.charEnd += 1;
    this.lexeme += this.source[0];
    this.source = this.source.substring(1);
  }

  // Add a token to the token list
  private addToken(tokenType: TT) {
    if (this.errorToken) {
      Error.throwErr(this.errorToken, "Unexpected token");
      return;
    }
    this.tokenList.push({
      type: tokenType,
      char_start: this.charStart,
      char_end: this.charEnd,
      line_start: this.lineStart,
      lexeme: this.lexeme,
    });
    this.charStart = this.charEnd + 1;
    this.lineStart = this.lineEnd;
    this.lexeme = "";
  }

  // Return whether if there is a top value and it matches with `char`
  private peek(char: string): boolean {
    return this.source.length >= 1 && this.source[0] === char;
  }

  private isAlpha(char: string): boolean {
    return (char >= "A" && char <= "Z") || (char >= "a" && char <= "z");
  }
  private isNumberic(char: string): boolean {
    return char >= "0" && char <= "9";
  }
  private isAlphaNumberic(char: string): boolean {
    return this.isAlpha(char) || this.isNumberic(char)  || char === "_";
  }

  // Lex a number
  private lexNumber() {
    while(this.source.length && this.isNumberic(this.source[0])) {
      this.consume();
    }
    if(this.peek(".")) {
      this.consume();
      while(this.source.length && this.isNumberic(this.source[0])) {
        this.consume();
      }
    }
    this.addToken("NUM")
  }

  private lex() {
    // Update error token is there will be an error
    if (this.errorToken) {
      this.errorToken = {
        type: "EOF",
        char_start: this.charStart,
        char_end: this.charEnd,
        line_start: this.lineStart,
        lexeme: this.lexeme,
      };
    }
    const char: string = this.source[0];
    switch (char) {
      case "[":
        this.consume();
        this.addToken("LEFT_SQUARE");
        break;
      case "]":
        this.consume();
        this.addToken("RIGHT_SQUARE");
        break;
      case "(":
        this.consume();
        this.addToken("LEFT_PREN");
        break;
      case ")":
        this.consume();
        this.addToken("RIGHT_PREN");
        break;
      case ">":
        this.consume();
        if (this.peek(">")) {
          this.consume();
          this.addToken("PUSH_END_MATCH");
        } else if (this.peek("=")) {
          this.consume();
          this.addToken("GREATER_THAN_OR_EQUAL_TO");
        } else {
          this.addToken("GREATER_THAN");
        }
        break;
      case "<":
        this.consume();
        if (this.peek("<")) {
          this.consume();
          this.addToken("PUSH_BEGIN_MATCH");
        } else if (this.peek("=")) {
          this.consume();
          this.addToken("LESS_THAN_OR_EQUAL_TO");
        } else {
          this.addToken("LESS_THAN");
        }
        break;
      case "|":
        this.consume();
        this.addToken("OR");
        break;
      case "&":
        this.consume();
        this.addToken("AND");
        break;
      case "!":
        this.consume();
        if (this.peek(">")) {
          this.consume();
          this.addToken("REMOVE_MATCH");
        } else if (this.peek("=")) {
          this.consume();
          this.addToken("NOT_EQUAL_TO");
        } else {
          this.addToken("NOT");
        }
        break;
      case "=":
        this.consume();
        if (this.peek(">")) {
          this.consume();
          this.addToken("RULE_MATCH");
        } else {
          this.addToken("EQUAL_TO");
        }
        break;
      case "-":
        this.consume();
        if (this.peek(">")) {
          this.consume();
          this.addToken("REPLACE_MATCH");
        } else if(this.source.length && this.isNumberic(this.source[0])) {
          this.lexNumber()
        } else {
          this.errorToken = {
            type: "EOF",
            char_start: this.charStart,
            char_end: this.charEnd,
            line_start: this.lineStart,
            lexeme: this.lexeme,
          };
        }
        break;
      // Whitespace (spaces and tabs)
      case " ":
      case "  ":
        if (this.errorToken) {
          Error.throwErr(this.errorToken, "Unexpected token");
          return;
        }
        this.charStart += 1;
        this.charEnd += 1;
        this.source = this.source.substring(1);
        break;
      // Newlines
      case "\n":
        if (this.errorToken) {
          Error.throwErr(this.errorToken, "Unexpected token");
          return;
        }
        this.charStart = 1;
        this.charEnd = 0;
        this.lineStart += 1;
        this.lineEnd += 1;
        this.source = this.source.substring(1);
        break;
      // Strings
      case '"':
        this.consume();
        const errorToken: Token = {
          type: "STR",
          char_start: this.charStart,
          char_end: this.charEnd,
          line_start: this.lineStart,
          lexeme: "\""
        }
        while (this.source.length >= 1 && !this.peek('"')) {
          if (this.source.length >= 2 && this.source[0] === "\\") {
            if (this.source[1] == "\\") {
              this.charEnd += 2;
              this.source = this.source.substring(2);
              this.lexeme += "\\";
            } else if (this.source[1] == "n") {
              this.charEnd += 2;
              this.source = this.source.substring(2);
              this.lexeme += "\n";
            } else if (this.source[1] == '"') {
              this.charEnd += 2;
              this.source = this.source.substring(2);
              this.lexeme += '"';
            } else {
              this.consume();
            }
          } else {
            this.consume();
          }
        }
        if(this.source.length === 0) {
          Error.throwErr(errorToken, "Unterminated string")
          return;
        }
        this.consume();
        this.lexeme = this.lexeme.substring(1, this.lexeme.length - 1);
        this.addToken("STR")
        break;
      // Comments
      case "#":
        if (this.source.length >= 2 && this.source[1] === "[") {
          while (this.source.length) {
            if (
              this.source.length >= 2 &&
              this.source[0] === "]" &&
              this.source[1] === "#"
            ) {
              this.charStart += 2;
              this.charEnd += 2;
              this.source = this.source.substring(2);
              break;
            }
            if (this.source[0] === "\n") {
              this.lineStart += 1;
              this.lineEnd += 1;
              this.charStart = 1;
              this.charEnd = 0;
            } else {
              this.charStart += 1;
              this.charEnd += 1;
            }
            this.source = this.source.substring(1);
          }
          // Multiline
        } else {
          // Single line (leave newline)
          while (this.source.length && this.source[0] !== "\n") {
            this.source = this.source.substring(1);
          }
        }
        break;
      default:
        // Bools, Nils, Terms, and Keywords
        if (this.isAlpha(char)) {
          while (this.isAlphaNumberic(this.source[0])) {
            this.consume();
          }
          if (char >= "A" && char <= "Z") {
            this.addToken("TERM");
          } else
            switch (this.lexeme) {
              case "true":
              case "false":
                this.addToken("BOOL");
                break;
              case "nil":
                this.addToken("NIL");
                break;
              case "num":
                this.addToken("NUM_TYPE");
                break;
              case "str":
                this.addToken("STR_TYPE");
                break;
              case "bool":
                this.addToken("BOOL_TYPE");
                break;
              case "term":
                this.addToken("TERM_TYPE");
                break;
              case "any":
                this.addToken("ANY_TYPE");
                break;
              case "begin":
                this.addToken("BEGIN");
                break;
              case "end":
                this.addToken("END");
                break;
              case "as":
                this.addToken("AS");
                break;
              case "if":
                this.addToken("IF");
                break;
              default:
                this.addToken("IDENTIFIER");
            }
        } else if(this.isNumberic(char)) {
          this.lexNumber()
        } else {
          // No token was lexed, meaning this is the start of an unexpected token
          this.consume();
          this.errorToken = {
            type: "EOF",
            char_start: this.charStart,
            char_end: this.charEnd,
            line_start: this.lineStart,
            lexeme: this.lexeme,
          };
        }
    }
  }
}
