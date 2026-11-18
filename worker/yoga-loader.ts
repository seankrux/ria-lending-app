import loadYogaImpl from "../node_modules/yoga-layout/dist/binaries/yoga-wasm-base64-esm.js";
import wrapAssembly from "../node_modules/yoga-layout/dist/src/wrapAssembly.js";

export async function loadYoga() {
  const module = (globalThis as typeof globalThis & { __RIA_YOGA_MODULE__?: WebAssembly.Module }).__RIA_YOGA_MODULE__;
  const options = module ? {
    instantiateWasm(imports: WebAssembly.Imports, receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
      const instance = new WebAssembly.Instance(module, imports);
      receive(instance, module);
      return instance.exports;
    },
  } : undefined;
  return wrapAssembly(await loadYogaImpl(options));
}

export * from "../node_modules/yoga-layout/dist/src/generated/YGEnums.js";
