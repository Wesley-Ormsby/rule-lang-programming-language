import { ErrorReporter } from "../error.js";
import { FileLibrary } from "../libraries/fileLib.js";
import { MathLibrary } from "../libraries/mathLib.js";
import { StrLibrary } from "../libraries/strLib.js";
import { ValueType, ValueOrFunctionNode } from "../node.js";
import { RecordVal } from "../record.js";
import { RunContext } from "../runtime.js";

export type Library = Record<string, ModuleFunction>;

export const LIBRARIES: Record<string, Library> = {
  math: MathLibrary,
  string: StrLibrary,
  file: FileLibrary,
};

export interface ModuleFunction {
  params: ValueType[];
  variadic?: ValueType;
  run: (
    params: RecordVal[],
    runContext: RunContext
  ) => Promise<RecordVal | null>;
  safe: boolean;
  lazy: boolean;
}

export function format(
  strIndex: number,
  parametersIndex: number,
  params: RecordVal[],
  paramTokens: ValueOrFunctionNode[],
  errorReporter: ErrorReporter
): null | string {
  const template = params[strIndex].value;
  const flagChars = new Set([">", "^", "+", "_", ","]);
  let i = 0;
  let newStr = "";
  let paramIndex = parametersIndex;
  while (i < template.length) {
    // Add non-placeholder characters to formatted string
    if (template[i] !== "%") {
      newStr += template[i++];
      continue;
    }
    i += 1;

    // `%%` becomes `%` in formatted string
    if (i < template.length && template[i] === "%") {
      newStr += "%";
      i += 1;
      continue;
    }

    // Otherwise we are dealing with a placeholder
    let flags: Set<string> = new Set();
    while (flagChars.has(template[i])) {
      if (template[i] == ">") {
        flags.add(">");
        flags.delete("^");
      } else if (template[i] == "^") {
        flags.add("^");
        flags.delete(">");
      } else if (template[i] == "+") {
        flags.add("+");
        flags.delete("_");
      } else if (template[i] == "_") {
        flags.add("_");
        flags.delete("+");
      } else {
        flags.add(template[i]);
      }
      i += 1;
    }

    let widthStr = "";
    while (isNumeric(template[i])) {
      widthStr += template[i++];
    }
    const width = widthStr.length ? Number(widthStr) : 0;

    let precision: number = NaN;
    if (
      template[i] == "." &&
      i + 1 < template.length &&
      isNumeric(template[i + 1])
    ) {
      i += 1;
      let precisionStr = "";
      while (isNumeric(template[i])) {
        precisionStr += template[i++];
      }
      precision = Number(precisionStr);
    }

    if (template[i] == "!") i += 1;

    // Add the parameter to the string
    if (paramIndex >= paramTokens.length) {
      return errorReporter.throwErr(
        paramTokens[strIndex].token,
        "Too few parameters for the number of placeholders in the format string",
        "4000011"
      );
    }
    let placeholderToken = params[paramIndex++];
    let placeholder: string = placeholderToken.value;

    if (placeholderToken.type == "NUM") {
      let [intPart, fracPart] = String(Number(placeholder)).split(".")
      if(!fracPart) fracPart = "";
      if (flags.has(",")) {
        intPart = new Intl.NumberFormat(Intl.getCanonicalLocales(), {
          useGrouping: true,
        }).format(Number(intPart));
      }

      placeholder = intPart;

      if (!Number.isNaN(precision)) {
        fracPart = fracPart.substring(0, precision);
        fracPart += "0".repeat(precision - fracPart.length);
      }

      if(precision != 0 && fracPart) {
        placeholder += "." + fracPart
      }

      if (flags.has("+") && Number(placeholderToken.value) >= 0) {
        placeholder = "+" + placeholder;
      }

      if (flags.has("_") && Number(placeholderToken.value) >= 0) {
        placeholder = " " + placeholder;
      }
    }

    // Deal with width
    if (placeholder.length < width) {
      if (flags.has(">")) {
        placeholder = placeholder.padStart(width);
      } else if (flags.has("^")) {
        const diff = width - placeholder.length;
        const right = Math.ceil(diff / 2);
        const left = diff - right;
        placeholder = " ".repeat(left) + placeholder + " ".repeat(right);
      } else {
        placeholder = placeholder.padEnd(width);
      }
    }

    // Add placeholder to string
    newStr += placeholder;
  }

  if (paramIndex < paramTokens.length) {
    return errorReporter.throwErr(
      paramTokens[paramIndex].token,
      "Too many parameters for the number of placeholders in the format string",
      "4000012"
    );
  }

  return newStr;
}

function isNumeric(char: string): boolean {
  return char >= "0" && char <= "9";
}
