import {
  newRecordVal,
  hasValue,
  evaluateValVarFun,
  RunContext,
} from "./runtime.js";
import { notIntegerError, outOfRangeError } from "./utils/libraryErrors.js";
import { RecordVal } from "./record.js";
import { format, Library } from "./utils/libraryUtils.js";
import readline from 'node:readline';
import { setTimeout } from "node:timers/promises";

export const StandardLibrary: Library = {
  print: {
    params: ["ANY"],
    variadic: "ANY",
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      console.log(...params.map(x=>x.value));
      return newRecordVal("NIL", "nil");
    },
  },
  printf: {
    params: ["STR"],
    variadic: "ANY",
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const str = format(0, 1, params, runContext.lazyparams, runContext.errorReporter)
      if(str == null) return null
      console.log(str);
      return newRecordVal("NIL", "nil");
    },
  },
  format: {
    params: ["STR"],
    variadic: "ANY",
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const str = format(0, 1, params, runContext.lazyparams, runContext.errorReporter)
      if(str == null) return null
      return newRecordVal("STR", str);
    },
  },
  type: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].type.toLocaleLowerCase());
    },
  },
  less: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal(
        "NUM",
        Number(params[0].value) % Number(params[1].value)
      );
    },
  },
  when: {
    params: ["ANY", "ANY", "ANY"],
    safe: true,
    lazy: true,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const condition = await evaluateValVarFun(
        runContext.lazyparams[0],
        runContext.variables,
        runContext.record,
        runContext.mustBeSafe,
        runContext.errorReporter,
        runContext.nameSpace,
        runContext.baseDirectory
      );
      if (condition === null) return null;
      if (hasValue(condition)) {
        return await evaluateValVarFun(
          runContext.lazyparams[1],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter,
          runContext.nameSpace,
        runContext.baseDirectory
        );
      } else {
        return await evaluateValVarFun(
          runContext.lazyparams[2],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter,
          runContext.nameSpace,
        runContext.baseDirectory
        );
      }
    },
  },
  or: {
    params: ["ANY", "ANY"],
    safe: true,
    lazy: true,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const left = await evaluateValVarFun(
        runContext.lazyparams[0],
        runContext.variables,
        runContext.record,
        runContext.mustBeSafe,
        runContext.errorReporter,
        runContext.nameSpace,
        runContext.baseDirectory
      );
      if (left === null) return null;
      if (hasValue(left)) {
        return left;
      } else {
        return await evaluateValVarFun(
          runContext.lazyparams[1],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter,
          runContext.nameSpace,
        runContext.baseDirectory
        );
      }
    },
  },
  and: {
    params: ["ANY", "ANY"],
    safe: true,
    lazy: true,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const left = await evaluateValVarFun(
        runContext.lazyparams[0],
        runContext.variables,
        runContext.record,
        runContext.mustBeSafe,
        runContext.errorReporter,
        runContext.nameSpace,
        runContext.baseDirectory
      );
      if (left === null) return null;
      if (hasValue(left)) {
        return await evaluateValVarFun(
          runContext.lazyparams[1],
          runContext.variables,
          runContext.record,
          runContext.mustBeSafe,
          runContext.errorReporter,
          runContext.nameSpace,
        runContext.baseDirectory
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
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", !hasValue(params[0]));
    },
  },
  empty: {
    params: [],
    safe: false,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      runContext.record.setRecord([]);
      return newRecordVal("NIL", "nil");
    },
  },
  size: {
    params: [],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", runContext.record.size());
    },
  },
  length: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", params[0].value.length);
    },
  },
  join: {
    params: ["STR", "STR"],
    variadic:"STR",
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params.map(x=>x.value).join(""));
    },
  },
  is_str: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "STR");
    },
  },
  is_num: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "NUM");
    },
  },
  is_term: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "TERM");
    },
  },
  is_bool: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "BOOL");
    },
  },
  is_nil: {
    params: ["ANY"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("BOOL", params[0].type === "NIL");
    },
  },
  to_term: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("STR", params[0].value);
    },
  },
  to_num: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    run: async (params: RecordVal[], runContext: RunContext) => {
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
    variadic: "ANY",
    safe: false,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      for(let param of params)
        runContext.record.addLast(param);
      return newRecordVal("NIL", "nil");
    },
  },
  push_begin: {
    params: ["ANY"],
    variadic: "ANY",
    safe: false,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      for(let param of params.reverse())
        runContext.record.addFirst(param);
      return newRecordVal("NIL", "nil");
    },
  },
  pop_begin: {
    params: [],
    safe: false,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      let shift = runContext.record.removeFirst();
      if (shift === null) return newRecordVal("NIL", "nil");
      return shift;
    },
  },
  pop: {
    params: [],
    safe: false,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      let pop = runContext.record.removeLast();
      if (pop === null) return newRecordVal("NIL", "nil");
      return pop;
    },
  },
  insert: {
    params: ["ANY", "NUM"],
    safe: false,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
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
  reverse: {
    params: [],
    safe: false,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      runContext.record.reverse();
      return newRecordVal("NIL", "nil");
    },
  },
  random: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const num1 = Number(params[0].value);
      if (!Number.isInteger(num1))
        runContext.errorReporter.pushErr(
          runContext.lazyparams[0].token,
          `Parameter for \`random\` function must be an integer`,
          "400001"
        );
      const num2 = Number(params[1].value);
      if (!Number.isInteger(num2))
        runContext.errorReporter.pushErr(
          runContext.lazyparams[1].token,
          `Parameter for \`random\` function must be an integer`,
          "400001"
        );
      if (runContext.errorReporter.hasError())
        return runContext.errorReporter.throwAllErrs();
      const min = Math.min(num1, num2);
      const max = Math.max(num1, num2);
      return newRecordVal(
        "NUM",
        Math.floor(Math.random() * (max - min + 1)) + min
      );
    },
  },
  input: {
  params: ["STR"],
  safe: false,
  lazy: false,
  run: async (params: RecordVal[], runContext: RunContext) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = params[0].value;

    // Wrap question() in a Promise
    const answer = await new Promise<string>((resolve) => {
      rl.question(prompt, (ans) => {
        rl.close();
        resolve(ans);
      });
    });

    return newRecordVal("STR", answer);
  },
},
wait: {
  params: ["NUM"],
  safe: false,
  lazy: false,
  run: async (params: RecordVal[], runContext: RunContext) => {
    await setTimeout(Number(params[0].value));
    return newRecordVal("NIL", "nil");
  },
},
};
