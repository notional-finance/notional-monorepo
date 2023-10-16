import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { LiquidityContext } from '../../liquidity';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import { PRODUCTS, leveragedYield } from '@notional-finance/util';
import {
  ButtonData,
  ButtonText,
  ManageSideDrawer,
  SideDrawerButton,
} from '@notional-finance/mui';
import { useLeveragedNTokenPositions } from '../hooks';
import {
  formatMaturity,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { useAllMarkets } from '@notional-finance/notionable-hooks';

export const ManageLeveragedLiquidity = () => {
  const theme = useTheme();
  const { selectedDepositToken } = useParams<{
    selectedDepositToken?: string;
  }>();
  const {
    state: { debtOptions, collateral },
    updateState,
  } = useContext(LiquidityContext);
  const {
    yields: { liquidity },
  } = useAllMarkets();
  const { currentPosition } = useLeveragedNTokenPositions(selectedDepositToken);
  const nTokenAPY = liquidity.find(
    (y) => y.token.id === collateral?.id
  )?.totalAPY;

  const rollMaturityOptions = (debtOptions || [])
    .filter((t) => t.token.id !== currentPosition?.debt.tokenId)
    .map((o) => {
      const label =
        o.token.tokenType === 'fCash' ? (
          <FormattedMessage
            defaultMessage={'Roll to {date}'}
            values={{ date: formatMaturity(o.token.maturity || 0) }}
          />
        ) : (
          <FormattedMessage defaultMessage={'Convert to Variable'} />
        );
      const totalAPY = leveragedYield(
        nTokenAPY,
        o.interestRate,
        currentPosition?.leverageRatio
      );

      return (
        <SideDrawerButton
          key={o.token.id}
          onClick={() => updateState({ debt: o.token })}
          to={`/${PRODUCTS.LEND_LEVERAGED}/RollMaturity/${o.token.id}`}
        >
          <ButtonText sx={{ flex: 1 }}>{label}</ButtonText>
          {totalAPY !== undefined && (
            <ButtonData>{`${formatNumberAsPercent(totalAPY)} APY`}</ButtonData>
          )}
        </SideDrawerButton>
      );
    });

  const optionSections = [
    {
      buttons: [
        {
          label: <FormattedMessage defaultMessage={'Deposit'} />,
          link: `${PRODUCTS.LIQUIDITY_LEVERAGED}/IncreaseLeveragedNToken/${selectedDepositToken}`,
        },
        {
          label: <FormattedMessage defaultMessage={'Withdraw'} />,
          link: `${PRODUCTS.LIQUIDITY_LEVERAGED}/Withdraw/${selectedDepositToken}`,
        },
        {
          label: <FormattedMessage defaultMessage={'Adjust Leverage'} />,
          link: `${PRODUCTS.LIQUIDITY_LEVERAGED}/AdjustLeverage/${selectedDepositToken}`,
        },
      ].map(({ label, link }, index) => (
        <SideDrawerButton
          key={index}
          sx={{ padding: theme.spacing(2.5) }}
          to={link}
        >
          <ButtonText>{label}</ButtonText>
        </SideDrawerButton>
      )),
    },
    {
      title: <FormattedMessage defaultMessage={'Adjust Borrow Maturity'} />,
      buttons: rollMaturityOptions,
    },
  ];

  return (
    <ManageSideDrawer
      heading={
        <FormattedMessage
          defaultMessage={'Manage Leveraged {token} Liquidity'}
          values={{
            token: selectedDepositToken,
          }}
        />
      }
      detailsTable={<Box />}
      portfolioLink="/portfolio/holdings"
      optionSections={optionSections}
    />
  );
};
