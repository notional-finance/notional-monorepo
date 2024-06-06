import { Box, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import {
  Caption,
  CountUp,
  H3,
  H5,
  LargeInputTextEmphasized,
  LinkText,
} from '@notional-finance/mui';
import { Network } from '@notional-finance/util';
import { useHistory } from 'react-router';

interface StateZeroCardProps {
  card: {
    cardLink: string;
    accentTitle: string;
    title: string;
    icon: JSX.Element;
    symbol: string;
    apyTitle: string;
    apy: number;
    bottomValue: string;
    bottomLink: string;
    bottomText: string;
    pillData: string[];
  };
  index: number;
}

export const StateZeroCard = ({ card, index }: StateZeroCardProps) => {
  const theme = useTheme();
  const history = useHistory();
  return (
    <CardBoxContainer>
      <CardBox key={index} onClick={() => history.push(card.cardLink)}>
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
            <LargeInputTextEmphasized>{card.title}</LargeInputTextEmphasized>
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
            network={Network.mainnet}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <H5>{card?.apyTitle}</H5>
            <H3>
              <CountUp
                value={card.apy || 0}
                suffix="%"
                duration={1}
                decimals={2}
              />
            </H3>
          </Box>
        </Box>
        {card.bottomValue && (
          <Caption
            sx={{
              width: '100%',
              textAlign: 'right',
              marginTop: theme.spacing(0.5),
            }}
          >
            {card.bottomValue}
          </Caption>
        )}
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
         width: 32%;
         @media (max-width: 1375px) {
          width: ${theme.spacing(48)}
         }
      `
);
const CardBox = styled(Box)(
  ({ theme }) => `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        height: 100%;
        width: 100%;
        padding: ${theme.spacing(4)};
        border-radius: ${theme.shape.borderRadius()};
        background: ${theme.palette.background.paper};
        border: ${theme.shape.borderStandard};
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
