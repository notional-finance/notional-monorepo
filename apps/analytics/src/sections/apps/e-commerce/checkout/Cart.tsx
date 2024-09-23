import { useEffect, useState } from 'react';

// next
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// third-party
import { sum } from 'lodash';
import currency from 'currency.js';

// types
import { CartCheckoutStateProps, CartProductStateProps } from 'types/cart';

// project imports
import CartDiscount from './CartDiscount';
import OrderSummary from './OrderSummery';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Avatar from 'components/@extended/Avatar';
import ColorOptions from '../products/ColorOptions';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// product color select
function getColor(color: string) {
  return ColorOptions.filter((item) => item.value === color);
}

// ==============================|| CART - INCREMENT QUANTITY ||============================== //

interface IncrementProps {
  itemId: string | number | undefined;
  quantity: number;
  updateQuantity: (id: string | number | undefined, quantity: number) => void;
}

function Increment({ itemId, quantity, updateQuantity }: IncrementProps) {
  const [value, setValue] = useState(quantity);

  const incrementHandler = () => {
    setValue(value - 1);
    updateQuantity(itemId, value - 1);
  };

  const decrementHandler = () => {
    setValue(value + 1);
    updateQuantity(itemId, value + 1);
  };

  return (
    <Stack direction="row">
      <Button
        key="three"
        variant="text"
        disabled={value <= 1}
        onClick={incrementHandler}
        sx={{ pr: 0.75, pl: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
      >
        <MinusOutlined style={{ fontSize: 'inherit' }} />
      </Button>
      <Typography key="two" sx={{ p: '9px 15px', border: '1px solid', borderColor: 'grey.A800' }}>
        {value}
      </Typography>
      <Button
        key="one"
        variant="text"
        onClick={decrementHandler}
        sx={{ pl: 0.75, pr: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
      >
        <PlusOutlined style={{ fontSize: 'inherit' }} />
      </Button>
    </Stack>
  );
}

// ==============================|| CART - MAIN ||============================== //

interface CartProps {
  checkout: CartCheckoutStateProps;
  onNext: () => void;
  removeProduct: (id: string | number | undefined) => void;
  updateQuantity: (id: string | number | undefined, quantity: number) => void;
}

export default function Cart({ checkout, onNext, removeProduct, updateQuantity }: CartProps) {
  const theme = useTheme();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [rows, setRows] = useState(checkout.products);

  useEffect(() => {
    setRows(checkout.products);
    setTotalQuantity(sum(checkout.products.map((item: any) => item.quantity)));
  }, [checkout.products]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Stack spacing={2}>
          <MainCard content={false}>
            <Grid container>
              <Grid item xs={12} sx={{ py: 2.5, pl: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1">Cart</Typography>
                  <Avatar color="secondary" size="xs">
                    {totalQuantity}
                  </Avatar>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                      {rows.map((row: CartProductStateProps, index: number) => {
                        const colorsData = row.color ? getColor(row.color) : false;
                        return (
                          <TableRow key={index} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                  <Avatar
                                    size="lg"
                                    variant="rounded"
                                    color="secondary"
                                    type="combined"
                                    src={row.image ? `/assets/images/e-commerce/thumbs/${row.image}` : ''}
                                  />
                                </Grid>
                                <Grid item>
                                  <Stack spacing={0}>
                                    <Link
                                      href={`/apps/e-commerce/product-details/${row.id}`}
                                      target="_blank"
                                      variant="subtitle1"
                                      color="text.primary"
                                      sx={{ textDecoration: 'none' }}
                                    >
                                      {row.name}
                                    </Link>
                                    <Typography color="text.secondary">{colorsData ? colorsData[0].label : 'Multicolor'}</Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </TableCell>
                            <TableCell align="right">
                              <Stack alignItems="center">
                                {row.offerPrice && row.quantity && (
                                  <Typography variant="subtitle1">{currency(row.offerPrice * row.quantity).format()}</Typography>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Increment quantity={row.quantity} itemId={row.itemId} updateQuantity={updateQuantity} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={() => removeProduct(row.itemId)}
                                size="medium"
                                sx={{ opacity: 0.5, '&:hover': { bgcolor: 'transparent' } }}
                              >
                                <DeleteOutlined style={{ color: theme.palette.grey[500] }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </MainCard>
          <Grid item sx={{ textAlign: 'right' }}>
            <NextLink href="/apps/e-commerce/products" passHref legacyBehavior>
              <Button color="secondary" variant="text" startIcon={<LeftOutlined />}>
                <Typography variant="h6" color="text.primary">
                  Back to Shopping
                </Typography>
              </Button>
            </NextLink>
          </Grid>
        </Stack>
      </Grid>
      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          <MainCard>
            <CartDiscount />
          </MainCard>
          <OrderSummary checkout={checkout} show />
          <Button variant="contained" sx={{ textTransform: 'none' }} fullWidth onClick={onNext}>
            Process to Checkout
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
