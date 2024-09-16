'use client';

import { useEffect, useState } from 'react';

// next
import { useRouter } from 'next/navigation';
import Image from 'next/legacy/image';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { v4 as UIDV4 } from 'uuid';
import { format } from 'date-fns';
import { FieldArray, Form, Formik } from 'formik';
import * as yup from 'yup';

// project import
import MainCard from 'components/MainCard';
import CircularLoader from 'components/CircularLoader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import InvoiceItem from 'sections/apps/invoice/InvoiceItem';
import InvoiceModal from 'sections/apps/invoice/InvoiceModal';
import AddressModal from 'sections/apps/invoice/AddressModal';

import { APP_DEFAULT_PATH } from 'config';
import {
  handlerCustomerTo,
  handlerCustomerFrom,
  handlerPreview,
  selectCountry,
  updateInvoice,
  useGetInvoice,
  useGetInvoiceMaster
} from 'api/invoice';
import { openSnackbar } from 'api/snackbar';
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';

// types
import { SnackbarProps } from 'types/snackbar';
import { CountryType, InvoiceList, InvoiceProps } from 'types/invoice';

//asset
import EditOutlined from '@ant-design/icons/EditOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

const validationSchema = yup.object({
  date: yup.date().required('Invoice date is required'),
  due_date: yup
    .date()
    .when('date', (date, schema) => date && schema.min(date, "Due date can't be before invoice date"))
    .nullable()
    .required('Due date is required'),
  customerInfo: yup
    .object({
      name: yup.string().required('Invoice receiver information is required')
    })
    .required('Invoice receiver information is required'),
  status: yup.string().required('Status selection is required'),
  invoice_detail: yup
    .array()
    .required('Invoice details is required')
    .of(
      yup.object().shape({
        name: yup.string().required('Product name is required')
      })
    )
    .min(1, 'Invoice must have at least 1 items')
});

const invoiceSingleList: InvoiceList['cashierInfo'] = {
  name: '',
  address: '',
  phone: '',
  email: ''
};

// ==============================|| INVOICE EDIT - FORM ||============================== //

interface FormProps {
  list: InvoiceList;
  invoiceMaster: InvoiceProps;
}

