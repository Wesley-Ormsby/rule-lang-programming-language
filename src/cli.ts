#!/usr/bin/env node
import { run } from "./main.js"
import fs from "fs";
import { resolve } from "path";

const [, , filepath] = process.argv;

const absPath = resolve(process.cwd(), filepath);

const reset = "\x1b[0m";
const bright = "\x1b[1m";
const red = "\x1b[31m";


if(filepath.split(".")[1] != "rul" && filepath.split(".")[1] != "txt") {
  console.log(`${bright}${red}Error${reset}${bright}: Invalid file extension. File must be '.rul' or '.txt'${reset}\n`)
} else {
  fs.readFile(absPath, "utf8", function (err, data) {
    if (err) {
      console.log(`${bright}${red}Error${reset}${bright}: File '${filepath}' does not exist${reset}\n`)
    } else {
      run(data, filepath);
    }
  });
}