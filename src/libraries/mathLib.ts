import { RecordVal } from "../record.js";
import { newRecordVal, RunContext } from "../runtime.js";
import { Library } from "../utils/libraryUtils.js";

export const MathLibrary: Library = {
  math_pi: {
    params: [],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.PI);
    },
  },
  math_floor: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.floor(Number(params[0].value)));
    },
  },
  math_ceil: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.ceil(Number(params[0].value)));
    },
  },
  math_round: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.round(Number(params[0].value)));
    },
  },
  math_e: {
    params: [],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.E);
    },
  },
  math_sqrt: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.sqrt(Number(params[0].value)))
    },
  },
  math_pow: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.pow(Number(params[0].value), Number(params[1].value)))
    },
  },
  math_log: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.log(Number(params[0].value)))
    },
  },
    math_log2: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.log2(Number(params[0].value)))
    },
  },
    math_log10: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.log10(Number(params[0].value)))
    },
  },
  math_abs: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.abs(Number(params[0].value)));
    },
  },
  math_sin: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.sin(Number(params[0].value)));
    },
  },
  math_cos: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.cos(Number(params[0].value)));
    },
  },
   math_tan: {
    params: ["NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return numberOrNil(Math.tan(Number(params[0].value)));
    },
  },
  math_min: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.min(Number(params[0].value), Number(params[1].value)))
    },
  },
  math_max: {
    params: ["NUM", "NUM"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      return newRecordVal("NUM", Math.max(Number(params[0].value), Number(params[1].value)))
    },
  },
};

function numberOrNil(x: number) {
  if (Number.isNaN(x) || !Number.isFinite(x)) {
    return newRecordVal("NIL", "nil");
  }
  return newRecordVal("NUM", x);
}
