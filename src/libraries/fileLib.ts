import fs from "fs";
import { resolve } from "path";
import { RecordVal } from "../record.js";
import { newRecordVal, RunContext } from "../runtime.js";
import { Library } from "../utils/libraryUtils.js";

export const FileLibrary: Library = {
  file_read: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const path = params[0].value;
      const full = resolve(runContext.baseDirectory, path);

      try {
        const data = await fs.promises.readFile(full, "utf8");
        return newRecordVal("STR", data);
      } catch {
        runContext.errorReporter.throwErr(
          runContext.lazyparams[0].token,
          `Cannot read file \`${path}\``,
          "400005"
        );
        return null;
      }
    },
  },
  file_write: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const path = params[0].value;
      const contents = params[1].value;
      const full = resolve(runContext.baseDirectory, path);

      try {
        await fs.promises.writeFile(full, contents, "utf8");
        return newRecordVal("NIL", "nil");
      } catch {
        return runContext.errorReporter.throwErr(
          runContext.lazyparams[0].token,
          `Cannot write to file \`${path}\``,
          "400006"
        );
      }
    },
  },
  file_append: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const path = params[0].value;
      const contents = params[1].value;
      const full = resolve(runContext.baseDirectory, path);

      try {
        await fs.promises.appendFile(full, contents, "utf8");
        return newRecordVal("NIL", "nil");
      } catch {
        return runContext.errorReporter.throwErr(
          runContext.lazyparams[0].token,
          `Cannot append to file \`${path}\``,
          "400007"
        );
      }
    },
  },
  file_prepend: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const path = params[0].value;
      const contents = params[1].value;
      const full = resolve(runContext.baseDirectory, path);

      try {
        let existing = "";
        try {
          existing = await fs.promises.readFile(full, "utf8");
        } catch {
          // Otherwise the file doesn't exist, so we'll write a new one
        }

        await fs.promises.writeFile(full, contents + existing, "utf8");
        return newRecordVal("NIL", "nil");
      } catch {
        return runContext.errorReporter.throwErr(
          runContext.lazyparams[0].token,
          `Cannot prepend to file \`${path}\``,
          "400008"
        );
      }
    },
  },
  file_remove: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const path = params[0].value;
      const full = resolve(runContext.baseDirectory, path);

      try {
        await fs.promises.unlink(full);
        return newRecordVal("NIL", "nil");
      } catch {
        return runContext.errorReporter.throwErr(
          runContext.lazyparams[0].token,
          `Cannot remove file \`${path}\``,
          "400009"
        );
      }
    },
  },
  file_rename: {
    params: ["STR", "STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const from = params[0].value;
      const to = params[1].value;

      const fullFrom = resolve(runContext.baseDirectory, from);
      const fullTo = resolve(runContext.baseDirectory, to);

      try {
        await fs.promises.rename(fullFrom, fullTo);
        return newRecordVal("NIL", "nil");
      } catch {
        return runContext.errorReporter.throwErr(
          runContext.lazyparams[0].token,
          `Cannot rename file \`${from}\` to \`${to}\``,
          "400010"
        );
      }
    },
  },
  file_exists: {
    params: ["STR"],
    safe: true,
    lazy: false,
    run: async (params: RecordVal[], runContext: RunContext) => {
      const fullPath = resolve(runContext.baseDirectory, params[0].value);
      try {
        await fs.promises.access(fullPath);
        return newRecordVal("BOOL", "true");
      } catch {
        return newRecordVal("BOOL", "false");
      }
    },
  },
};