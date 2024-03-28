import { useTheme, Box, styled } from '@mui/material';
import { H2, Subtitle } from '@notional-finance/mui';
import sNOTE from '../assets/sNOTE.svg';
import NOTE from '../assets/NOTE.svg';
import { ReactNode } from 'react';

interface SectionTitleProps {
  symbol?: string;
  title: ReactNode;
}

export const SectionTitle = ({ symbol, title }: SectionTitleProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
      }}
    >
      {symbol === 'snote' && (
        <img
          src={sNOTE}
          alt="icon"
          style={{
            height: theme.spacing(5),
            width: theme.spacing(5),
          }}
        />
      )}
      {symbol === 'note' && (
        <img
          src={NOTE}
          alt="icon"
          style={{
            height: theme.spacing(5),
            width: theme.spacing(5),
          }}
        />
      )}
      <H2 sx={{ marginLeft: symbol ? theme.spacing(2) : '' }}>{title}</H2>
    </Box>
  );
};

export const ContentContainer = styled(Box)(
  `
    height: 100%;
    max-width: 1230px;
    margin: auto;
      `
);

export const SubText = styled(Subtitle)(
  ({ theme }) => `
    max-width: ${theme.spacing(62)};
    padding-bottom: ${theme.spacing(4)};
      `
);

// export const MainContainer = styled(Box)(
//   ({ theme }) => `
//     background: transparent;
//     height: 100%;
//     overflow: hidden;
//     max-width: 1230px;
//     margin: auto;
//     position: relative;
//     z-index: 3;
//     @media (max-width: 1280px) {
//       max-width: ${theme.spacing(137.5)};
//     }
//     ${theme.breakpoints.down('md')} {
//       max-width: 90%;
//       margin: auto;
//     }
//       `
// );
