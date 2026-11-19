declare module "*yoga-wasm-base64-esm.js" {
  const loadYoga: (options?: {
    instantiateWasm: (
      imports: WebAssembly.Imports,
      receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void,
    ) => WebAssembly.Exports;
  }) => Promise<Parameters<typeof import("../node_modules/yoga-layout/dist/src/wrapAssembly.js").default>[0]>;
  export default loadYoga;
}
