import { Box, styled } from '@mui/material';
import {
  Caption,
  LabelValue,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { useWalletBalanceInputCheck } from '@notional-finance/notionable-hooks';
import { DepositInputTransaction } from '../components/DepositInputTransaction';
import { PRODUCTS } from '@notional-finance/util';
import { useState } from 'react';
import { defineMessage } from 'react-intl';

const lendingOptions = [
  {
    title: 'Variable Rate',
    value: '6.14% APY',
  },
  {
    title: 'Sep 15, 2024',
    value: '5.26% Fixed APY',
  },
  {
    title: 'Dec 15, 2024',
    value: '4.02% Fixed APY',
  },
];

export const useInputContainer = () => {
  const { currencyInputRef } = useCurrencyInputRef();

  const [selectedToken] = useState<string | undefined | null>(undefined);
  const [amount, setAmount] = useState<number>(0);
  const [selectedLendingOption, setSelectedLendingOption] = useState(
    lendingOptions[0]
  );
  const { maxBalanceString } = useWalletBalanceInputCheck(undefined, undefined);

  const content = (
    <Container>
      <DepositInputTransaction
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        miniButtonLabel={'MAX'}
        onUpdate={(v) => setAmount(Number(v))}
        onMaxValue={() => setAmount(Number(maxBalanceString))}
        newRoute={(newToken) => `/${PRODUCTS.LEND_FIXED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: 'Lend',
        })}
      />

      <OptionsContainer>
        {lendingOptions.map((option, index) => (
          <LendingOption
            key={index}
            {...option}
            isSelected={selectedLendingOption === option}
            onClick={() => setSelectedLendingOption(option)}
          />
        ))}
      </OptionsContainer>
    </Container>
  );

  return {
    content,
    inputTextRow: undefined,
    button: {
      enabled: amount > 0 && !!selectedToken && !!selectedLendingOption,
      text: 'Continue to Review',
      onClick: () => {
        console.log('amount', amount);
        console.log('selectedToken', selectedToken);
        console.log('selectedLendingOption', selectedLendingOption);
      },
    },
  };
};

const Container = styled(Box)(
  () => `
    display: flex;
    flex-direction: column;
    width: 100%;
  `
);

const OptionsContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: ${theme.spacing(2)};
    `
);

const OptionWrapper = styled(Box)<{ isSelected?: boolean }>(
  ({ theme, isSelected }) => `
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing(1)};
    background-color: ${theme.palette.background.default};
    border-radius: ${theme.shape.borderRadius()};
    cursor: pointer;
    flex: 1;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing(0.5)};
    border: 1px solid ${theme.palette.borders.paper};
    &:hover {
      background-color: ${theme.palette.action.hover};
    }
    ${
      isSelected &&
      `
      background-color: ${theme.palette.info.light};
      border: 1px solid ${theme.palette.primary.light};
    `
    }
    `
);

interface LendingOptionProps {
  title: string;
  value: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const LendingOption = ({
  title,
  value,
  onClick,
  isSelected,
}: LendingOptionProps) => (
  <OptionWrapper onClick={onClick} isSelected={isSelected}>
    <Caption color="textSecondary">{title}</Caption>
    <LabelValue>{value}</LabelValue>
  </OptionWrapper>
);
