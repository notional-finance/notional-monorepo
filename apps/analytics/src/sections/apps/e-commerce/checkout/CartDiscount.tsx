import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useFormik } from 'formik';
import * as yup from 'yup';

// project imports
import CouponCode from './CouponCode';
import { setCartDiscount, useGetCart } from 'api/cart';
import { openSnackbar } from 'api/snackbar';

// types
import { SnackbarProps } from 'types/snackbar';

const validationSchema = yup.object({
  code: yup.string().oneOf(['MANTIS50', 'FLAT05', 'SUB150', 'UPTO200'], 'Coupon expired').required('Coupon code is required')
});

// ==============================|| CHECKOUT CART - CART DISCOUNT ||============================== //

export default function CartDiscount() {
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState<string>('');
  const { cart } = useGetCart();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: coupon
    },
    validationSchema,
    onSubmit: (values) => {
      setCartDiscount(values.code, cart.total);
      openSnackbar({
        open: true,
        message: 'Coupon Add Success',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
  });

  return (
    <Stack justifyContent="flex-end" spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={handleClickOpen}>
        Have a Promo Code?
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Stack justifyContent="flex-end">
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <TextField
              id="code"
              name="code"
              fullWidth
              placeholder="Enter promo code"
              value={formik.values.code}
              onChange={formik.handleChange}
              error={Boolean(formik.errors.code)}
            />

            <Button type="submit" color="primary" variant="contained" aria-label="directions">
              Apply
            </Button>
          </Stack>
          {formik.errors.code && (
            <FormHelperText error id="standard-code">
              {formik.errors.code}
            </FormHelperText>
          )}
        </Stack>
      </form>

      <CouponCode open={open} handleClose={handleClose} setCoupon={setCoupon} />
    </Stack>
  );
}
