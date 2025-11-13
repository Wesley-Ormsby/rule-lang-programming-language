import { type Token } from "./token.js";
import { colour } from "./utils/consoleUtils.js";

export interface ErrorInfo {
  readonly token: Token;
  readonly message: string;
  readonly code: string;
}

export interface ErrorReporter {
  throwAllErrs();
  pushErr(token: Token, message: string, code:string);
  throwErr(token: Token, message: string, code:string): null;
  hasError(): boolean;
}

export class ConsoleErrorReporter implements ErrorReporter {
  protected errors: ErrorInfo[];
  public readonly source: string;
  public readonly filePath: string;

  constructor(source: string, filePath: string) {
    this.errors = [];
    this.source = source;
    this.filePath = filePath;
  }

  public hasError() {
    return this.errors.length > 0;
  }

  // Throws all errors, used for the lexer where you can have multiple errors reported at the same time
  public throwAllErrs() {
    for (let err of this.errors) {
      this.reportErr(err);
    }
  }

  // Pushes an error without yet throwing them
  public pushErr(token: Token, message: string, code: string) {
    this.errors.push({ token, message,code });
  }

  // Throws an error
  public throwErr(token: Token, message: string, code:string): null {
    this.errors.push({ token, message, code});
    this.throwAllErrs();
    return null;
  }

  // Throws an error
  protected reportErr(err: ErrorInfo): null {
    const { token, message } = err;
    const lineNum = token.lineStart;
    const errStart = token.charStart;

    const line = this.source.split("\n")[lineNum - 1];
    let left = line.slice(0, errStart - 1).trimStart();
    let errStr = token.lexeme;
    let right = line.slice(left.length + errStr.length).trimEnd();

    const maxSize = 80;
    if (left.length + errStr.length > maxSize) {
      if (errStr.length > maxSize / 2 && left.length > maxSize) {
        // Both left and error token are more than 50% of the max size, so cut both off
        errStr = errStr.substring(0, maxSize / 2 - 3);
        right = "...";
        left = "... " + left.substring(4 + left.length - maxSize / 2);
      } else if (errStr.length > maxSize / 2) {
        // Error token takes up more than 50%, use all of left and cut the error token
        errStr = errStr.substring(0, maxSize - left.length - 3);
        right = "...";
      } else {
        // The left takes up more than 50%, use all of the error and cut the left
        left = "... " + left.substring(4 + maxSize - errStr.length);
        right = "";
      }
    } else if (left.length + errStr.length + right.length > maxSize) {
      right =
        right.substring(0, maxSize - left.length - errStr.length - 3) + "...";
    }
    // Otherwise, we can keep left, errStr and right

    let fullError =
      `${colour.bright(colour.red("Error"))}${colour.bright(`: ${message}`)}\n` +
      `   ${colour.blue("-->")} ${this.filePath}${lineNum}:${errStart}\n` +
      `   ${colour.blue(" ".repeat(String(lineNum).length) + " |")} \n` +
      `   ${colour.blue(`${lineNum} |`)} ${left}${colour.red(errStr)}${right}\n` +
      `   ${colour.blue(" ".repeat(String(lineNum).length) + " |")} ${colour.red(`${" ".repeat(left.length)}${"^".repeat(errStr.length)}`)}\n`;
    console.log(fullError);

    return null;
  }
}
