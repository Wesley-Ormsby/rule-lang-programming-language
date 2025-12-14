import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { ErrorReporter } from "./error.js";
import { Runtime } from "./runtime.js";
import { RecordVal } from "./record.js";

export async function run(
  source: string,
  errorReporter: ErrorReporter,
  baseDirectory: string
): Promise<RecordVal[] | null> {
  const lexer = new Lexer(source, errorReporter);
  if (!errorReporter.hasError()) {
    const parser = new Parser(lexer.getTokenList(), errorReporter);
    if (!errorReporter.hasError()) {
      const parserResults = parser.getParserResults()
      const runtime = new Runtime(parserResults.ast, parserResults.imports, parserResults.defs, errorReporter, baseDirectory);
      await runtime.init()
      if (!errorReporter.hasError()) {
        return runtime.getRecord();
      }
    }
  }
  return null;
}