import { test } from "./testRunner.js";

export async function runLexerTests() {
  await test("Unexpected token", `1 $%* 8`, [], ["100001"]);
  await test("Unexpected token [at end of file]", `1 $%*`, [], ["100001"]);
  await test("Unexpected Token [at newline]", `1 $%*\n1`, [], ["100001"]);
  await test("Unexpected `-` [at end of file]", `1-`, [], ["100001"]);
  await test("Unterminated string", `1 "34`, [], ["100002"]);
}
