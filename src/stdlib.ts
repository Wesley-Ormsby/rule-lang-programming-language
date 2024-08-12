import { Error } from "./error.js";
import { Token } from "./token.js"
import {
  type ValueType,
  ValueOrFunction,
} from "./node.js";
import {
  type RecordVal,
  newRecordVal,
  hasValue,
  evaluateValVarFun,
  VarMap,
} from "./runtime.js";
export interface STDLIBFunction {
  parms: ValueType[];
  run: (
    parms: RecordVal[],
    record: RecordVal[],
    variables: VarMap,
    mustBeSafe: boolean,
    lazyParms: ValueOrFunction[],
    errorToken: Token,
  ) => RecordVal | null;
  safe: boolean;
  lazy: boolean;
}
export const STDLIB: { [key: string]: STDLIBFunction } = {
  print: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],
      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      console.log(parms[0].value);
      return newRecordVal("NIL", "nil");
    },
  },
  type: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("STR", parms[0].type.toLocaleLowerCase());
    },
  },
  less: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "BOOL",
        Number(parms[0].value) < Number(parms[1].value)
      );
    },
  },
  greater: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "BOOL",
        Number(parms[0].value) > Number(parms[1].value)
      );
    },
  },
  less_or_equal: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "BOOL",
        Number(parms[0].value) <= Number(parms[1].value)
      );
    },
  },
  greater_or_equal: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "BOOL",
        Number(parms[0].value) >= Number(parms[1].value)
      );
    },
  },
  equal: {
    parms: ["ANY", "ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "BOOL",
        parms[0].type === parms[1].type && parms[0].value === parms[1].value
      );
    },
  },
  not_equal: {
    parms: ["ANY", "ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "BOOL",
        parms[0].type !== parms[1].type || parms[0].value !== parms[1].value
      );
    },
  },
  add: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "NUM",
        Number(parms[0].value) + Number(parms[1].value)
      );
    },
  },
  sub: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "NUM",
        Number(parms[0].value) - Number(parms[1].value)
      );
    },
  },
  mult: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "NUM",
        Number(parms[0].value) * Number(parms[1].value)
      );
    },
  },
  div: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "NUM",
        Number(parms[0].value) / Number(parms[1].value)
      );
    },
  },
  floor_div: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "NUM",
        Math.floor(Number(parms[0].value) / Number(parms[1].value))
      );
    },
  },
  mod: {
    parms: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal(
        "NUM",
        Number(parms[0].value) % Number(parms[1].value)
      );
    },
  },
  floor: {
    parms: ["NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("NUM", Math.floor(Number(parms[0].value)));
    },
  },
  ceil: {
    parms: ["NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("NUM", Math.ceil(Number(parms[0].value)));
    },
  },
  when: {
    parms: ["ANY", "ANY", "ANY"],
    safe: true,
    lazy: true,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      const condition = evaluateValVarFun(
        lazyParms[0],
        variables,
        record,
        mustBeSafe,
      );
      if (condition === null) return null;
      if (hasValue(condition)) {
        return evaluateValVarFun(
          lazyParms[1],
          variables,
          record,
          mustBeSafe,
        );
      } else {
        return evaluateValVarFun(
          lazyParms[2],
          variables,
          record,
          mustBeSafe,
        );
      }
    },
  },
  or: {
    parms: ["ANY", "ANY"],
    safe: true,
    lazy: true,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      const left = evaluateValVarFun(
        lazyParms[0],
        variables,
        record,
        mustBeSafe,
      );
      if (left === null) return null;
      if (hasValue(left)) {
        return left;
      } else {
        return evaluateValVarFun(
          lazyParms[1],
          variables,
          record,
          mustBeSafe,
        );
      }
    },
  },
  and: {
    parms: ["ANY", "ANY"],
    safe: true,
    lazy: true,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      const left = evaluateValVarFun(
        lazyParms[0],
        variables,
        record,
        mustBeSafe,
      );
      if (left === null) return null;
      if (hasValue(left)) {
        return evaluateValVarFun(
          lazyParms[1],
          variables,
          record,
          mustBeSafe,
        );
      } else {
        return left;
      }
    },
  },
  not: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("BOOL", !hasValue(parms[0]));
    },
  },
  empty: {
    parms: [],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      record.length = 0;
      return newRecordVal("NIL", "nil");
    },
  },
  size: {
    parms: [],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("NUM", record.length);
    },
  },
  length: {
    parms: ["STR"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("NUM", parms[0].value.length);
    },
  },
  join: {
    parms: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("STR", parms[0].value + parms[1].value);
    },
  },
  join_with: {
    parms: ["STR", "STR", "STR"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("STR", parms[0].value + parms[2].value + parms[1].value);
    },
  },
  trim: {
    parms: ["STR"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("STR", parms[0].value.trim());
    },
  },
  is_str: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("BOOL", parms[0].type === "STR");
    },
  },
  is_num: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("BOOL", parms[0].type === "NUM");
    },
  },
  is_term: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("BOOL", parms[0].type === "TERM");
    },
  },
  is_bool: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("BOOL", parms[0].type === "BOOL");
    },
  },
  is_nil: {
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("BOOL", parms[0].type === "NIL");
    },
  },
  to_term: {
    parms: ["STR"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      let index = 1;
      let str = parms[0].value.trim();
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
    parms: ["ANY"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      return newRecordVal("STR", parms[0].value);
    },
  },
  to_num: {
    parms: ["STR"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
    errorToken: Token
    ) => {
      let str = parms[0].value.trim();
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
    parms: ["NUM"],
    safe: true,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        const num = Number(parms[0].value)
        if(!Number.isInteger(num)) return Error.throwErr(lazyParms[0].token, `Parameter for \`get\` function must be an integer`)
        const index = num<0 ? record.length + num: num-1
        if(num === 0 || index >= record.length || index < 0) return Error.throwErr(lazyParms[0].token, `\`${num}\` is out of range for \`get\` function, the record has ${record.length} values`)
        return record[index];
    },
  },
  push: {
    parms: ["ANY"],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        record.push(parms[0])
        return parms[0];
    },
  },
  push_begin: {
    parms: ["ANY"],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        record.unshift(parms[0])
        return parms[0];
    },
  },
  pop_begin: {
    parms: [],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        let shift = record.shift()
        if(shift === undefined) return newRecordVal("NIL", "nil")
        return shift;
    },
  },
  pop: {
    parms: [],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        let pop = record.pop()
        if(pop === undefined) return newRecordVal("NIL", "nil")
        return pop;
    },
  },
  insert: {
    parms: ["ANY", "NUM"],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],

      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        const num = Number(parms[1].value)
        if(!Number.isInteger(num)) return Error.throwErr(lazyParms[1].token, `Parameter for \`insert\` function must be an integer`)
        const index = num<0 ? record.length + num: num-1
        if(num === 0 || index > record.length || index < 0) return Error.throwErr(lazyParms[0].token, `\`${num}\` is out of range for \`index\` function, the record has ${record.length} values`)
        record.splice(index,0,parms[0])
        return parms[0];
    },
  },
  split_push: {
    parms: ["STR", "STR"],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],
      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        record.push(...parms[0].value.split(parms[1].value).map((substring) => newRecordVal("STR", substring)))
        return newRecordVal("NIL", "nil");
    },
  },
  reverse: {
    parms: [],
    safe: false,
    lazy: false,
    run: (
      parms: RecordVal[],
      record: RecordVal[],
      variables: VarMap,
      mustBeSafe: boolean,
      lazyParms: ValueOrFunction[],
      errorToken: Token
    ) => {
        record.reverse()
        return newRecordVal("NIL", "nil")
    },
  },
  
};
