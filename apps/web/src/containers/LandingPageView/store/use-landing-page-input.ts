import { LEND_BORROW } from '@notional-finance/utils'
import { formatMaturity } from '@notional-finance/utils'
import { useCurrency, useCurrencyData, useMarkets, useSelectedMarket } from '@notional-finance/notionable-hooks'
import { Market, NTokenValue } from '@notional-finance/sdk/src/system'
import { useObservableState } from 'observable-hooks'
import { useEffect } from 'react'
import { landingState$, initialLandingState, updateLandingState } from './landing-store'

export function useLandingPageInput() {
  const { tradableCurrencyList } = useCurrency()
  const { selectedMarketKey, selectedToken, inputAmount, hasError, fCashAmount, lendOrBorrow } = useObservableState(
    landingState$,
    initialLandingState
  )
  const selectedMarket = useSelectedMarket(selectedMarketKey)
  const markets = useMarkets(selectedToken)
  const { id: currencyId } = useCurrencyData(selectedToken)

  // Only underlying tokens for this selector
  const availableCurrencies = tradableCurrencyList.map(
    ({ assetSymbol, underlyingSymbol }) => underlyingSymbol || assetSymbol
  )

  const inputAmountUnderlying = inputAmount?.toUnderlying(true)
  const tradedRate =
    inputAmountUnderlying && fCashAmount ? selectedMarket?.interestRate(fCashAmount, inputAmountUnderlying) : undefined
  const slippage =
    selectedMarket && tradedRate
      ? Market.formatInterestRate(Math.abs(selectedMarket.marketAnnualizedRate() - tradedRate))
      : undefined
  const maturity = selectedMarket ? formatMaturity(selectedMarket?.maturity) : ''
  const queryString =
    inputAmount && selectedMarketKey ? `?amount=${inputAmount.toString()}&marketKey=${selectedMarketKey}` : ''
  const defaultCollateral = selectedToken === 'ETH' ? 'USDC' : 'ETH'
  const ctaLink =
    lendOrBorrow === LEND_BORROW.BORROW
      ? `/${lendOrBorrow}/${selectedToken}/${defaultCollateral}${queryString}`
      : `/${lendOrBorrow}/${selectedToken}${queryString}`

  let nTokenYieldString = '0.00%'
  try {
    if (currencyId) {
      const nTokenYield = NTokenValue.getNTokenBlendedYield(currencyId)
      const nTokenIncentiveYield = NTokenValue.getNTokenIncentiveYield(currencyId)
      nTokenYieldString = Market.formatInterestRate(nTokenYield + nTokenIncentiveYield, 2)
    }
  } catch (e) {
    // No need to catch the error here, will just set the value to zero
  }

  useEffect(() => {
    // Determine the selected markets based on the one with the most liquidity
    if (!selectedMarketKey) {
      const mostLiquidMarket = markets
        .sort((a, b) => {
          return a.market.totalLiquidity.gt(b.market.totalLiquidity) ? 1 : -1
        })
        .find((m) => m.hasLiquidity)
      if (mostLiquidMarket) updateLandingState({ selectedMarketKey: mostLiquidMarket.marketKey })
    }
  }, [selectedToken, markets, selectedMarketKey])

  return {
    availableCurrencies,
    selectedToken,
    selectedMarketKey,
    lendOrBorrow,
    tradedRate,
    hasError,
    maturity,
    slippage,
    ctaLink,
    nTokenYieldString
  }
}
