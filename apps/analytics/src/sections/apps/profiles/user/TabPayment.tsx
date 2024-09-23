import { useState, ChangeEvent, SyntheticEvent } from 'react';

// next
import Image from 'next/image';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import { PatternFormat } from 'react-number-format';

// project import
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

import { openSnackbar } from 'api/snackbar';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

const masterCard = '/assets/images/icons/master-card.png';
const paypal = '/assets/images/icons/paypal.png';
const visaCard = '/assets/images/icons/visa-card.png';

// types
import { SnackbarProps } from 'types/snackbar';

export interface PaymentCardProps {
  id: number;
  name: string;
  number: number;
  email?: string;
  expiry: Date;
  cvv: number;
  securityCode: string;
  type: string;
}

// style & constant
const buttonStyle = { color: 'text.primary', fontWeight: 600 };

const paymentCards: PaymentCardProps[] = [
  {
    id: 1,
    name: 'Selena Litten',
    number: 1234567890123456,
    email: 'selena.litten@gmail.com',
    expiry: new Date(),
    cvv: 789,
    securityCode: '123456',
    type: 'master'
  },
  {
    id: 2,
    name: 'Stebin Ben',
    number: 9876543210987654,
    email: 'stebin.ben@gmail.com',
    expiry: new Date(),
    cvv: 789,
    securityCode: '987654',
    type: 'visa'
  }
];

interface CardProps {
  card: PaymentCardProps;
}

// ==============================|| PAYMENT - CARD ||============================== //

function PaymentCard({ card }: CardProps) {
  const { id, name, number, type } = card;

  return (
    <MainCard content={false} boxShadow sx={{ cursor: 'pointer' }}>
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          value={id}
          control={<Radio value={id} />}
          sx={{ display: 'flex', '& .MuiFormControlLabel-label': { flex: 1 } }}
          label={
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Stack spacing={0.5} sx={{ ml: 1 }}>
                  <Typography color="secondary">{name}</Typography>
                  <Typography variant="subtitle1">
                    <PatternFormat value={number.toString().substring(12)} displayType="text" type="text" format="**** **** **** ####" />
                  </Typography>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                  <Image
                    src={type === 'master' ? masterCard : visaCard}
                    alt="payment card"
                    width={type === 'master' ? 22 : 30}
                    height={type === 'master' ? 22 : 30}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <IconButton color="secondary">
                    <DeleteOutlined />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          }
        />
      </Box>
    </MainCard>
  );
}

// ==============================|| TAB - PAYMENT ||============================== //

