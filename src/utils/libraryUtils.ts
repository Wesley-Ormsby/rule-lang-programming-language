import { MathLibrary } from "../libraries/mathLib.js";
import { StrLibrary } from "../libraries/strLib.js";
import { ValueType } from "../node.js";
import { RecordVal } from "../record.js";
import { RunContext } from "../runtime.js";

export type Library = Record<string, ModuleFunction>;

export const LIBRARIES: Record<string, Library> = {
  math: MathLibrary,
  string: StrLibrary
};

export interface ModuleFunction {
  params: ValueType[];
  run: (params: RecordVal[], runContext: RunContext) => RecordVal | null;
  safe: boolean;
  lazy: boolean;
}
