import { Box, alpha, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import {
  Caption,
  CountUp,
  H3,
  H5,
  LargeInputTextEmphasized,
  LinkText,
} from '@notional-finance/mui';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

interface StateZeroCardProps {
  card: {
    cardLink: string;
    accentTitle: string;
    title: string;
    icon: JSX.Element;
    symbol: string;
    apyTitle: string;
    isTotalAPYSuffix?: boolean;
    apy: number;
    bottomValue: string;
    bottomLink: string;
    bottomText: string;
    pillData: string[];
    availableSymbols?: string[];
  };
  index: number;
}

interface CardDataProps {
  theme: NotionalTheme;
  disabled: boolean;
}

export const StateZeroCard = ({ card, index }: StateZeroCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const selectedNetwork = useSelectedNetwork();
  const disabledCard = card.apy === undefined ? true : false;

  return (
    <CardBoxContainer>
      <BoxContainer
        theme={theme}
        disabled={disabledCard && !card?.availableSymbols ? true : false}
      />
      <CardBox
        theme={theme}
        key={index}
        disabled={disabledCard}
        onClick={() => (!disabledCard ? navigate(card.cardLink) : null)}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing(4),
            svg: {
              height: theme.spacing(4),
              width: theme.spacing(4),
              fill: theme.palette.typography.main,
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <H5
              sx={{
                color: theme.palette.primary.light,
                paddingBottom: theme.spacing(0.5),
                fontWeight: 600,
              }}
            >
              {card.accentTitle}
            </H5>
            <ProductName>{card.title}</ProductName>
          </Box>
          {card.icon}
        </Box>
        <Box
          sx={{
            background: theme.palette.background.default,
            padding: theme.spacing(2),
            borderRadius: theme.shape.borderRadius(),
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TokenIcon
            symbol={card.symbol}
            size="xl"
            style={{ marginRight: theme.spacing(2) }}
            network={selectedNetwork}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {!disabledCard ? (
              <>
                <H5>{card?.apyTitle}</H5>
                <ApyText>
                  <CountUp
                    value={card.apy}
                    suffix={card?.isTotalAPYSuffix ? '% Total APY' : '% APY'}
                    duration={1}
                    decimals={2}
                  />
                </ApyText>
              </>
            ) : (
              <H3>-</H3>
            )}
          </Box>
        </Box>

        <Caption
          sx={{
            width: '100%',
            textAlign: 'right',
            height: theme.spacing(2),
            marginTop: theme.spacing(0.5),
          }}
        >
          {card.bottomValue && !card?.availableSymbols && !disabledCard ? (
            card.bottomValue
          ) : disabledCard && card?.availableSymbols ? (
            <FormattedMessage
              defaultMessage={`{symbol} not available`}
              values={{
                symbol: card.symbol,
              }}
            />
          ) : (
            '-'
          )}
        </Caption>
        {disabledCard && card?.availableSymbols ? (
          <Box sx={{ width: '100%' }}>
            <H5>
              <FormattedMessage defaultMessage={'Available Currencies:'} />
            </H5>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '4px',
                width: '100%',
                marginTop: theme.spacing(1),
              }}
            >
              {card?.availableSymbols.map((tokenSymbol) => (
                <TokenIcon symbol={tokenSymbol} size="medium" />
              ))}
            </Box>
          </Box>
        ) : (
          <PillContainer>
            {card.pillData.map((pill, index) => (
              <PillBox key={index}>
                <Caption sx={{ color: theme.palette.typography.main }}>
                  {pill}
                </Caption>
              </PillBox>
            ))}
          </PillContainer>
        )}
      </CardBox>
      <LinkTextBox to={card.bottomLink}>{card.bottomText}</LinkTextBox>
    </CardBoxContainer>
  );
};

const CardBoxContainer = styled(Box)(
  ({ theme }) => `
         display: flex; 
         flex-direction: column;
         height: 307px;
         width: ${theme.spacing(51)};
         @media (max-width: 1375px) {
          width: ${theme.spacing(48)}
         }
         ${theme.breakpoints.down('sm')} {
           height: 100%;
           margin-bottom: ${theme.spacing(5)};
         };
      `
);

const ProductName = styled(LargeInputTextEmphasized)(
  ({ theme }) => `
         white-space: nowrap;
         ${theme.breakpoints.down('sm')} {
            font-size: 20px;
         };
      `
);

const ApyText = styled(H3)(
  ({ theme }) => `
         ${theme.breakpoints.down('sm')} {
            font-size: 20px;
         };
      `
);

const LinkTextBox = styled(LinkText)(
  ({ theme }) => `
         margin-top: ${theme.spacing(2)};
         ${theme.breakpoints.down('sm')} {
            display: none;
         };
      `
);

const PillContainer = styled(Box)(
  ({ theme }) => `
        display: flex;
        gap: 4px;
        width: 100%;
        margin-top: ${theme.spacing(3)};
        ${theme.breakpoints.down('sm')} {
           flex-wrap: wrap;
         };
      `
);

const BoxContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'disabled',
})(
  ({ theme, disabled }: CardDataProps) => `
          height: inherit;
          border-radius: 6px;
          background: ${alpha(colors.darkGrey, 0.5)};
          position: absolute;
          z-index: 2;
          display: ${disabled ? 'block' : 'none'};
          width: ${theme.spacing(51)};
          @media (max-width: 1375px) {
            width: ${theme.spacing(48)};
          };
          ${theme.breakpoints.down('sm')} {
           display: none;
         };
      `
);

const CardBox = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'disabled',
})(
  ({ theme, disabled }: CardDataProps) => `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        height: 100%;
        width: 100%;
        padding: ${theme.spacing(4)};
        border-radius: ${theme.shape.borderRadius()};
        border: ${theme.shape.borderStandard};
        background: ${theme.palette.background.paper};
        ${theme.breakpoints.up('sm')} {
          ${
            disabled
              ? ''
              : theme.gradient.hoverTransition(
                  theme.palette.background.paper,
                  theme.palette.info.light
                )
          }
        }
      ${
        disabled
          ? ''
          : `&:hover {
          z-index: 5;
          overflow: visible;
          cursor: pointer;
          border: 1px solid ${theme.palette.primary.light};
          transition: 0.3s ease;
          transform: scale(1.02);
          #incentive {
              background: rgba(19, 187, 194, 0.10);
          }
        }`
      }
      ${theme.breakpoints.down('sm')} {
          &:hover {
            border: ${theme.shape.borderStandard};
          background: ${theme.palette.background.paper};
          }
       };
      `
);

const PillBox = styled(Box)(
  ({ theme }) => `
        display: flex;
        align-items: center;
        border-radius: 20px;
        color: ${theme.palette.typography.main};
        padding: ${theme.spacing(0.5, 2)};
        background: ${theme.palette.info.light};
      `
);

export default StateZeroCard;
