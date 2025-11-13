import { ErrorReporter } from "./error.js";
import { Token } from "./token.js";
import { type ValueType, ValueOrFunctionNode } from "./node.js";
import {
  newRecordVal,
  hasValue,
  evaluateValVarFun,
  VarMap,
} from "./runtime.js";
import { notIntegerError, outOfRangeError } from "./utils/stdlibErrors.js";
import { RecordTap, RecordVal } from "./record.js";
export interface RunContext {
  record: RecordTap;
  variables: VarMap;
  mustBeSafe: boolean;
  lazyparams: ValueOrFunctionNode[];
  errorToken: Token;
  errorReporter: ErrorReporter;
}

export interface STDLIBFunction {
  params: ValueType[];
  run: (params: RecordVal[], runContext: RunContext) => RecordVal | null;
  safe: boolean;
  lazy: boolean;
}

export const STDLIB: { [key: string]: STDLIBFunction } = {
  print: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      console.log(params[0].value);
      return newRecordVal("NIL", "nil");
    },
  },
  type: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].type.toLocaleLowerCase());
    },
  },
  less: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "BOOL",
        Number(params[0].value) < Number(params[1].value)
      );
    },
  },
  greater: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "BOOL",
        Number(params[0].value) > Number(params[1].value)
      );
    },
  },
  less_or_equal: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "BOOL",
        Number(params[0].value) <= Number(params[1].value)
      );
    },
  },
  greater_or_equal: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "BOOL",
        Number(params[0].value) >= Number(params[1].value)
      );
    },
  },
  equal: {
    params: ["ANY", "ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "BOOL",
        params[0].type === params[1].type && params[0].value === params[1].value
      );
    },
  },
  not_equal: {
    params: ["ANY", "ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "BOOL",
        params[0].type !== params[1].type || params[0].value !== params[1].value
      );
    },
  },
  add: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "NUM",
        Number(params[0].value) + Number(params[1].value)
      );
    },
  },
  sub: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "NUM",
        Number(params[0].value) - Number(params[1].value)
      );
    },
  },
  mult: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "NUM",
        Number(params[0].value) * Number(params[1].value)
      );
    },
  },
  div: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "NUM",
        Number(params[0].value) / Number(params[1].value)
      );
    },
  },
  floor_div: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "NUM",
        Math.floor(Number(params[0].value) / Number(params[1].value))
      );
    },
  },
  mod: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "NUM",
        Number(params[0].value) % Number(params[1].value)
      );
    },
  },
  floor: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.floor(Number(params[0].value)));
    },
  },
  ceil: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.ceil(Number(params[0].value)));
    },
  },
  when: {
    params: ["ANY", "ANY", "ANY"],
    safe: true,
    lazy: true,
    run: (params: RecordVal[], runContext: RunContext) => {
      const condition = evaluateValVarFun(
        runContext.lazyparams[0],
        runContext.variables,
        runContext.record,
        runContext.mustBeSafe,
        runContext.errorReporter
      );
      if (condition === null) return null;
      if (hasValue(condition)) {
        return evaluateValVarFun(
          runContext.lazyparams[1],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter
        );
      } else {
        return evaluateValVarFun(
          runContext.lazyparams[2],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter
        );
      }
    },
  },
  or: {
    params: ["ANY", "ANY"],
    safe: true,
    lazy: true,
    run: (params: RecordVal[], runContext: RunContext) => {
      const left = evaluateValVarFun(
        runContext.lazyparams[0],
        runContext.variables,
        runContext.record,
        runContext.mustBeSafe,
        runContext.errorReporter
      );
      if (left === null) return null;
      if (hasValue(left)) {
        return left;
      } else {
        return evaluateValVarFun(
          runContext.lazyparams[1],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter
        );
      }
    },
  },
  and: {
    params: ["ANY", "ANY"],
    safe: true,
    lazy: true,
    run: (params: RecordVal[], runContext: RunContext) => {
      const left = evaluateValVarFun(
        runContext.lazyparams[0],
        runContext.variables,
        runContext.record,
        runContext.mustBeSafe,
        runContext.errorReporter
      );
      if (left === null) return null;
      if (hasValue(left)) {
        return evaluateValVarFun(
          runContext.lazyparams[1],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter
        );
      } else {
        return left;
      }
    },
  },
  not: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", !hasValue(params[0]));
    },
  },
  empty: {
    params: [],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      runContext.record.setRecord([]);
      return newRecordVal("NIL", "nil");
    },
  },
  size: {
    params: [],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", runContext.record.size());
    },
  },
  length: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", params[0].value.length);
    },
  },
  join: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].value + params[1].value);
    },
  },
  join_with: {
    params: ["STR", "STR", "STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "STR",
        params[0].value + params[2].value + params[1].value
      );
    },
  },
  trim: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].value.trim());
    },
  },
  is_str: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "STR");
    },
  },
  is_num: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "NUM");
    },
  },
  is_term: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "TERM");
    },
  },
  is_bool: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "BOOL");
    },
  },
  is_nil: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "NIL");
    },
  },
  to_term: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      let index = 1;
      let str = params[0].value.trim();
      if (str.length === 0) return newRecordVal("NIL", "nil");
      if (str[0] < "A" || str[0] > "Z") return newRecordVal("NIL", "nil");

      while (
        index < str.length &&
        ((str[index] >= "A" && str[index] <= "Z") ||
          (str[index] >= "a" && str[index] <= "z") ||
          (str[index] >= "0" && str[index] <= "9") ||
          str[index] === "_")
      ) {
        index += 1;
      }
      if (index != str.length) return newRecordVal("NIL", "nil");
      return newRecordVal("TERM", str);
    },
  },
  to_str: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].value);
    },
  },
  to_num: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      let str = params[0].value.trim();
      let index = 0;
      if (str.length === 0) return newRecordVal("NIL", "nil");
      if (str[0] === "-") {
        if (str.length === 1) return newRecordVal("NIL", "nil");
        index += 1;
      }
      let hasNum = false;
      while (str[index] >= "0" && str[index] <= "9") {
        index += 1;
        hasNum = true;
      }
      if (!hasNum) return newRecordVal("NIL", "nil");
      if (str[index] === ".") {
        index += 1;
        while (str[index] >= "0" && str[index] <= "9") {
          index += 1;
        }
      }
      if (index != str.length) return newRecordVal("NIL", "nil");
      return newRecordVal("NUM", str);
    },
  },
  get: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      const num = Number(params[0].value);
      if (!Number.isInteger(num))
        return notIntegerError(
          runContext.errorReporter,
          runContext.lazyparams[0].token,
          "get"
        );
      const result = runContext.record.get(num);
      if (result == null)
        return outOfRangeError(
          runContext.errorReporter,
          runContext.lazyparams[0].token,
          num,
          runContext.record.size(),
          "get"
        );
      return result;
    },
  },
  push: {
    params: ["ANY"],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      runContext.record.addLast(params[0]);
      return params[0];
    },
  },
  push_begin: {
    params: ["ANY"],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      runContext.record.addFirst(params[0]);
      return params[0];
    },
  },
  pop_begin: {
    params: [],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      let shift = runContext.record.removeFirst();
      if (shift === null) return newRecordVal("NIL", "nil");
      return shift;
    },
  },
  pop: {
    params: [],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      let pop = runContext.record.removeLast();
      if (pop === null) return newRecordVal("NIL", "nil");
      return pop;
    },
  },
  insert: {
    params: ["ANY", "NUM"],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      const num = Number(params[1].value);
      if (!Number.isInteger(num))
        return notIntegerError(
          runContext.errorReporter,
          runContext.lazyparams[1].token,
          "insert"
        );
      const result = runContext.record.add(num, params[0]);
      if (!result)
        return outOfRangeError(
          runContext.errorReporter,
          runContext.lazyparams[1].token,
          num,
          runContext.record.size(),
          "insert"
        );
      return params[0];
    },
  },
  split_push: {
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
  reverse: {
    params: [],
    safe: false,
    lazy: false,
    run: (params: RecordVal[], runContext: RunContext) => {
      runContext.record.reverse();
      return newRecordVal("NIL", "nil");
    },
  },
};
