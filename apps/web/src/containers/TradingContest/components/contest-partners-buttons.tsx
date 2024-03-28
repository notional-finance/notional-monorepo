import { Box, styled, useTheme } from '@mui/material';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ContestPartnersButtonsProps {
  setPartnerCallback: (partnerId: number) => void;
  partnerId: number;
}

interface PartnerButtonProps {
  theme: NotionalTheme;
  active: boolean;
}

export const ContestPartnersButtons = ({
  setPartnerCallback,
  partnerId,
}: ContestPartnersButtonsProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        fontSize: '12px',
        display: 'flex',
        textTransform: 'uppercase',
        float: 'right',
      }}
    >
      <PartnerButton
        active={partnerId === 0}
        theme={theme}
        onClick={() => setPartnerCallback(0)}
      >
        <FormattedMessage defaultMessage={'All'} />
      </PartnerButton>
      <PartnerButton
        active={partnerId === 3}
        theme={theme}
        onClick={() => setPartnerCallback(3)}
      >
        <FormattedMessage defaultMessage={'Llama'} />
      </PartnerButton>
      <PartnerButton
        active={partnerId === 2}
        theme={theme}
        onClick={() => setPartnerCallback(2)}
      >
        <FormattedMessage defaultMessage={'L2DAO'} />
      </PartnerButton>
      <PartnerButton
        active={partnerId === 1}
        theme={theme}
        onClick={() => setPartnerCallback(1)}
      >
        <FormattedMessage defaultMessage={'CRYPTOTESTERS'} />
      </PartnerButton>
    </Box>
  );
};

const PartnerButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: PartnerButtonProps) => `
  padding: 10px;
  padding-bottom: 0px;
  cursor: pointer;
  color: ${active ? colors.neonTurquoise : colors.matteGreen};
  border-bottom: 5px solid ${active ? colors.neonTurquoise : colors.matteGreen};
    ${theme.breakpoints.down('md')} {
      display: none;
    }
      `
);

export default ContestPartnersButtons;
