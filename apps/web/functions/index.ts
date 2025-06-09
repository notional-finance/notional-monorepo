interface Env {
  KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async () => {
  return new Response('Hello World');
};
