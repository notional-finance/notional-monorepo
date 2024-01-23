import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { LiquidityContext } from '../../liquidity';
import { FormattedMessage } from 'react-intl';
import { PRODUCTS, leveragedYield } from '@notional-finance/util';
import {
  ButtonData,
  ButtonText,
  H5,
  ManageSideDrawer,
  SideDrawerButton,
} from '@notional-finance/mui';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { useLeveragedNTokenPositions } from '@notional-finance/trade';

export const ManageLeveragedLiquidity = () => {
  const theme = useTheme();
  const {
    state: { debtOptions, selectedDepositToken, selectedNetwork },
    updateState,
  } = useContext(LiquidityContext);
  const {
    yields: { liquidity },
  } = useAllMarkets(selectedNetwork);
  const { currentPosition } = useLeveragedNTokenPositions(
    selectedNetwork,
    selectedDepositToken
  );
  const nTokenAPY = liquidity.find(
    (y) => y.token.id === currentPosition?.asset?.balance.tokenId
  )?.totalAPY;

  const rollMaturityOptions = (debtOptions || [])
    .filter(
      (o) => o.token.currencyId === currentPosition?.asset.balance.currencyId
    )
    .map((o) => {
      const label =
        o.token.tokenType === 'fCash' ? (
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <FormattedMessage defaultMessage={'Roll to Fixed'} />
            <H5 sx={{ marginLeft: theme.spacing(1) }}>
              {formatMaturity(o.token.maturity || 0)}
            </H5>
          </Box>
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
          to={`/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/RollMaturity/${selectedDepositToken}`}
          variant="outlined"
          sx={{
            border: `1px solid ${theme.palette.primary.light}`,
            background: 'unset',
            ':hover': {
              background: theme.palette.info.light,
              '.button-data': {
                background: theme.palette.background.default,
              },
            },
          }}
        >
          <ButtonText sx={{ display: 'flex', flex: 1 }}>{label}</ButtonText>
          {totalAPY !== undefined && (
            <ButtonData
              className={`button-data`}
              sx={{
                background: theme.palette.info.light,
                border: 'unset',
              }}
            >{`${formatNumberAsPercent(totalAPY)} Total APY`}</ButtonData>
          )}
        </SideDrawerButton>
      );
    });

  const optionSections = [
    {
      buttons: [
        {
          label: <FormattedMessage defaultMessage={'Deposit'} />,
          link: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/IncreaseLeveragedNToken/${selectedDepositToken}`,
        },
        {
          label: <FormattedMessage defaultMessage={'Withdraw'} />,
          link: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/Withdraw/${selectedDepositToken}`,
        },
        {
          label: <FormattedMessage defaultMessage={'Adjust Leverage'} />,
          link: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/AdjustLeverage/${selectedDepositToken}`,
        },
      ].map(({ label, link }, index) => (
        <SideDrawerButton key={index} to={link}>
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
      detailsTable={<LiquidityDetailsTable hideUpdatedColumn />}
      portfolioLink={`/portfolio/${selectedNetwork}/holdings`}
      optionSections={optionSections}
    />
  );
};
