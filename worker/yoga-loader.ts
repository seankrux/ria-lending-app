import loadYogaImpl from "../node_modules/yoga-layout/dist/binaries/yoga-wasm-base64-esm.js";
import wrapAssembly from "../node_modules/yoga-layout/dist/src/wrapAssembly.js";

export async function loadYoga() {
  const yogaWasm = (globalThis as typeof globalThis & { __RIA_YOGA_MODULE__?: WebAssembly.Module }).__RIA_YOGA_MODULE__;
  const options = yogaWasm ? {
    instantiateWasm(imports: WebAssembly.Imports, receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
      const instance = new WebAssembly.Instance(yogaWasm, imports);
      receive(instance, yogaWasm);
      return instance.exports;
    },
  } : undefined;
  return wrapAssembly(await loadYogaImpl(options));
}

export * from "../node_modules/yoga-layout/dist/src/generated/YGEnums.js";
