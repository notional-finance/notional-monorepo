import { Network, getNowSeconds } from '@notional-finance/util';
import { Registry, AccountFetchMode } from '../../src';

describe.withRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Yield Registry',
  () => {
    it('fetches prime cash yields', () => {
      const y = Registry.getYieldRegistry().getPrimeCashYield(
        Network.ArbitrumOne
      );
      expect(y.length).toBe(6);
      y.forEach((y) => {
        expect(y.token.tokenType).toBe('PrimeCash');
        expect(y.totalAPY).toEqual(y.interestAPY);
        expect(y.tvl).toBeDefined();
      });
    });

    it('fetches prime debt yields', () => {
      const y = Registry.getYieldRegistry().getPrimeDebtYield(
        Network.ArbitrumOne
      );
      expect(y.length).toBe(6);
      y.forEach((y) => {
        expect(y.token.tokenType).toBe('PrimeDebt');
        expect(y.totalAPY).toEqual(y.interestAPY);
        expect(y.tvl).toBeDefined();
      });
    });

    it('fetches fcash yields', () => {
      const y = Registry.getYieldRegistry().getfCashYield(Network.ArbitrumOne);

      expect(y.length).toBe(12);
      y.forEach((y) => {
        expect(y.token.tokenType).toBe('fCash');
        expect(y.totalAPY).toEqual(y.interestAPY);
        expect(y.token.maturity! > getNowSeconds()).toBe(true);
        expect(y.tvl).toBeDefined();
      });
    });

    it('fetches ntoken yields', () => {
      const y = Registry.getYieldRegistry().getNTokenYield(Network.ArbitrumOne);
      expect(y.length).toBe(6);
      y.forEach((y) => {
        expect(y.token.tokenType).toBe('nToken');
        expect(y.totalAPY).toEqual(y.interestAPY);
        expect(y.tvl).toBeDefined();
      });
    });

    it('fetches leveraged lend yields', () => {
      const y = Registry.getYieldRegistry().getLeveragedLendYield(
        Network.ArbitrumOne
      );
      // 6 currencies, pDebt: 2, fCash: 4
      expect(y.length).toBe(36);
      y.forEach((y) => {
        expect(y.token.underlying).toBe(y.leveraged?.debtToken.underlying);
        expect(y.leveraged?.leverageRatio).toBeGreaterThan(0);
        expect(y.leveraged?.leverageRatio).toBeLessThanOrEqual(
          y.leveraged?.maxLeverageRatio
        );
      });
    });

    it('fetches leveraged ntoken yields', () => {
      const y = Registry.getYieldRegistry().getLeveragedNTokenYield(
        Network.ArbitrumOne
      );

      expect(y.length).toBe(18);
      y.forEach((y) => {
        expect(y.token.tokenType).toBe('nToken');
        expect(y.token.underlying).toBe(y.leveraged?.debtToken.underlying);
        expect(y.leveraged?.leverageRatio).toBeGreaterThan(0);
        expect(y.leveraged?.leverageRatio).toBeLessThanOrEqual(
          y.leveraged?.maxLeverageRatio
        );
      });
    });

    it('fetches leveraged vault yields', () => {
      const y = Registry.getYieldRegistry().getLeveragedVaultYield(
        Network.ArbitrumOne
      );

      expect(y.length).toBe(12);
      y.filter((y) => !!y.leveraged).forEach((y) => {
        expect(y.token.tokenType).toBe('VaultShare');
        expect(y.token.underlying).toBe(y.leveraged?.debtToken.underlying);
        expect(y.leveraged?.leverageRatio).toBeGreaterThan(0);
        expect(y.leveraged?.leverageRatio).toBeLessThanOrEqual(
          y.leveraged?.maxLeverageRatio
        );
        expect(y.tvl).toBeDefined();
      });
    });
  }
);
