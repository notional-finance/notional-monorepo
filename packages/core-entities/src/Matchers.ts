import { TokenBalance } from './token-balance';

export const tokenBalanceMatchers = {
  toEqTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.eq(a),
        message: () => `expected ${r.toExactString()} == ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: () => (e as TypeError).toString(),
      };
    }
  },
  toLtTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.lt(a),
        message: () => `expected ${r.toExactString()} < ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: () => (e as TypeError).toString(),
      };
    }
  },
  toLtEqTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.lte(a),
        message: () => `expected ${r.toExactString()} <= ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: () => (e as TypeError).toString(),
      };
    }
  },
  toGtTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.gt(a),
        message: () => `expected ${r.toExactString()} > ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: () => (e as TypeError).toString(),
      };
    }
  },
  toGtEqTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.lte(a),
        message: () => `expected ${r.toExactString()} >= ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: () => (e as TypeError).toString(),
      };
    }
  },
  toBeApprox(r: TokenBalance, a: TokenBalance, rel = 5e-4, abs = 1e-5) {
    try {
      r.isMatch(a);
      const relSize = Math.abs(r.toFloat() * rel);
      const maxDiff = Math.abs(abs ? Math.max(abs, relSize) : relSize);
      const pass =
        r.toFloat() === a.toFloat() ||
        Math.abs(r.toFloat() - a.toFloat()) <= maxDiff;

      return {
        pass,
        message: () =>
          `expected ${r.toExactString()} ${r.symbol} +/- ${maxDiff.toFixed(
            8
          )} == ${a.toExactString()} ${a.symbol}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: () => (e as TypeError).toString(),
      };
    }
  },
};
