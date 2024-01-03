import {
  Network,
  PRIME_CASH_VAULT_MATURITY,
  RATE_DECIMALS,
  RATE_PRECISION,
  SECONDS_IN_DAY,
  getNowSeconds,
  isIdiosyncratic,
} from '@notional-finance/util';
import { Registry } from '../Registry';
import { Routes } from '../server';
import { ClientRegistry } from './client-registry';
import { TokenType, YieldData } from '../Definitions';
import { TokenBalance } from '../token-balance';
import { BigNumber } from 'ethers';
import { whitelistedVaults } from '../config/whitelisted-vaults';

export class YieldRegistryClient extends ClientRegistry<YieldData> {
  protected cachePath() {
    return Routes.Yields;
  }

  private _getSpotRate(
    network: Network,
    tokenType: TokenType,
    blockTime = getNowSeconds()
  ): YieldData[] {
    const exchanges = Registry.getExchangeRegistry();
    const tokens = Registry.getTokenRegistry();

    return tokens
      .getAllTokens(network)
      .filter(
        (t) =>
          t.tokenType === tokenType &&
          (t.maturity ? t.maturity > blockTime : true)
      )
      .map((t) => {
        if (!t.currencyId) throw Error('Missing currency id');
        if (!t.underlying) throw Error(`Token has no underlying`);
        const market = exchanges.getNotionalMarket(network, t.currencyId);
        const interestAPY = market.getSpotInterestRate(t) || 0;
        const underlying = tokens.getTokenByID(network, t.underlying);

        let nativeTokenAPY: number | undefined = undefined;
        if (tokenType === 'PrimeCash' || tokenType === 'PrimeDebt') {
          // TODO: fill this out with a value
          nativeTokenAPY = 0;
        }

        return {
          token: t,
          tvl: t.totalSupply?.toUnderlying() || TokenBalance.zero(underlying),
          underlying,
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
    return this._getSpotRate(network, 'PrimeCash');
  }

  getPrimeDebtYield(network: Network) {
    return this._getSpotRate(network, 'PrimeDebt');
  }

  getfCashYield(network: Network) {
    const exchanges = Registry.getExchangeRegistry();

    return this._getSpotRate(network, 'fCash')
      .filter(
        (y) =>
          y.token.isFCashDebt === false &&
          !!y.token.maturity &&
          !isIdiosyncratic(y.token.maturity)
      )
      .map((y) => {
        if (!y.token.maturity || !y.token.currencyId) throw Error();

        const fCashMarket = exchanges.getfCashMarket(
          network,
          y.token.currencyId
        );
        const marketIndex = fCashMarket.getMarketIndex(y.token.maturity);
        const pCash = fCashMarket.poolParams.perMarketCash[marketIndex - 1];
        const fCash = fCashMarket.poolParams.perMarketfCash[marketIndex - 1];

        // Adds the prime cash value in the nToken to the fCash TVL
        return Object.assign(y, {
          tvl: fCash.toUnderlying().add(pCash.toUnderlying()),
        });
      });
  }

  getSimulatedNTokenYield(netNTokens: TokenBalance): YieldData {
    const network = netNTokens.network;

    const exchanges = Registry.getExchangeRegistry();
    const config = Registry.getConfigurationRegistry();
    const nTokenFees =
      Registry.getAnalyticsRegistry().getNTokenTradingFees(network);
    const fCashMarket = exchanges.getfCashMarket(
      network,
      netNTokens.currencyId
    );

    const underlying = netNTokens.underlying;
    if (!underlying) throw Error('underlying not defined');

    const { incentiveEmissionRate: annualizedNOTEIncentives } =
      config.getAnnualizedNOTEIncentives(netNTokens.token);
    const nTokenTVL = fCashMarket
      .totalValueLocked(0)
      .add(netNTokens.toPrimeCash());

    // Total fees over the last week divided by the total value locked
    const feeAPY =
      nTokenFees?.find((f) => f.token.id === netNTokens.tokenId)?.apy || 0;
    const incentiveAPY = this._convertRatioToYield(
      annualizedNOTEIncentives,
      nTokenTVL
    );

    const { numerator, denominator } = fCashMarket.balances
      .map((b) => {
        const underlying = b.toUnderlying();
        const apy =
          b.tokenType === 'PrimeCash'
            ? (fCashMarket.getPrimeSupplyRate(
                fCashMarket.getPrimeCashUtilization(netNTokens.toPrimeCash())
              ) *
                100) /
              RATE_PRECISION
            : fCashMarket.getSpotInterestRate(b.token);
        if (apy === undefined) {
          throw Error(`${b.symbol} yield not found`);
        }

        // Blended yield is the weighted average of the APYs
        return {
          numerator: underlying
            .mulInRatePrecision(Math.floor(apy * RATE_PRECISION))
            .toFloat(),
          denominator: underlying.toFloat(),
        };
      })
      .reduce(
        (r, { numerator, denominator }) => ({
          numerator: r.numerator + numerator,
          denominator: r.denominator + denominator,
        }),
        { numerator: 0, denominator: 0 }
      );
    const interestAPY = numerator / denominator;

    return {
      token: netNTokens.token,
      tvl: netNTokens.token.totalSupply?.toUnderlying(),
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
  }

  getNTokenYield(network: Network): YieldData[] {
    const tokens = Registry.getTokenRegistry();

    return tokens
      .getAllTokens(network)
      .filter((t) => t.tokenType === 'nToken')
      .map((t) => {
        return this.getSimulatedNTokenYield(TokenBalance.zero(t));
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
    leverageRatio: number,
    maxLeverageRatio: number
  ): YieldData {
    return {
      token: yieldData.token,
      underlying: yieldData.underlying,
      tvl:
        yieldData.token.totalSupply?.toUnderlying() ||
        TokenBalance.zero(yieldData.underlying),
      totalAPY: this.calculateLeveragedAPY(
        yieldData.totalAPY,
        debt.totalAPY,
        leverageRatio
      ),
      strategyAPY: yieldData.totalAPY,
      leveraged: {
        debtToken: debt.token,
        debtRate: debt.totalAPY,
        leverageRatio,
        maxLeverageRatio,
      },
      vaultName: yieldData?.vaultName,
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
      const { nTokenHaircut } = config.getNTokenLeverageFactors(nToken.token);

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
          // const factor = BigNumber.from(RATE_PRECISION)
          //   .pow(3)
          //   .sub(
          //     BigNumber.from(pvFactor).mul(nTokenHaircut).mul(nTokenMaxDrawdown)
          //   );
          // const inverted = BigNumber.from(RATE_PRECISION)
          //   .pow(4)
          //   .div(factor)
          //   .toNumber();
          // const leverageRatio = inverted / RATE_PRECISION - 1;

          const leverageRatio = 3.5;

          // maxLeverageRatio = [(1 - (pvFactor * nTokenHaircut)) ^ -1] - 1
          const maxFactor = BigNumber.from(RATE_PRECISION)
            .pow(2)
            .sub(BigNumber.from(pvFactor).mul(nTokenHaircut));
          const maxFactorInverted = BigNumber.from(RATE_PRECISION)
            .pow(3)
            .div(maxFactor)
            .toNumber();
          const maxLeverageRatio = maxFactorInverted / RATE_PRECISION - 1;

          return this._makeLeveraged(
            nToken,
            debt,
            leverageRatio,
            maxLeverageRatio
          );
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
            d.token.currencyId === lend.token.currencyId &&
            !(d.token.tokenType === 'fCash' && lend.token.tokenType === 'fCash')
        )
        .map((debt) => {
          let leverageRatio: number;
          let maxLeverageRatio: number;

          if (debt.token.tokenType === 'PrimeDebt') {
            const currentLendPV = TokenBalance.unit(lend.token)
              .toUnderlying()
              .scaleTo(RATE_DECIMALS);
            const { lowestDiscountFactor, maxDiscountFactor } =
              config.getMinLendRiskAdjustedDiscountFactor(lend.token);

            // (1 - maxDiscountFactor) ^ -1 - 1
            maxLeverageRatio =
              BigNumber.from(RATE_PRECISION)
                .pow(2)
                .div(BigNumber.from(RATE_PRECISION).sub(maxDiscountFactor))
                .sub(RATE_PRECISION)
                .toNumber() / RATE_PRECISION;

            // Max fCash Value change
            // (currentLendPV - lowestLendPV) ^ -1 - 1
            leverageRatio = Math.min(
              BigNumber.from(RATE_PRECISION)
                .pow(2)
                .div(currentLendPV.sub(lowestDiscountFactor))
                .sub(RATE_PRECISION)
                .toNumber() / RATE_PRECISION,
              maxLeverageRatio
            );
          } else {
            const currentDebtPV = TokenBalance.unit(debt.token)
              .toUnderlying()
              .scaleTo(RATE_DECIMALS);

            // Max leverage is theoretically infinity here since maxDebtPV = 1
            // when borrowing at a zero interest rate. For practical purposes, just
            // set the max leverage to a constant here.
            maxLeverageRatio = 50;

            // Max fCash Value change
            // (1 - currentDebtPV) ^ -1 - 1
            leverageRatio = Math.min(
              BigNumber.from(RATE_PRECISION)
                .pow(2)
                .div(BigNumber.from(RATE_PRECISION).sub(currentDebtPV))
                .sub(RATE_PRECISION)
                .toNumber() / RATE_PRECISION,
              maxLeverageRatio
            );
          }

          return this._makeLeveraged(
            lend,
            debt,
            leverageRatio,
            maxLeverageRatio
          );
        });
    });
  }

  getLeveragedVaultYield(network: Network) {
    const config = Registry.getConfigurationRegistry();
    const vaults = Registry.getVaultRegistry();
    const fCashYields = this.getfCashYield(network);
    const debtYields = this.getPrimeDebtYield(network).concat(fCashYields);
    const tokens = Registry.getTokenRegistry();
    const analytics = Registry.getAnalyticsRegistry();

    return tokens
      .getAllTokens(network)
      .filter(
        (v) =>
          v.tokenType === 'VaultShare' &&
          (v.maturity ? v.maturity > getNowSeconds() : true) &&
          !!v.vaultAddress &&
          vaults.isVaultEnabled(v.network, v.vaultAddress) &&
          whitelistedVaults.includes(v.vaultAddress)
      )
      .flatMap((v) => {
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
        // Ensures that the oracle registry side effect happens here so that we
        // can properly get the TVL value.
        vaults.getVaultAdapter(network, v.vaultAddress);
        const underlying = tokens.getTokenByID(network, v.underlying);
        const { defaultLeverageRatio, maxLeverageRatio } =
          config.getVaultLeverageFactors(network, v.vaultAddress);
        const vaultAPYs = (analytics
          .getVault(network, v.vaultAddress)
          ?.filter(
            ({ timestamp }) => timestamp > getNowSeconds() - 7 * SECONDS_IN_DAY
          )
          .map(({ totalAPY }) => totalAPY)
          .filter((apy) => apy !== null) || []) as number[];
        const totalAPY =
          vaultAPYs.length > 0
            ? vaultAPYs.reduce((t, a) => t + a, 0) / vaultAPYs.length
            : 0;

        const vaultShareYield: YieldData = {
          token: v,
          underlying,
          totalAPY,
          tvl: v.totalSupply?.toUnderlying() || TokenBalance.zero(underlying),
          vaultName: config.getVaultName(network, v.vaultAddress),
        };

        return [
          vaultShareYield,
          this._makeLeveraged(
            vaultShareYield,
            debt,
            defaultLeverageRatio,
            maxLeverageRatio
          ),
        ];
      });
  }

  getAllYields(network: Network) {
    if (!this.isNetworkRegistered(network)) return [];
    return Array.from(this.getLatestFromAllSubjects(network, 0).values()).sort(
      (a, b) => (a.token.currencyId || 0) - (b.token.currencyId || 0)
    );
  }

  protected override async _refresh(network: Network) {
    const allYields = this.getPrimeCashYield(network)
      .concat(this.getPrimeDebtYield(network))
      .concat(this.getNTokenYield(network))
      .concat(this.getfCashYield(network))
      .concat(this.getLeveragedLendYield(network))
      .concat(this.getLeveragedNTokenYield(network))
      .concat(this.getLeveragedVaultYield(network));

    return {
      values: allYields.map(
        (y) =>
          [`${y.token.id}:${y.leveraged?.debtToken.id || '-'}`, y] as [
            string,
            YieldData
          ]
      ),
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: 0,
    };
  }
}
