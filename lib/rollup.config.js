import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json"
import pkg from "./package.json";

export default [
  // browser-friendly UMD build
  {
    input: "src/index.ts",
    output: {
      name: "hashconnect",
      file: pkg.browser,
      format: "umd",
    },
    plugins: [
      resolve(),
      commonjs({
        include: 'node_modules/**'
      }),
      typescript({ tsconfig: "./tsconfig.json" }),
      json()
    ],
    inlineDynamicImports: true,
    external: ['js-waku', 'rxjs', 'crypto-js', 'crypto-browserify']
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
  },
];
