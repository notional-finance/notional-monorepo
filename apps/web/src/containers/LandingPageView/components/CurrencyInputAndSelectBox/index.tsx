import { styled } from '@mui/material'
import { CurrencyInputHandle, H4 } from '@notional-finance/mui'
import { LendBorrowInput } from '@notional-finance/trade'
import { useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import { updateLandingState, useLandingPageInput } from '../../store'

const StyledLabel = styled(H4)(
  ({ theme }) => `
  padding-top: 1px;
  background: ${theme.gradient.landing};
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`
)

export const CurrencyInputAndSelectBox = () => {
  const { availableCurrencies, selectedToken, lendOrBorrow, selectedMarketKey } = useLandingPageInput()
  const inputRef = useRef<CurrencyInputHandle>(null)
  useEffect(() => {
    // Trigger this one time after the inputRef has loaded to set the default input amount
    inputRef.current?.setInputOverride('10000')
  }, [inputRef])

  return (
    <>
      <StyledLabel inline fontWeight="regular">
        <FormattedMessage defaultMessage={'Amount Entry'} />
      </StyledLabel>
      <LendBorrowInput
        availableTokens={availableCurrencies}
        selectedToken={selectedToken}
        ref={inputRef}
        isRemoveAsset={false}
        cashOrfCash={'Cash'}
        lendOrBorrow={lendOrBorrow}
        selectedMarketKey={selectedMarketKey}
        onChange={({ selectedToken: newToken, inputAmount, hasError, netfCashAmount }) => {
          if (selectedToken !== newToken) {
            updateLandingState({
              selectedToken,
              selectedMarketKey: '',
              inputAmount: undefined,
              hasError: false,
              fCashAmount: undefined
            })
          } else {
            updateLandingState({
              inputAmount,
              hasError,
              fCashAmount: netfCashAmount
            })
          }
        }}
        errorMsgOverride={null} // Don't show error messages on landing
        style={{
          landingPage: true
        }}
      />
    </>
  )
}