export default function TabPayment() {
  const [cards] = useState(paymentCards);
  const [method, setMethod] = useState('card');
  const [value, setValue] = useState<string | null>('2');
  const [expiry, setExpiry] = useState<Date | null>(new Date());

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <MainCard title="Payment">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack spacing={1.25} direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color={method === 'card' || method === 'add' ? 'primary' : 'secondary'}
                sx={buttonStyle}
                onClick={() => setMethod(method !== 'card' ? 'card' : method)}
                startIcon={<Image src={masterCard} alt="master card" width={12} height={12} style={{ maxWidth: '100%', height: 'auto' }} />}
              >
                Card
              </Button>
              <Button
                variant="outlined"
                color={method === 'paypal' ? 'primary' : 'secondary'}
                sx={buttonStyle}
                onClick={() => setMethod(method !== 'paypal' ? 'paypal' : method)}
                startIcon={<Image src={paypal} alt="paypal" width={12} height={12} style={{ maxWidth: '100%', height: 'auto' }} />}
              >
                Paypal
              </Button>
            </Stack>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => setMethod(method !== 'add' ? 'add' : method)}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Add New Card
            </Button>
            <Tooltip title="Add New Card">
              <IconButton
                variant="contained"
                onClick={() => setMethod(method !== 'add' ? 'add' : method)}
                sx={{ display: { xs: 'block', sm: 'none' } }}
              >
                <PlusOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
        {method === 'card' && (
          <>
            <Grid item xs={12}>
              <RadioGroup row aria-label="payment-card" name="payment-card" value={value} onChange={handleRadioChange}>
                <Grid item xs={12} container spacing={2.5}>
                  {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <PaymentCard card={card} />
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                <Button variant="outlined" color="secondary">
                  Cancel
                </Button>
                <Button variant="contained">Save</Button>
              </Stack>
            </Grid>
          </>
        )}
        {method === 'paypal' && (
          <Grid item xs={12}>
            <Formik
              initialValues={{
                email: 'stebin.ben@paypal.co',
                submit: null
              }}
              validationSchema={Yup.object().shape({
                email: Yup.string().email('Invalid email address.').max(255).required('Email is required')
              })}
              onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                try {
                  openSnackbar({
                    open: true,
                    message: 'Paypal email updated successfully.',
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    }
                  } as SnackbarProps);

                  setStatus({ success: false });
                  setSubmitting(false);
                } catch (err: any) {
                  setStatus({ success: false });
                  setErrors({ submit: err.message });
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="payment-paypal-email">Email Address</InputLabel>
                        <TextField
                          type="email"
                          fullWidth
                          value={values.email}
                          name="email"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          id="payment-paypal-email"
                          placeholder="Email Address"
                        />
                      </Stack>
                      {touched.email && errors.email && (
                        <FormHelperText error id="payment-paypal-email-helper">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                        <Button color="error" onClick={() => setMethod('card')}>
                          Cancel
                        </Button>
                        <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                          Save
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </Grid>
        )}
        {method === 'add' && (
          <Grid item xs={12}>
            <Formik
              initialValues={{
                cardname: '',
                cardNumber: '',
                expiry: new Date(),
                cvv: '',
                security: '',
                submit: null
              }}
              validationSchema={Yup.object().shape({
                cardname: Yup.string().required('Card Name is required'),
                cardNumber: Yup.string().required('Card Number is required'),
                cvv: Yup.string().min(3).required('CVV is required'),
                security: Yup.string().min(6).required('Security Code is required')
              })}
              onSubmit={(values, { resetForm, setErrors, setStatus, setSubmitting }) => {
                try {
                  openSnackbar({
                    open: true,
                    message: 'Card added successfully.',
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    }
                  } as SnackbarProps);

                  resetForm();
                  setStatus({ success: false });
                  setSubmitting(false);
                  setMethod('card');
                } catch (err: any) {
                  setStatus({ success: false });
                  setErrors({ submit: err.message });
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="payment-card-name">Name on Card</InputLabel>
                        <TextField
                          fullWidth
                          id="payment-card-name"
                          value={values.cardname}
                          name="cardname"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Name on Card"
                        />
                      </Stack>
                      {touched.cardname && errors.cardname && (
                        <FormHelperText error id="ayment-card-name-helper">
                          {errors.cardname}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="payment-card-number">Card Number</InputLabel>
                        <PatternFormat
                          id="payment-card-number"
                          value={values.cardNumber}
                          name="cardNumber"
                          format="#### #### #### ####"
                          prefix=""
                          fullWidth
                          customInput={TextField}
                          placeholder="Card Number"
                          onBlur={handleBlur}
                          onValueChange={(values) => {
                            const { value } = values;
                            setFieldValue('cardNumber', value);
                          }}
                          onChange={handleChange}
                        />
                      </Stack>
                      {touched.cardNumber && errors.cardNumber && (
                        <FormHelperText error id="ayment-cardNumber-helper">
                          {errors.cardNumber}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="payment-card-expiry">Expiry Date</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['month', 'year']}
                            value={expiry}
                            minDate={new Date()}
                            onChange={(newValue) => {
                              setExpiry(newValue);
                            }}
                            format="MM/yyyy"
                          />
                        </LocalizationProvider>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="payment-card-cvv">CVV Number</InputLabel>
                        <PatternFormat
                          id="payment-card-cvv"
                          value={values.cvv}
                          name="cvv"
                          format="###"
                          prefix=""
                          fullWidth
                          customInput={TextField}
                          placeholder="CVV Number"
                          onBlur={handleBlur}
                          onValueChange={(values) => {
                            const { value } = values;
                            setFieldValue('cvv', value);
                          }}
                        />
                      </Stack>
                      {touched.cvv && errors.cvv && (
                        <FormHelperText error id="ayment-cvv-helper">
                          {errors.cvv}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="payment-card-security">Security Code</InputLabel>
                        <OutlinedInput
                          placeholder="Enter Security Code"
                          id="payment-card-security"
                          type={showPassword ? 'text' : 'password'}
                          value={values.security}
                          name="security"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                size="large"
                                color="secondary"
                              >
                                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                              </IconButton>
                            </InputAdornment>
                          }
                          autoComplete="security-code"
                        />
                      </Stack>
                      {touched.security && errors.security && (
                        <FormHelperText error id="ayment-security-helper">
                          {errors.security}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                        <Button variant="outlined" color="secondary" onClick={() => setMethod('card')}>
                          Cancel
                        </Button>
                        <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                          Save
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
}
