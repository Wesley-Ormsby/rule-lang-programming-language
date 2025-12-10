import { ErrorReporter } from "../error.js";
import { Token } from "../token.js";

export function notIntegerError(
  errorReporter: ErrorReporter,
  errorToken: Token,
  functionName: string
) {
  return errorReporter.throwErr(
    errorToken,
    `Parameter for \`${functionName}\` function must be an integer`,
    "400001"
  );
}
export function outOfRangeError(
  errorReporter: ErrorReporter,
  errorToken: Token,
  index: number,
    length: number,
  functionName: string,
) {
  return errorReporter.throwErr(
    errorToken,
    `\`${index}\` is out of range for \`${functionName}\` function, the record has ${length} values`,
          "400002"
  );
}