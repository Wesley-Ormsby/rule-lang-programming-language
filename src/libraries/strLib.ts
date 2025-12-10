import { RecordVal } from "../record.js";
import { newRecordVal, RunContext } from "../runtime.js";
import { Library } from "../utils/libraryUtils.js";
import { notIntegerError } from "../utils/libraryErrors.js";

export const StrLibrary: Library = {
  str_get_char: {
    params: ["STR","NUM" ],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      const num = Number(params[1].value);
      if (!Number.isInteger(num))
        return notIntegerError(
          runContext.errorReporter,
          runContext.lazyparams[1].token,
          "str_get_char"
        );

      const str = params[0].value;
      const index = num < 0 ? str.length + num : num;
      if (index < 0 || index >= str.length)
        return runContext.errorReporter.throwErr(
          runContext.lazyparams[1].token,
          `Index \`${index}\` is out of range for string`,
          "400003"
        );

      return newRecordVal("STR", str[index]);
    },
  },
  str_uppercase: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].value.toLocaleUpperCase());
    },
  },
  str_lowercase: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].value.toLocaleLowerCase());
    },
  },
  str_trim: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].value.trim());
    },
  },
  str_split: {
    params: ["STR", "STR"],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      params[0].value
        .split(params[1].value)
        .map((substring) => newRecordVal("STR", substring))
        .forEach((value) => {
          runContext.record.addLast(value);
        });

      return newRecordVal("NIL", "nil");
    },
  },
  str_substr: {
    params: ["STR", "NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      const num1 = Number(params[1].value);
      if (!Number.isInteger(num1))
        runContext.errorReporter.pushErr(
          runContext.lazyparams[1].token,
          `Parameter for \`str_substr\` function must be an integer`,
          "400001"
        );
      const num2 = Number(params[2].value);
      if (!Number.isInteger(num2))
        runContext.errorReporter.pushErr(
          runContext.lazyparams[2].token,
          `Parameter for \`str_substr\` function must be an integer`,
          "400001"
        );
      if (runContext.errorReporter.hasError())
        return runContext.errorReporter.throwAllErrs();

      const str = params[0].value;
      const index1 = num1 < 0 ? str.length + num1 : num1;
      if (index1 < 0 || index1 >= str.length)
         runContext.errorReporter.pushErr(
          runContext.lazyparams[1].token,
          `Index \`${index1}\` is out of range for string`,
          "400003"
        );
      const index2 = num2 < 0 ? str.length + num2 : num2;
      if (index2 < 0 || index2 >= str.length)
         runContext.errorReporter.pushErr(
          runContext.lazyparams[2].token,
          `Index \`${index2}\` is out of range for string`,
          "400003"
        );
      if (runContext.errorReporter.hasError())
        return runContext.errorReporter.throwAllErrs();

      const minIndex = Math.min(index1, index2);
      const maxIndex = Math.max(index1, index2);
      return newRecordVal("STR", str.substring(minIndex, maxIndex + 1));
    },
  },
  str_starts_with: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].value.startsWith(params[1].value));
    },
  },
  str_ends_with: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].value.endsWith(params[1].value));
    },
  },
  str_contains: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].value.includes(params[1].value));
    },
  },
  str_index_of: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", params[0].value.indexOf(params[1].value));
    },
  },
  str_last_index_of: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", params[0].value.lastIndexOf(params[1].value));
    },
  },
  str_repeat: {
    params: ["STR", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      const num = Number(params[1].value);
      if (!Number.isInteger(num))
        return notIntegerError(
          runContext.errorReporter,
          runContext.lazyparams[1].token,
          "str_repeat"
        );
      return newRecordVal("STR", params[0].value.repeat(num));
    },
  },
  str_replace: {
    params: ["STR", "STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "STR",
        params[0].value.replace(params[1].value, params[2].value)
      );
    },
  },
  str_char_code: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      const char = params[0].value;
      if (char.length != 1)
        return runContext.errorReporter.throwErr(
          runContext.lazyparams[0].token,
          `Parameter for \`str_char_code\` function must be a 1-character string`,
          "400004"
        );
      return newRecordVal("NUM", params[0].value.charCodeAt(0));
    },
  },
  str_from_code: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      const num = Number(params[0].value);
      if (!Number.isInteger(num))
        return notIntegerError(
          runContext.errorReporter,
          runContext.lazyparams[0].token,
          "str_from_code"
        );
      return newRecordVal("STR", String.fromCharCode(num));
    },
  },
};
