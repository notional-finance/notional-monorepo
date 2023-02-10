import { TokenBalance } from './tokens/TokenBalance';

export const tokenBalanceMatchers = {
  toEqTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.eq(a),
        message: `expected ${r.toExactString()} == ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: (e as TypeError).toString(),
      };
    }
  },
  toLtTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.lt(a),
        message: `expected ${r.toExactString()} < ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: (e as TypeError).toString(),
      };
    }
  },
  toLtEqTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.lte(a),
        message: `expected ${r.toExactString()} <= ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: (e as TypeError).toString(),
      };
    }
  },
  toGtTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.gt(a),
        message: `expected ${r.toExactString()} > ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: (e as TypeError).toString(),
      };
    }
  },
  toGtEqTB(r: TokenBalance, a: TokenBalance) {
    try {
      r.isMatch(a);
      return {
        pass: r.lte(a),
        message: `expected ${r.toExactString()} >= ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: (e as TypeError).toString(),
      };
    }
  },
  toBeApprox(r: TokenBalance, a: TokenBalance, rel = 1e-5) {
    try {
      r.isMatch(a);
      const pass = rel ? Math.abs(r.toFloat() / a.toFloat() - 1) <= rel : true;
      return {
        pass,
        message: `expected ${r.toExactString()} +/- ${rel} == ${a.toExactString()}`,
      };
    } catch (e) {
      return {
        pass: false,
        message: (e as TypeError).toString(),
      };
    }
  },
};