function EditForm({ list, invoiceMaster }: FormProps) {
  const router = useRouter();

  const notesLimit: number = 500;
  const handlerEdit = (values: any) => {
    const newList: InvoiceList = {
      id: Number(list.id),
      invoice_id: Number(values.invoice_id),
      customer_name: values.cashierInfo?.name,
      email: values.cashierInfo?.email,
      avatar: Number(list.avatar),
      discount: Number(values.discount),
      tax: Number(values.tax),
      date: format(new Date(values.date), 'MM/dd/yyyy'),
      due_date: format(new Date(values.due_date), 'MM/dd/yyyy'),
      quantity: Number(
        values.invoice_detail?.reduce((sum: any, i: any) => {
          return sum + i.qty;
        }, 0)
      ),
      status: values.status,
      cashierInfo: values.cashierInfo,
      customerInfo: values.customerInfo,
      invoice_detail: values.invoice_detail,
      notes: values.notes
    };

    updateInvoice(newList.id, newList);
    openSnackbar({
      open: true,
      message: 'Invoice Updated successfully',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      variant: 'alert',
      alert: {
        color: 'success'
      },
      close: true
    } as SnackbarProps);
    router.push('/apps/invoice/list');
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        id: list.id || '',
        invoice_id: list.invoice_id || '',
        status: list.status || '',
        date: new Date(list.date!) || null,
        due_date: new Date(list.due_date!) || null,
        cashierInfo: list.cashierInfo || invoiceSingleList,
        customerInfo: list.customerInfo || invoiceSingleList,
        invoice_detail: list.invoice_detail || [],
        discount: list.discount || 0,
        tax: list.tax || 0,
        notes: list.notes || ''
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handlerEdit(values);
      }}
    >
      {({ handleBlur, errors, handleChange, handleSubmit, values, isValid, setFieldValue, touched }) => {
        const subtotal =
          values?.invoice_detail?.reduce((prev, curr: any) => {
            if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
            else return prev;
          }, 0) || 0;
        const taxRate = (values?.tax * subtotal) / 100;
        const discountRate = (values.discount * subtotal) / 100;
        const total = subtotal - discountRate + taxRate;

        return (
          <Form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={1}>
                  <InputLabel>Invoice Id</InputLabel>
                  <FormControl sx={{ width: '100%' }}>
                    <TextField
                      required
                      disabled
                      type="number"
                      name="invoice_id"
                      id="invoice_id"
                      value={values.invoice_id}
                      onChange={handleChange}
                    />
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={1}>
                  <InputLabel>Status</InputLabel>
                  <FormControl sx={{ width: '100%' }}>
                    <Select
                      value={values.status}
                      displayEmpty
                      name="status"
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Box sx={{ color: 'secondary.400' }}>Select status</Box>;
                        }
                        return selected;
                      }}
                      onChange={handleChange}
                      error={Boolean(errors.status && touched.status)}
                    >
                      <MenuItem disabled value="">
                        Select status
                      </MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Unpaid">Unpaid</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={1}>
                  <InputLabel>Date</InputLabel>
                  <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker format="dd/MM/yyyy" value={values.date} onChange={(newValue) => setFieldValue('date', newValue)} />
                    </LocalizationProvider>
                  </FormControl>
                </Stack>
                {touched.date && errors.date && <FormHelperText error={true}>{errors.date as string}</FormHelperText>}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={1}>
                  <InputLabel>Due Date</InputLabel>
                  <FormControl sx={{ width: '100%' }} error={Boolean(touched.due_date && errors.due_date)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        format="dd/MM/yyyy"
                        value={values.due_date}
                        onChange={(newValue) => setFieldValue('due_date', newValue)}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </Stack>
                {touched.due_date && errors.due_date && <FormHelperText error={true}>{errors.due_date as string}</FormHelperText>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <MainCard sx={{ minHeight: 168 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2}>
                        <Typography variant="h5">From:</Typography>
                        <Stack sx={{ width: '100%' }}>
                          <Typography variant="subtitle1">{values?.cashierInfo?.name}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.address}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.phone}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.email}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box textAlign={{ xs: 'left', sm: 'right' }} color="grey.200">
                        <Button
                          variant="outlined"
                          startIcon={<EditOutlined />}
                          color="secondary"
                          onClick={() => handlerCustomerFrom(true)}
                          size="small"
                        >
                          Change
                        </Button>
                        <AddressModal
                          open={invoiceMaster.open}
                          setOpen={(value) => handlerCustomerFrom(value as boolean)}
                          handlerAddress={(address) => setFieldValue('cashierInfo', address)}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MainCard sx={{ minHeight: 168 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2}>
                        <Typography variant="h5">To:</Typography>
                        <Stack sx={{ width: '100%' }}>
                          <Typography variant="subtitle1">{values?.customerInfo?.name}</Typography>
                          <Typography color="secondary">{values?.customerInfo?.address}</Typography>
                          <Typography color="secondary">{values?.customerInfo?.phone}</Typography>
                          <Typography color="secondary">{values?.customerInfo?.email}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box textAlign="right" color="grey.200">
                        <Button
                          size="small"
                          startIcon={<PlusOutlined />}
                          color="secondary"
                          variant="outlined"
                          onClick={() => handlerCustomerTo(true)}
                        >
                          Add
                        </Button>
                        <AddressModal
                          open={invoiceMaster.isCustomerOpen}
                          setOpen={(value) => handlerCustomerTo(value as boolean)}
                          handlerAddress={(value) => setFieldValue('customerInfo', value)}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </MainCard>
                {touched.customerInfo && errors.customerInfo && (
                  <FormHelperText error={true}>{errors?.customerInfo?.name as string}</FormHelperText>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h5">Detail</Typography>
              </Grid>
              <Grid item xs={12}>
                <FieldArray
                  name="invoice_detail"
                  render={({ remove, push }) => {
                    return (
                      <>
                        <TableContainer>
                          <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="center">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {values?.invoice_detail?.map((item: any, index: number) => (
                                <TableRow key={item.id}>
                                  <TableCell>{values?.invoice_detail.indexOf(item) + 1}</TableCell>
                                  <InvoiceItem
                                    key={item.id}
                                    id={item.id}
                                    index={index}
                                    name={item.name}
                                    description={item.description}
                                    qty={item.qty}
                                    price={item.price}
                                    onDeleteItem={(index: number) => remove(index)}
                                    onEditItem={handleChange}
                                    Blur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                  />
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Divider />
                        {touched.invoice_detail && errors.invoice_detail && !Array.isArray(errors?.invoice_detail) && (
                          <Stack direction="row" justifyContent="center" sx={{ p: 1.5 }}>
                            <FormHelperText error={true}>{errors.invoice_detail as string}</FormHelperText>
                          </Stack>
                        )}
                        <Grid container justifyContent="space-between">
                          <Grid item xs={12} md={8}>
                            <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
                              <Button
                                color="primary"
                                startIcon={<PlusOutlined />}
                                onClick={() =>
                                  push({
                                    id: UIDV4(),
                                    name: '',
                                    description: '',
                                    qty: 1,
                                    price: '1.00'
                                  })
                                }
                                variant="dashed"
                                sx={{ bgcolor: 'transparent !important' }}
                              >
                                Add Item
                              </Button>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Grid container justifyContent="space-between" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
                              <Grid item xs={6}>
                                <Stack spacing={1}>
                                  <InputLabel>Discount(%)</InputLabel>
                                  <TextField
                                    type="number"
                                    fullWidth
                                    name="discount"
                                    id="discount"
                                    placeholder="0.0"
                                    value={values.discount}
                                    onChange={handleChange}
                                    inputProps={{
                                      min: 0
                                    }}
                                  />
                                </Stack>
                              </Grid>
                              <Grid item xs={6}>
                                <Stack spacing={1}>
                                  <InputLabel>Tax(%)</InputLabel>
                                  <TextField
                                    type="number"
                                    fullWidth
                                    name="tax"
                                    id="tax"
                                    placeholder="0.0"
                                    value={values.tax}
                                    onChange={handleChange}
                                    inputProps={{
                                      min: 0
                                    }}
                                  />
                                </Stack>
                              </Grid>
                            </Grid>
                            <Grid item xs={12}>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography color="grey.500">Sub Total:</Typography>
                                  <Typography>{invoiceMaster.country?.prefix + '' + subtotal.toFixed(2)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography color="grey.500">Discount:</Typography>
                                  <Typography variant="h6" color="success.main">
                                    {invoiceMaster.country?.prefix + '' + discountRate.toFixed(2)}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography color="grey.500">Tax:</Typography>
                                  <Typography>{invoiceMaster.country?.prefix + '' + taxRate.toFixed(2)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="subtitle1">Grand Total:</Typography>
                                  <Typography variant="subtitle1">
                                    {' '}
                                    {total % 1 === 0
                                      ? invoiceMaster.country?.prefix + '' + total
                                      : invoiceMaster.country?.prefix + '' + total.toFixed(2)}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Notes</InputLabel>
                  <TextField
                    fullWidth
                    placeholder="Address"
                    rows={3}
                    value={values.notes}
                    multiline
                    name="notes"
                    onChange={handleChange}
                    inputProps={{
                      maxLength: notesLimit
                    }}
                    helperText={`${values.notes.length} / ${notesLimit}`}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        mr: 0,
                        display: 'flex',
                        justifyContent: 'flex-end'
                      }
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Set Currency*</InputLabel>
                  <FormControl sx={{ width: { xs: '100%', sm: 250 } }}>
                    <Autocomplete
                      id="country-select-demo"
                      fullWidth
                      options={invoiceMaster.countries}
                      defaultValue={invoiceMaster.countries[2]}
                      value={invoiceMaster.countries.find((option: CountryType) => option.code === invoiceMaster.country?.code)}
                      onChange={(event, value) => selectCountry(value as CountryType)}
                      autoHighlight
                      getOptionLabel={(option) => option.label}
                      // @ts-ignore
                      renderOption={({ key, ...props }, option) => (
                        <Box
                          key={key}
                          component="li"
                          sx={{ '& > img': { mr: 2, flexShrink: 0 }, '.flagImg': { objectFit: 'contain', pr: 8 } }}
                          {...props}
                        >
                          {option.code && (
                            <Image
                              loading="lazy"
                              className="flagImg"
                              width={20}
                              height={20}
                              alt={`${option.code.toLowerCase()}.png`}
                              src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            />
                          )}
                          {option.label}
                        </Box>
                      )}
                      renderInput={(params) => {
                        const selected = invoiceMaster.countries.find((option: CountryType) => option.code === invoiceMaster.country?.code);
                        return (
                          <TextField
                            {...params}
                            name="phoneCode"
                            placeholder="Select"
                            sx={{ '.flagImg': { objectFit: 'contain' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  {selected && selected.code !== '' && (
                                    <Image
                                      style={{ marginRight: 6 }}
                                      loading="lazy"
                                      width={20}
                                      height={20}
                                      className="flagImg"
                                      alt={`${selected.code.toLowerCase()}.png`}
                                      src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`}
                                    />
                                  )}
                                </>
                              )
                            }}
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: 'new-password' // disable autocomplete and autofill
                            }}
                          />
                        );
                      }}
                    />
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={!isValid}
                    sx={{ color: 'secondary.dark' }}
                    onClick={() => handlerPreview(true)}
                  >
                    Preview
                  </Button>
                  <Button color="primary" variant="contained" type="submit">
                    Update & Send
                  </Button>
                  <InvoiceModal
                    isOpen={invoiceMaster.isOpen}
                    setIsOpen={(value: any) => handlerPreview(value)}
                    key={values.invoice_id}
                    invoiceInfo={{
                      ...values,
                      subtotal,
                      taxRate,
                      discountRate,
                      total
                    }}
                    items={values?.invoice_detail}
                    onAddNextInvoice={() => handlerPreview(false)}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

// ==============================|| INVOICE - EDIT ||============================== //

type Props = {
  id: string;
};

export default function EditInvoice({ id }: Props) {
  const { menuMaster } = useGetMenuMaster();
  const openedItem = menuMaster.openedItem;

  const { invoiceLoading, invoice } = useGetInvoice();
  const { invoiceMasterLoading, invoiceMaster } = useGetInvoiceMaster();
  const [list, seList] = useState<InvoiceList | null>(null);

  useEffect(() => {
    if (id && !invoiceLoading) {
      seList(invoice.filter((item: InvoiceList) => item.id.toString() === id)[0]);
    }
  }, [id, invoice, invoiceLoading]);

  useEffect(() => {
    if (openedItem !== 'invoice-edit') handlerActiveItem('invoice-edit');
  }, [openedItem]);

  const loader = (
    <Box sx={{ height: 'calc(100vh - 310px)' }}>
      <CircularLoader />
    </Box>
  );

  let breadcrumbLinks = [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Invoice', to: '/apps/invoice/dashboard' }, { title: 'Edit' }];

  const isLoader = invoiceLoading || invoiceMasterLoading || invoiceMaster === undefined || list === null;

  return (
    <>
      <Breadcrumbs custom heading="New Invoice" links={breadcrumbLinks} />
      <MainCard>{isLoader ? loader : <EditForm {...{ list: list!, invoiceMaster }} />}</MainCard>
    </>
  );
}
