import typescript from "rollup-plugin-typescript2";
import filesize from "rollup-plugin-filesize";

// No terser/minification - code stays readable

export default [
  // ===========================================
  // ESM Build (modern bundlers, Node.js ESM)
  // ===========================================
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: false,
      exports: "named",
      indent: true,
      strict: true,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.rollup.json",
        clean: true,
      }),
    ],
    // IMPORTANT: Don't bundle the validator - it's a dependency
    external: ["@jetio/validator"],
  },

  // ===========================================
  // CommonJS Build (Node.js require)
  // ===========================================
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: false,
      exports: "named",
      indent: true,
      strict: true,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.rollup.json",
        clean: true,
      }),
      filesize({
        showGzippedSize: true,
        showBrotliSize: true,
      }),
    ],
    // IMPORTANT: Don't bundle the validator - it's a dependency
    external: ["@jetio/validator", "fs/promises"],
  },
];