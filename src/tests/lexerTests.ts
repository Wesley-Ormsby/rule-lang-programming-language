import { test } from "./testRunner.js";

export async function runLexerTests() {
  test("Unexpected token", `1 $%* 8`, [], ["100001"]);
  test("Unexpected token [at end of file]", `1 $%*`, [], ["100001"]);
  test("Unexpected Token [at newline]", `1 $%*\n1`, [], ["100001"]);
  test("Unexpected `-` [at end of file]", `1-`, [], ["100001"]);
  test("Unterminated string", `1 "34`, [], ["100002"]);
}
