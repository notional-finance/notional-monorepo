import {
  Network,
  PRIME_CASH_VAULT_MATURITY,
  RATE_DECIMALS,
  RATE_PRECISION,
  SECONDS_IN_DAY,
  getNowSeconds,
} from '@notional-finance/util';
import { Registry } from '../Registry';
import { Routes } from '../server';
import { ClientRegistry } from './client-registry';
import {
  OracleType,
  TokenDefinition,
  TokenType,
  YieldData,
} from '../Definitions';
import { fCashMarket } from '../exchanges';
import { TokenBalance } from '../token-balance';
import { BigNumber } from 'ethers';
import { SECONDS_IN_YEAR } from '@notional-finance/sdk';

/**
 * TODO:
 *  - add native token apy rate [yield registry]
 *  - add vault share yield [yield registry]
 *  - add nToken fees [yield registry]
 *  - add historical apy (no calculations necessary...)
 */
export class YieldRegistryClient extends ClientRegistry<YieldData> {
  protected cachePath() {
    return Routes.Yields;
  }

  private _getOracleRate(
    network: Network,
    tokenType: TokenType,
    oracleType: OracleType,
    blockTime = getNowSeconds()
  ): YieldData[] {
    const oracles = Registry.getOracleRegistry();
    const tokens = Registry.getTokenRegistry();

    return tokens
      .getAllTokens(network)
      .filter(
        (t) =>
          t.tokenType === tokenType &&
          (t.maturity ? t.maturity > blockTime : true)
      )
      .map((t) => {
        const key = `${t.underlying}:${t.id}:${oracleType}`;
        const o = oracles.getLatestFromSubject(network, key, 0);
        if (!o)
          throw Error(
            `Oracle Not Found: ${t.tokenType} ${t.maturity} ${oracleType}`
          );
        if (!t.underlying) throw Error(`Token has no underlying`);

        const interestAPY =
          (o.latestRate.rate.toNumber() * 100) / RATE_PRECISION;

        let nativeTokenAPY: number | undefined = undefined;
        if (tokenType === 'PrimeCash' || tokenType === 'PrimeDebt') {
          // TODO: fill this out with a value
          nativeTokenAPY = 0;
        }

        return {
          token: t,
          underlying: tokens.getTokenByID(network, t.underlying),
          totalAPY: interestAPY,
          interestAPY,
          nativeTokenAPY,
        };
      });
  }

  private _convertRatioToYield(num: TokenBalance, denom: TokenBalance) {
    if (num.isZero()) return 0;

    return (
      (num.toToken(denom.token).ratioWith(denom).toNumber() * 100) /
      RATE_PRECISION
    );
  }

  getPrimeCashYield(network: Network) {
    return this._getOracleRate(
      network,
      'PrimeCash',
      'PrimeCashSpotInterestRate'
    );
  }

  getPrimeDebtYield(network: Network) {
    return this._getOracleRate(
      network,
      'PrimeDebt',
      'PrimeDebtSpotInterestRate'
    );
  }

  getfCashYield(network: Network) {
    return this._getOracleRate(network, 'fCash', 'fCashSpotRate').filter(
      (y) => y.token.isFCashDebt === false
    );
  }

  getNTokenFees(
    nToken: TokenDefinition,
    _fromTimestamp: number,
    _toTimestamp: number = getNowSeconds()
  ) {
    // TODO: fill this out
    return TokenBalance.zero(nToken)
      .toPrimeCash()
      .scale(SECONDS_IN_YEAR, _toTimestamp - _fromTimestamp);
  }

