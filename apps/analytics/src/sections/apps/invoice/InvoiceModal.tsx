// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// third-party
import { PDFDownloadLink } from '@react-pdf/renderer';
import { format } from 'date-fns';

// project import
import Logo from 'components/logo';
import ExportPDFView from './export-pdf';

// assets
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';

// ==============================|| INVOICE - PREVIEW ||============================== //

export default function InvoiceModal({ isOpen, setIsOpen, invoiceInfo, items, onAddNextInvoice }: any) {
  function closeModal() {
    setIsOpen(false);
  }

  const addNextInvoiceHandler = () => {
    setIsOpen(false);
    onAddNextInvoice();
  };

  let date;
  let dueDate;
  try {
    date = format(new Date(invoiceInfo.date), 'dd/mm/yyyy');
    dueDate = format(new Date(invoiceInfo.due_date), 'dd/MM/yyyy');
  } catch (error) {
    console.log('error - ', error);
  }

  const subtotal = invoiceInfo?.invoice_detail?.reduce((prev: any, curr: any) => {
    if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
    else return prev;
  }, 0);
  const taxRate = (invoiceInfo.tax * subtotal) / 100;
  const discountRate = (invoiceInfo.discount * subtotal) / 100;
  const total = subtotal - discountRate + taxRate;

  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': { p: 0, minWidth: { xl: 1200, sm: 'calc(100% - 20%)' } },
        '& .MuiBackdrop-root': { opacity: '0.5 !important' }
      }}
    >
      <Box sx={{ pb: 2.5 }}>
        {/* This element is to trick the browser into centering the modal contents. */}
        <span aria-hidden="true">&#8203;</span>
        <Box id="print" sx={{ p: 2.5 }}>
          <Box sx={{ pb: 2.5 }}>
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} justifyContent="space-between">
              <Box sx={{ pt: 2.5 }}>
                <Stack direction="row" spacing={2}>
                  <Logo /> <Chip label="Paid" variant="light" color="success" />
                </Stack>
                <Typography color="secondary">{invoiceInfo.invoice_id}</Typography>
              </Box>
              <Box sx={{ pt: 2.5, pb: 1.75 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ pl: 4 }} variant="subtitle1">
                    Date{' '}
                  </Typography>
                  <Typography>{date}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ pr: 2, overflow: 'hidden' }} variant="subtitle1">
                    Due Date
                  </Typography>
                  <Typography>{dueDate}</Typography>
                </Stack>
              </Box>
            </Stack>
            <Box sx={{ pt: 2.5 }}>
              <Grid container spacing={2} justifyContent="space-between" direction="row">
                <Grid item xs={12} sm={6}>
                  <Box sx={{ border: 1, minHeight: 168, borderColor: 'grey.200', borderRadius: 0.5, p: 2.5 }}>
                    <Grid container direction="row">
                      <Grid item md={8}>
                        <Typography variant="h5">From:</Typography>
                        <FormControl sx={{ width: '100%' }}>
                          <Typography variant="subtitle1">{invoiceInfo.cashierInfo.name}</Typography>
                          <Typography color="secondary">{invoiceInfo.cashierInfo.address}</Typography>
                          <Typography color="secondary">{invoiceInfo.cashierInfo.phone}</Typography>
                          <Typography color="secondary">{invoiceInfo.cashierInfo.email}</Typography>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ border: 1, minHeight: 168, borderColor: 'grey.200', borderRadius: 0.5, p: 2.5 }}>
                    <Grid container direction="row">
                      <Grid item md={8}>
                        <Typography variant="h5">To:</Typography>
                        <FormControl sx={{ width: '100%' }}>
                          <Typography variant="subtitle1">{invoiceInfo.customerInfo.name}</Typography>
                          <Typography color="secondary">{invoiceInfo.customerInfo.address}</Typography>
                          <Typography color="secondary">{invoiceInfo.customerInfo.phone}</Typography>
                          <Typography color="secondary">{invoiceInfo.customerInfo.email}</Typography>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item: any) => (
                  <TableRow key={item.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{items.indexOf(item) + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.qty}</TableCell>
                    <TableCell align="right">${Number(item.price).toFixed(2)}</TableCell>
                    <TableCell align="right">${Number(item.price * item.qty).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2.5 }}>
            <Grid container direction="row" justifyContent="flex-end">
              <Grid item md={4}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="secondary">Sub Total:</Typography>
                    <Typography variant="h6">${subtotal.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="secondary">Discount:</Typography>
                    <Typography variant="h6" color="success.main">
                      ${discountRate.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="grey.500">Tax:</Typography>
                    <Typography variant="h6">${taxRate.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ pr: 2 }} variant="subtitle1">
                      Grand Total:
                    </Typography>
                    <Typography variant="h6">${total % 1 === 0 ? total : total.toFixed(2)}</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Typography>Notes: {invoiceInfo.notes}</Typography>
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ p: 2.5 }}>
          <Button color="secondary" onClick={addNextInvoiceHandler}>
            Cancel
          </Button>
          <PDFDownloadLink
            document={<ExportPDFView list={invoiceInfo} />}
            fileName={`${invoiceInfo?.invoiceId || invoiceInfo?.invoice_id}-${
              invoiceInfo?.customer_name || invoiceInfo?.from?.name || invoiceInfo?.customerInfo?.name
            }.pdf`}
            style={{ textDecoration: 'none' }}
          >
            <Button startIcon={<DownloadOutlined />} variant="contained" color="primary">
              Download
            </Button>
          </PDFDownloadLink>
        </Stack>
      </Box>
    </Dialog>
  );
}
