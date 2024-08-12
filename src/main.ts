import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { Error } from "./error.js";
import { Runtime } from "./runtime.js";

export function run(source:string, filePath:string, testing:boolean=false) {
  Error.source = source;
  Error.filePath = filePath;
  Error.testing = testing;
  const lexer = new Lexer(source);
  if(!Error.hasError()) {
    const parser = new Parser(lexer.getTokenList())
    if(!Error.hasError()) {
      const runtime = new Runtime(parser.getAST())
      if(testing) {
        return runtime.getRecord();
      }
    }
  }
}
// npm run run
// npm run dev
