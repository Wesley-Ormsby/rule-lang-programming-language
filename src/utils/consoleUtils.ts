const consoleCodes = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  blue: "\x1b[94m",
  green: "\x1b[32m",
};

export const colour = {
  red: (s: string) => `${consoleCodes.red}${s}${consoleCodes.reset}`,
  green: (s: string) => `${consoleCodes.green}${s}${consoleCodes.reset}`,
  blue: (s: string) => `${consoleCodes.blue}${s}${consoleCodes.reset}`,
  bright: (s: string) => `${consoleCodes.bright}${s}${consoleCodes.reset}`,
};