  getNTokenYield(network: Network): YieldData[] {
    const exchanges = Registry.getExchangeRegistry();
    const config = Registry.getConfigurationRegistry();
    const tokens = Registry.getTokenRegistry();
    const yields = this.getPrimeCashYield(network).concat(
      this.getfCashYield(network)
    );

    return tokens
      .getAllTokens(network)
      .filter((t) => t.tokenType === 'nToken')
      .map((t) => {
        const fCashMarket = exchanges.getPoolInstance<fCashMarket>(
          network,
          t.address
        );
        if (!t.underlying) throw Error('underlying not defined');
        const underlying = tokens.getTokenByID(network, t.underlying);

        // Get total fees from the last week
        const nTokenFeesAnnualized = this.getNTokenFees(
          t,
          getNowSeconds() - SECONDS_IN_DAY * 7
        );
        const annualizedNOTEIncentives = config.getAnnualizedNOTEIncentives(t);
        const nTokenTVL = fCashMarket.totalValueLocked(0);

        // Total fees over the last week divided by the total value locked
        const feeAPY = this._convertRatioToYield(
          nTokenFeesAnnualized,
          nTokenTVL
        );
        const incentiveAPY = this._convertRatioToYield(
          annualizedNOTEIncentives,
          nTokenTVL
        );

        const { numerator, denominator } = fCashMarket.balances
          .map((b) => {
            const underlying = b.toUnderlying();
            const apy = yields.find((y) => y.token.id === b.tokenId)?.totalAPY;
            if (apy === undefined) {
              throw Error(`${b.symbol} yield not found`);
            }

            // Blended yield is the weighted average of the APYs
            return {
              numerator: underlying
                .mulInRatePrecision(Math.floor(apy * RATE_PRECISION))
                .scaleTo(RATE_DECIMALS),
              denominator: underlying.scaleTo(RATE_DECIMALS),
            };
          })
          .reduce(
            (r, { numerator, denominator }) => ({
              numerator: r.numerator + numerator.toNumber(),
              denominator: r.denominator + denominator.toNumber(),
            }),
            { numerator: 0, denominator: 0 }
          );
        const interestAPY = numerator / denominator;

        return {
          token: t,
          underlying,
          totalAPY: incentiveAPY + feeAPY + interestAPY,
          interestAPY,
          feeAPY,
          incentives: [
            {
              tokenId: annualizedNOTEIncentives.tokenId,
              incentiveAPY,
            },
          ],
        };
      });
  }

  calculateLeveragedAPY(
    yieldAPY: number,
    debtRate: number,
    leverageRatio: number
  ) {
    return yieldAPY + (yieldAPY - debtRate) * leverageRatio;
  }

  private _makeLeveraged(
    yieldData: YieldData,
    debt: YieldData,
    leverageRatio: number
  ): YieldData {
    return {
      token: yieldData.token,
      underlying: yieldData.underlying,
      totalAPY: this.calculateLeveragedAPY(
        yieldData.totalAPY,
        debt.totalAPY,
        leverageRatio
      ),
      leveraged: {
        debtToken: debt.token,
        debtRate: debt.totalAPY,
        leverageRatio,
      },
      incentives: yieldData.incentives?.map(({ tokenId, incentiveAPY }) => ({
        tokenId,
        incentiveAPY: this.calculateLeveragedAPY(
          incentiveAPY,
          0, // Debt rates do not apply to incentive APY calculation
          leverageRatio
        ),
      })),
    };
  }

  getLeveragedNTokenYield(network: Network): YieldData[] {
    const config = Registry.getConfigurationRegistry();
    const nTokenYields = this.getNTokenYield(network);
    const debtYields = this.getPrimeDebtYield(network).concat(
      this.getfCashYield(network)
    );

    return nTokenYields.flatMap((nToken) => {
      const { nTokenHaircut, nTokenMaxDrawdown } =
        config.getNTokenLeverageFactors(nToken.token);

      return debtYields
        .filter((d) => d.token.currencyId === nToken.token.currencyId)
        .map((debt) => {
          const pvFactor =
            debt.token.tokenType === 'fCash'
              ? TokenBalance.unit(debt.token)
                  .toUnderlying()
                  .scaleTo(RATE_DECIMALS)
              : RATE_PRECISION;
          // defaultLeverageRatio = [(1 - (pvFactor * nTokenHaircut * nTokenMaxDrawdown)) ^ -1] - 1
          const factor = BigNumber.from(RATE_PRECISION)
            .pow(3)
            .sub(
              BigNumber.from(pvFactor).mul(nTokenHaircut).mul(nTokenMaxDrawdown)
            );
          const inverted = BigNumber.from(RATE_PRECISION)
            .pow(4)
            .div(factor)
            .toNumber();
          const leverageRatio = inverted / RATE_PRECISION - 1;

          return this._makeLeveraged(nToken, debt, leverageRatio);
        });
    });
  }

