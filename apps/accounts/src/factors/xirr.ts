// Taken from: https://github.com/webcarrot/xirr
export type CashFlow = {
  readonly amount: number;
  readonly date: Date;
  readonly balance: number;
};

export type CashFlowNormalized = {
  readonly amount: number;
  readonly date: number;
};

export const calculateResult = (
  flowsFrom1: ReadonlyArray<CashFlowNormalized>,
  r: number
): number =>
  flowsFrom1.reduce<number>(
    (result, { date, amount }) => result + amount / Math.pow(r, date),
    0.0
  );

export const calculateResultDerivation = (
  flowsFrom1: ReadonlyArray<CashFlowNormalized>,
  r: number
): number =>
  flowsFrom1.reduce<number>(
    (result, { date, amount }) =>
      result - (date * amount) / Math.pow(r, date + 1.0),
    0.0
  );

export const calculate = (
  flows: ReadonlyArray<CashFlowNormalized>,
  guessRate: number = 0.1,
  maxEpsilon: number = 1e-10,
  maxScans: number = 200,
  maxIterations: number = 20
): number => {
  if (flows.findIndex(({ amount }) => amount > 0) === -1) {
    throw new RangeError('No positive amount was found in cash flows');
  }
  if (flows.findIndex(({ amount }) => amount < 0) === -1) {
    throw new RangeError('No negative amount was found in cash flows');
  }
  if (guessRate <= -1) {
    throw new RangeError('Guess rate is less than or equal to -1');
  }
  if (maxEpsilon <= 0) {
    throw new RangeError('Max epsilon is less than or equal to 0');
  }
  if (maxScans < 10) {
    throw new RangeError('Max scans is lower than 10');
  }
  if (maxIterations < 10) {
    throw new RangeError('Max iterations is lower than 10');
  }
  let resultRate = guessRate;
  let resultValue: number;
  let iterationScan: number = 0;
  let doLoop: boolean = false;
  const firstFlowAmount = flows[0].amount;
  const flowsFrom1 = flows.slice(1);
  do {
    if (iterationScan >= 1) {
      resultRate = -0.99 + (iterationScan - 1) * 0.01;
    }
    let iteration: number = maxIterations;
    do {
      resultValue =
        firstFlowAmount + calculateResult(flowsFrom1, resultRate + 1);
      const newRate: number =
        resultRate -
        resultValue / calculateResultDerivation(flowsFrom1, resultRate + 1);
      const rateEpsilon: number = Math.abs(newRate - resultRate);
      resultRate = newRate;
      doLoop = rateEpsilon > maxEpsilon && Math.abs(resultValue) > maxEpsilon;
    } while (doLoop && --iteration);
    doLoop =
      doLoop ||
      isNaN(resultRate) ||
      !isFinite(resultRate) ||
      isNaN(resultValue) ||
      !isFinite(resultValue);
  } while (doLoop && !(++iterationScan < maxScans));
  if (doLoop) {
    throw new Error(
      'XIRR calculation failed. Try to increase one of: max epsilon, max scans, max iterations'
    );
  }
  return resultRate;
};

const D_N = 365 * 86400;

export const normalize = (
  flows: ReadonlyArray<CashFlow>
): ReadonlyArray<CashFlowNormalized> => {
  const flowsN = flows
    .map<CashFlowNormalized>(({ amount, date }) => ({
      amount,
      date: date.getTime() / 1000,
    }))
    .sort((a, b) => a.date - b.date);
  const firstDate: number = flowsN[0].date;
  return flowsN.map<CashFlowNormalized>(({ amount, date }) => ({
    amount,
    date: (date - firstDate) / D_N,
  }));
};

export const xirr = (
  flows: ReadonlyArray<CashFlow>,
  guessRate?: number,
  maxEpsilon?: number,
  maxScans?: number,
  maxIterations?: number
): number =>
  calculate(normalize(flows), guessRate, maxEpsilon, maxScans, maxIterations);
