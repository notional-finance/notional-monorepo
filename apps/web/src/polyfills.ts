/**
 * Polyfill stable language features. These imports will be optimized by `@babel/preset-env`.
 *
 * See: https://github.com/zloirock/core-js#babel
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

window.global = window;
if (global === undefined) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const global = window;
}