  getLeveragedLendYield(network: Network) {
    const config = Registry.getConfigurationRegistry();
    const fCashYields = this.getfCashYield(network);
    const lendYields = this.getPrimeCashYield(network).concat(fCashYields);
    const debtYields = this.getPrimeDebtYield(network).concat(fCashYields);

    return lendYields.flatMap((lend) => {
      return debtYields
        .filter(
          (d) =>
            (d.token.tokenType === 'PrimeDebt'
              ? lend.token.tokenType !== 'PrimeCash'
              : true) &&
            (d.token.tokenType === 'fCash'
              ? lend.token.maturity !== d.token.maturity
              : true) &&
            d.token.currencyId === lend.token.currencyId
        )
        .map((debt) => {
          let leverageRatio: number;
          if (debt.token.tokenType === 'PrimeDebt') {
            const currentLendPV = TokenBalance.unit(lend.token)
              .toUnderlying()
              .scaleTo(RATE_DECIMALS);
            const lowestLendPV = config
              .getMinLendRiskAdjustedPV(lend.token)
              .scaleTo(RATE_DECIMALS);

            // Max fCash Value change
            // (currentLendPV - lowestLendPV) ^ -1 - 1
            leverageRatio =
              BigNumber.from(RATE_PRECISION)
                .pow(2)
                .div(currentLendPV.sub(lowestLendPV))
                .sub(RATE_PRECISION)
                .toNumber() / RATE_PRECISION;
          } else {
            const currentDebtPV = TokenBalance.unit(debt.token)
              .toUnderlying()
              .scaleTo(RATE_DECIMALS);

            // Max fCash Value change
            // (1 - currentDebtPV) ^ -1 - 1
            leverageRatio =
              BigNumber.from(RATE_PRECISION)
                .pow(2)
                .div(BigNumber.from(RATE_PRECISION).sub(currentDebtPV))
                .sub(RATE_PRECISION)
                .toNumber() / RATE_PRECISION;
          }

          return this._makeLeveraged(lend, debt, leverageRatio);
        });
    });
  }

  getLeveragedVaultYield(network: Network) {
    const config = Registry.getConfigurationRegistry();
    const fCashYields = this.getfCashYield(network);
    const debtYields = this.getPrimeDebtYield(network).concat(fCashYields);
    const tokens = Registry.getTokenRegistry();

    return tokens
      .getAllTokens(network)
      .filter(
        (v) =>
          v.tokenType === 'VaultShare' &&
          (v.maturity ? v.maturity > getNowSeconds() : true)
      )
      .map((v) => {
        const debt = debtYields.find(
          (d) =>
            d.token.currencyId === v.currencyId &&
            (v.maturity === PRIME_CASH_VAULT_MATURITY
              ? d.token.tokenType === 'PrimeDebt'
              : d.token.tokenType === 'fCash' &&
                d.token.maturity === v.maturity)
        );
        if (!debt) throw Error('Matching debt not found');
        if (!v.vaultAddress) throw Error('Vault address not defined');
        if (!v.underlying) throw Error('underlying is not defined');
        const underlying = tokens.getTokenByID(network, v.underlying);
        const { defaultLeverageRatio } = config.getVaultLeverageFactors(
          network,
          v.vaultAddress
        );

        const vaultShareYield = {
          token: v,
          underlying,
          totalAPY: 0,
        };

        return this._makeLeveraged(vaultShareYield, debt, defaultLeverageRatio);
      });
  }

  getAllYields(network: Network) {
    return this.getPrimeCashYield(network)
      .concat(this.getPrimeDebtYield(network))
      .concat(this.getNTokenYield(network))
      .concat(this.getfCashYield(network))
      .concat(this.getLeveragedLendYield(network))
      .concat(this.getLeveragedNTokenYield(network))
      .concat(this.getLeveragedVaultYield(network));
  }
}
