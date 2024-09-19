// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// assets
const visa = '/assets/images/e-commerce/visa.png';
const mastercard = '/assets/images/e-commerce/mastercard.png';

// ==============================|| CHECKOUT PAYMENT - CARD METHOD ||============================== //

interface PaymentCardProps {
  type: string;
  paymentType: string;
  cardHandler: (card: string) => void;
}

export default function PaymentCard({ type, paymentType, cardHandler }: PaymentCardProps) {
  const theme = useTheme();
  const card = type === 'visa' ? visa : mastercard;

  return (
    <MainCard
      content={false}
      sx={{
        overflow: 'hidden',
        opacity: paymentType === 'cod' ? 0.5 : 1,
        bgcolor: 'grey.A50',
        maxWidth: 380,
        '&:hover': {
          boxShadow: paymentType === 'cod' ? 'none' : theme.customShadows.primary,
          cursor: paymentType === 'cod' ? 'text' : 'pointer'
        }
      }}
    >
      <Stack
        spacing={8}
        sx={{
          p: 2
        }}
        onClick={() => cardHandler(type)}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={0}>
            <Typography variant="h5">{type === 'visa' ? 'Jennifer winget' : 'John Smith'}</Typography>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Typography variant="h2" color="inherit" sx={{ lineHeight: '0.5rem', fontFamily: 'auto' }}>
                .... .... ....
              </Typography>
              <Typography variant="h5" color="inherit">
                {type === 'visa' ? 5674 : 6790}
              </Typography>
            </Stack>
          </Stack>
          <Box
            sx={{
              backgroundImage: `url(${card})`,
              backgroundSize: 'contain',
              backgroundPosition: 'right',
              width: type === 'visa' ? 24 : 42,
              height: type === 'visa' ? 24 : 36.5
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={1} direction="row">
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.3 }}>
              CVV
            </Typography>
            <Typography variant="body2" color="inherit">
              {type === 'visa' ? 678 : 760}
            </Typography>
          </Stack>
          <Stack spacing={1} direction="row">
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.3 }}>
              Expire Date
            </Typography>
            <Typography variant="body2" color="inherit">
              {type === 'visa' ? '3 / 25' : '10 / 22'}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
