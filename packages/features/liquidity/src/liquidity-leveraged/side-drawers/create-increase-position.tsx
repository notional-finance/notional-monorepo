import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  TransactionSidebar,
  DepositInput,
  CustomTerms,
  DefaultTerms,
  ManageTerms,
  useLeveragedNTokenPositions,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { useContext } from 'react';
import { defineMessage } from 'react-intl';
import { LiquidityContext } from '../../liquidity';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';

export const CreateOrIncreasePosition = () => {
  const context = useContext(LiquidityContext);
  const {
    state: {
      selectedDepositToken,
      customizeLeverage,
      debt,
      selectedNetwork,
      deposit,
      isReady,
      availableDebtTokens,
    },
    updateState,
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();
  const { currentPosition, depositTokensWithPositions } =
    useLeveragedNTokenPositions(selectedNetwork, selectedDepositToken);

  if (
    !debt &&
    availableDebtTokens &&
    !currentPosition &&
    customizeLeverage &&
    isReady
  ) {
    const debt = availableDebtTokens?.find((t) => t.tokenType === 'PrimeDebt');
    updateState({ debt });
  }

  return (
    <TransactionSidebar
      context={context}
      riskComponent={currentPosition ? <LiquidityDetailsTable /> : undefined}
      variableBorrowRequired={debt?.tokenType === 'PrimeDebt'}
    >
      <DepositInput
        showScrollPopper
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => {
          return `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/${
            depositTokensWithPositions.includes(newToken || '')
              ? 'IncreaseLeveragedNToken'
              : 'CreateLeveragedNToken'
          }/${newToken}`;
        }}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      {currentPosition ? (
        <ManageTerms
          context={context}
          linkString={`/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/Manage/${deposit?.symbol}`}
        />
      ) : customizeLeverage ? (
        <CustomTerms context={context} />
      ) : (
        <DefaultTerms context={context} />
      )}
    </TransactionSidebar>
  );
};
