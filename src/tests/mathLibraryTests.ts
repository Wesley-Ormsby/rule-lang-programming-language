import { test } from "./testRunner.js";

export async function runMathLibraryTests() {
  await test(`math_pi`, `import [math_pi] from math begin >> math_pi()`, [Math.PI], []);
await test(`math_floor`, `import [math_floor] from math begin >> [ math_floor(0.7) math_floor(1.0)]`, [0, 1], []);
await test(`math_ceil`, `import [math_ceil] from math begin >> [ math_ceil(0.7) math_ceil(1.0)]`, [1, 1], []);
await test(`math_round`, `import [math_round] from math begin >> [ math_round(0.7) math_round(1.2)]`, [1, 1], []);
await test(`math_e`, `import [math_e] from math begin >> math_e()`, [Math.E], []);
await test(`math_sqrt`, `import [math_sqrt] from math begin >> [ math_sqrt(16) math_sqrt(-2)]`, [4, null], []);
await test(`math_pow`, `import [math_pow] from math begin >> [ math_pow(2 4) math_pow(-2 0.5)]`, [16, null], []);
await test(`math_log`, `import [math_log] from math begin >> [ math_log(3) math_log(0)]`, [Math.log(3), null], []);
await test(`math_log2`, `import [math_log2] from math begin >> [ math_log2(16) math_log2(0)]`, [4, null], []);
await test(`math_log10`, `import [math_log10] from math begin >> [ math_log10(100) math_log10(0)]`, [2, null], []);
await test(`math_abs`, `import [math_abs] from math begin >> [ math_abs(0) math_abs(-2) math_abs(2)]`, [0, 2, 2], []);
await test(`math_sin`, `import [math_sin] from math begin >> [ math_sin(0) math_sin(3.14)]`, [0, Math.sin(3.14)], []);
await test(`math_cos`, `import [math_cos math_pi] from math begin >> [math_cos(3.14)]`, [Math.cos(3.14)], []);
await test(`math_tan`, `import [math_tan] from math begin >> [ math_tan(0) math_tan(3.14)]`, [0, Math.tan(3.14)], []);
await test(`math_min`, `import [math_min] from math begin >> [ math_min(2 4) math_min(-2 0.5) math_min(1 4 3 2)]`, [2, -2, 1], []);
await test(`math_max`, `import [math_max] from math begin >> [ math_max(2 4) math_max(-2 0.5) math_max(1 4 3 2)]`, [4, 0.5,4], []);
}
