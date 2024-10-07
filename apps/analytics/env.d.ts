// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CloudflareEnv {
  // The KV Namespace binding type used here comes
  // from `@cloudflare/workers-types`. To use it in such
  // a way make sure that you have installed the package
  // as a dev dependency and you have added it to your
  //`tsconfig.json` file under `compilerOptions.types`.
  // MY_KV: KVNamespace
}
