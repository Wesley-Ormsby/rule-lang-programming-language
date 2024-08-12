import { type TT, type Token } from "./token.js";

export class Error {
  private static errored: boolean = false;
  public static source: string = "";
  public static filePath:string = "";
  public static testing:boolean = false;

  static hasError() {
    return this.errored;
  }
  static testingRemoveError() {
    this.errored = false;
  }

  static throwErr(token: Token, message: string): null {
    const lineNum = token.line_start;
    const errStart = token.char_start;
    let errStr = token.lexeme;
    const lineStr = this.source.split("\n")[lineNum - 1];
    let leftStr = lineStr.slice(0, errStart - 1);
    let rightStr = lineStr.slice(leftStr.length + errStr.length);
    leftStr = leftStr.trimStart();
    rightStr = rightStr.trimEnd();
    const reset = "\x1b[0m";
    const bright = "\x1b[1m";
    const red = "\x1b[31m";
    const blue = "\x1b[94m";

    let leftLine = "";
    let rightLine = "";
    if (errStr.length >= 80) {
      errStr = errStr.slice(0, 76);
      rightLine = " ...";
    } else if (leftStr.length + errStr.length + rightStr.length <= 80) {
      leftLine = leftStr;
      rightLine = rightStr;
    } else if (leftStr.length > 80 - errStr.length) {
      console.log("THIS");
      if (rightStr) {
        leftLine =
          "... " + leftStr.slice(leftStr.length - 80 - errStr.length + 8);
        rightLine += " ...";
      } else {
        leftLine =
          "... " + leftStr.slice(leftStr.length - 80 - errStr.length + 4);
      }
    } else {
      leftLine = leftStr;
      rightLine =
        rightStr.slice(
          0,
          80 - leftLine.length - rightLine.length - errStr.length - 4
        ) + " ...";
    }
    let fullError = `${bright}${red}Error${reset}${bright}: ${message}${reset}${blue}
 --> ${reset}${this.filePath}${lineNum}:${errStart}
 ${blue}${" ".repeat(String(lineNum).length)} | 
 ${lineNum} | ${reset}${leftLine}${errStr}${rightLine}
 ${blue}${" ".repeat(String(lineNum).length)} | ${reset}${red}${" ".repeat(leftLine.length)}${"^".repeat(errStr.length)}${reset}`;
    if(this.testing) {
        fullError = fullError.split(`\n`).join("\n  ")
    }
    console.log(fullError);

    this.errored = true;
    return null;
  }
}
