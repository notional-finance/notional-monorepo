import { sum } from 'lodash';

// next
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Badge from '@mui/material/Badge';

// project import
import { useGetCart } from 'api/cart';

// types
import { CartProductStateProps } from 'types/cart';

// assets
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';

// ==============================|| CART ITEMS - FLOATING BUTTON ||============================== //

export default function FloatingCart() {
  const theme = useTheme();

  const { cart } = useGetCart();

  let totalQuantity = 0;
  if (cart && cart.products && cart.products.length > 0) {
    totalQuantity = sum(cart.products.map((item: CartProductStateProps) => item.quantity));
  }

  return (
    <NextLink href="/apps/e-commerce/checkout" passHref legacyBehavior>
      <Fab
        size="large"
        sx={{
          top: '75%',
          position: 'fixed',
          right: 0,
          zIndex: theme.zIndex.speedDial,
          boxShadow: theme.customShadows.primary,
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          borderRadius: '25%',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          '&:hover': {
            bgcolor: 'primary.100',
            boxShadow: theme.customShadows.primary
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.dark}`,
            outlineOffset: 2
          }
        }}
      >
        <Badge showZero badgeContent={totalQuantity} color="error">
          <ShoppingCartOutlined style={{ color: theme.palette.primary.main, fontSize: '1.5rem' }} />
        </Badge>
      </Fab>
    </NextLink>
  );
}
