#!/usr/bin/env node
import { run } from "./main.js";
import fs from "fs";
import path from "path";
import { resolve, dirname } from "path";
import { ConsoleErrorReporter } from "./error.js";
import { colour } from "./utils/consoleUtils.js";

if (process.argv.length < 3) {
  console.log("Usage: rule <file.rule>");
} else {
  const [, , filepath] = process.argv;

  const absPath = resolve(process.cwd(), filepath);
  const baseDir = dirname(absPath);

  const extension = path.extname(filepath).toLowerCase();
  if (!filepath) {
    console.log("Usage: rule <file.rule>");
  } else if (extension != ".rul" && extension != ".txt") {
    console.log(
      colour.bright(colour.red("Error")) +
        colour.bright(
          ": Invalid file extension. File must be '.rul' or '.txt'\n"
        )
    );
  } else {
    fs.readFile(absPath, "utf8", function (err, data) {
      if (err) {
        console.log(
          colour.bright(colour.red("Error")) +
            colour.bright(`: Could not read '${filepath}'\n`)
        );
      } else {
        run(data, new ConsoleErrorReporter(data, filepath), baseDir);
      }
    });
  }
}