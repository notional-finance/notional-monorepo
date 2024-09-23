// material-ui
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ==============================|| BASIC WIZARD - PAYMENT ||============================== //

export default function PaymentForm() {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Payment method
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Name On Card</InputLabel>
            <TextField required id="cardName" placeholder="Name on card" fullWidth autoComplete="cc-name" />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Card Number</InputLabel>
            <TextField required id="cardNumber" placeholder="Card number" fullWidth autoComplete="cc-number" />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>Expiry Date</InputLabel>
            <TextField required id="expDate" placeholder="Expiry date" fullWidth autoComplete="cc-exp" />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel>CVV Number</InputLabel>
            <TextField
              required
              id="cvv"
              placeholder="CVV"
              helperText="Last three digits on signature strip"
              fullWidth
              autoComplete="cc-csc"
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox color="primary" name="saveCard" value="yes" />}
            label="Remember credit card details for next time"
          />
        </Grid>
      </Grid>
    </>
  );
}
