import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  TransactionSidebar,
  DepositInput,
  CustomTerms,
  ManageTerms,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components';
import { TransactionNetworkSelector } from '@notional-finance/wallet';
import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export const CreateOrIncreasePosition = () => {
  const context = useContext(LiquidityContext);
  const {
    state: { debt, selectedNetwork, deposit },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();
  const trade = useCurrentTradeContext();
  const { currentPosition, depositTokensWithPositions } =
    trade?.getLeveragedNTokenPositions() || {};

  return (
    <TransactionSidebar
      riskComponent={currentPosition ? <LiquidityDetailsTable /> : undefined}
      variableBorrowRequired={debt?.tokenType === 'PrimeDebt'}
      NetworkSelector={
        currentPosition === undefined ? (
          <TransactionNetworkSelector product={PRODUCTS.LIQUIDITY_LEVERAGED} />
        ) : undefined
      }
    >
      <DepositInput
        showScrollPopper
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        newRoute={(newToken) => {
          return `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/${
            depositTokensWithPositions?.includes(newToken || '')
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
          borrowType={
            currentPosition.debt.balance.tokenType === 'PrimeDebt'
              ? 'Variable'
              : 'Fixed'
          }
          leverageRatio={currentPosition.leverageRatio}
          linkString={`/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/Manage/${deposit?.symbol}`}
        />
      ) : (
        <CustomTerms context={context} />
      )}
    </TransactionSidebar>
  );
};
