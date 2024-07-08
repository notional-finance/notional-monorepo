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
import { useHistory } from 'react-router';

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
  };
  index: number;
}

interface CardDataProps {
  theme: NotionalTheme;
  disabled: boolean;
}

export const StateZeroCard = ({ card, index }: StateZeroCardProps) => {
  const theme = useTheme();
  const history = useHistory();
  const selectedNetwork = useSelectedNetwork();
  const disabledCard = card.apy === undefined ? true : false;

  return (
    <CardBoxContainer>
      <BoxContainer theme={theme} disabled={disabledCard} />
      <CardBox
        theme={theme}
        key={index}
        disabled={disabledCard}
        onClick={() => (!disabledCard ? history.push(card.cardLink) : null)}
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
            <LargeInputTextEmphasized sx={{ whiteSpace: 'nowrap' }}>
              {card.title}
            </LargeInputTextEmphasized>
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
                <H3>
                  <CountUp
                    value={card.apy}
                    suffix={card?.isTotalAPYSuffix ? '% Total APY' : '% APY'}
                    duration={1}
                    decimals={2}
                  />
                </H3>
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
          {card.bottomValue ? card.bottomValue : ''}
        </Caption>
        <Box
          sx={{
            display: 'flex',
            gap: '4px',
            width: '100%',
            marginTop: theme.spacing(3),
          }}
        >
          {card.pillData.map((pill, index) => (
            <PillBox key={index}>
              <Caption sx={{ color: theme.palette.typography.main }}>
                {pill}
              </Caption>
            </PillBox>
          ))}
        </Box>
      </CardBox>
      <LinkText to={card.bottomLink} sx={{ marginTop: theme.spacing(2) }}>
        {card.bottomText}
      </LinkText>
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
         }
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
        ${
          disabled
            ? ''
            : theme.gradient.hoverTransition(
                theme.palette.background.paper,
                theme.palette.info.light
              )
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
      }`
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
