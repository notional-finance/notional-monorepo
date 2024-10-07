// material-ui
import Box from '@mui/material/Box';
import { ChipProps } from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import Typography from '@mui/material/Typography';
import CustomTooltip from 'components/@extended/Tooltip';

// project import
import MainCard from 'components/MainCard';

// ==============================|| STATISTICS - ECOMMERCE CARD ||============================== //

interface Props {
  title: string;
  count: string;
  percentage?: number;
  isLoss?: boolean;
  color?: ChipProps['color'];
  extra: string;
}

export default function AnalyticEcommerce({ color = 'primary', title, count, percentage, isLoss, extra }: Props) {
  const theme = useTheme();
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack spacing={0.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{title}</Typography>
          <CustomTooltip
            title="Max LTV = Collateral factor of collateral asset / Debt factor of debt asset Cross currency collateral and debt factors are used if the debt is in a different currency than the collateral (ex. USDC vs. ETH)."
            color="secondary"
          >
            <QuestionCircleOutlined style={{ fontSize: '18px', color: theme.palette.primary.main }} />
          </CustomTooltip>
        </Box>

        <Grid container alignItems="center">
          <Grid item>
            <Typography
              sx={{
                color: '#012E3A',
                fontFamily: 'Avenir Next',
                fontSize: '24px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: '32px',
                margin: '0px'
              }}
            >
              {count}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
      <Box sx={{ pt: 2.25 }}>
        <Typography variant="caption" color="text.secondary">
          Cross Currency
        </Typography>
      </Box>
    </MainCard>
  );
}
