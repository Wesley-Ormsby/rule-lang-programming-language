import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { ErrorReporter } from "./error.js";
import { Runtime } from "./runtime.js";
import { RecordVal } from "./record.js";

export function run(
  source: string,
  errorReporter: ErrorReporter
): RecordVal[] | null {
  const lexer = new Lexer(source, errorReporter);
  if (!errorReporter.hasError()) {
    const parser = new Parser(lexer.getTokenList(), errorReporter);
    if (!errorReporter.hasError()) {
      const runtime = new Runtime(parser.getAST(), errorReporter);
      if (!errorReporter.hasError()) {
        return runtime.getRecord();
      }
    }
  }
  return null;
}