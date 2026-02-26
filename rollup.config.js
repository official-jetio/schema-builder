import typescript from "rollup-plugin-typescript2";
import filesize from "rollup-plugin-filesize";

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
    external: ["@jetio/validator", "fs/promises"],
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
    external: ["@jetio/validator", "fs/promises"],
  },

  {
    input: "src/index.ts",
    output: {
      file: "dist/schema-builder.umd.js",
      format: "umd",
      name: "JetSchemaBuilder",
      sourcemap: false,
      exports: "named",
      indent: true,
      strict: true,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.rollup.json",
        tsconfigOverride: {
          compilerOptions: {
            module: "ES2015",
            target: "ES2018",
          },
        },
      }),
      {
        name: "stub-fs",
        resolveId(id) {
          if (id === "fs/promises") return id;
        },
        load(id) {
          if (id === "fs/promises") {
            return `
              export default {
                access: () => Promise.reject(new Error('file() is not supported in browser environments')),
                stat: () => Promise.reject(new Error('file() is not supported in browser environments')),
                readFile: () => Promise.reject(new Error('file() is not supported in browser environments'))
              }
            `;
          }
        },
      },
      // filesize({
      //   showGzippedSize: true,
      //   showBrotliSize: true,
      // }),
      // visualizer({
      //   filename: "bundle-analysis.html",
      //   open: false,
      // }),
    ],
    external: ["@jetio/validator"],
  },
];
