import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import { ThemeMode } from 'config';
import { openSnackbar } from 'api/snackbar';

// third-party
import Slider, { CustomArrowProps, Settings } from 'react-slick';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchHandlers } from 'react-zoom-pan-pinch';

// types
import { SnackbarProps } from 'types/snackbar';
import { Products } from 'types/e-commerce';

// assets
import ZoomInOutlined from '@ant-design/icons/ZoomInOutlined';
import ZoomOutOutlined from '@ant-design/icons/ZoomOutOutlined';
import RedoOutlined from '@ant-design/icons/RedoOutlined';
import HeartFilled from '@ant-design/icons/HeartFilled';
import HeartOutlined from '@ant-design/icons/HeartOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import UpOutlined from '@ant-design/icons/UpOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';

const prod1 = '/assets/images/e-commerce/prod-1.png';
const prod2 = '/assets/images/e-commerce/prod-2.png';
const prod3 = '/assets/images/e-commerce/prod-3.png';
const prod4 = '/assets/images/e-commerce/prod-4.png';
const prod5 = '/assets/images/e-commerce/prod-5.png';
const prod6 = '/assets/images/e-commerce/prod-6.png';
const prod7 = '/assets/images/e-commerce/prod-7.png';
const prod8 = '/assets/images/e-commerce/prod-8.png';
const prod9 = '/assets/images/e-commerce/prod-9.png';

function ArrowUp({ currentSlide, slideCount, ...props }: CustomArrowProps) {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      {...props}
      color="secondary"
      className={'prev' + (currentSlide === 0 ? ' slick-disabled' : '')}
      aria-hidden="true"
      aria-disabled={currentSlide === 0 && slideCount !== 0 ? true : false}
      sx={{
        cursor: 'pointer',
        '&:hover': { bgcolor: 'transparent' },
        bgcolor: 'grey.0',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 1,
        p: 0.75,
        mr: 1.25,
        ...(!downMD && { mb: 1.25, mr: 0 }),
        lineHeight: 0,
        '&:after': { boxShadow: 'none' }
      }}
    >
      {!downMD ? (
        <UpOutlined style={{ fontSize: 'small', color: theme.palette.secondary.light }} />
      ) : (
        <LeftOutlined style={{ fontSize: 'small', color: theme.palette.secondary.light }} />
      )}
    </Box>
  );
}

function ArrowDown({ currentSlide, slideCount, ...props }: CustomArrowProps) {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      {...props}
      color="secondary"
      className={'next' + (currentSlide === Number(slideCount) - 1 ? ' slick-disabled' : '')}
      aria-hidden="true"
      aria-disabled={currentSlide === Number(slideCount) - 1 ? true : false}
      sx={{
        cursor: 'pointer',
        '&:hover': { bgcolor: 'transparent' },
        bgcolor: 'grey.0',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 1,
        p: 0.75,
        ml: 1.5,
        ...(!downMD && { mt: 1.25, ml: 0 }),
        lineHeight: 0,
        '&:after': { boxShadow: 'none' }
      }}
    >
      {!downMD ? (
        <DownOutlined style={{ fontSize: 'small', color: theme.palette.secondary.light }} />
      ) : (
        <RightOutlined style={{ fontSize: 'small', color: theme.palette.secondary.light }} />
      )}
    </Box>
  );
}

// ==============================|| PRODUCT DETAILS - IMAGES ||============================== //

export default function ProductImages({ product }: { product: Products }) {
  const theme = useTheme();
  const products = [prod1, prod2, prod3, prod4, prod5, prod6, prod7, prod8, prod9];

  const upLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [selected, setSelected] = useState<string>('');
  const [modal, setModal] = useState<boolean>(false);

  useEffect(() => {
    setSelected(product && product?.image ? `/assets/images/e-commerce/${product.image}` : '');
  }, [product]);

  const [wishlisted, setWishlisted] = useState<boolean>(false);
  const addToFavourite = () => {
    setWishlisted(!wishlisted);
    openSnackbar({
      open: true,
      message: 'Added to favourites',
      variant: 'alert',
      alert: {
        color: 'success'
      }
    } as SnackbarProps);
  };

  const lgNo = upLG ? 5 : 4;

  const settings: Settings = {
    rows: 1,
    vertical: !downMD,
    verticalSwiping: !downMD,
    dots: false,
    initialSlide: Number(product.id) + 1,
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    centerPadding: '0px',
    slidesToShow: products.length > 3 ? lgNo : products.length,
    prevArrow: <ArrowUp />,
    nextArrow: <ArrowDown />
  };

  return (
    <Grid container spacing={0.5}>
      <Grid item xs={12} md={10} lg={9}>
        <MainCard
          content={false}
          border={false}
          boxShadow={false}
          shadow={false}
          sx={{
            m: '0 auto',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            bgcolor: theme.palette.mode === ThemeMode.DARK ? 'grey.50' : 'secondary.lighter',
            '& .react-transform-wrapper': { cursor: 'crosshair', height: '100%' },
            '& .react-transform-component': { height: '100%' }
          }}
        >
          <TransformWrapper initialScale={1}>
            {({ zoomIn, zoomOut, resetTransform }: ReactZoomPanPinchHandlers) => (
              <>
                <TransformComponent>
                  <CardMedia
                    onClick={() => setModal(!modal)}
                    component="img"
                    image={selected}
                    title="Scroll Zoom"
                    sx={{ borderRadius: `4px`, position: 'relative' }}
                  />
                </TransformComponent>
                <Stack direction="row" className="tools" sx={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1 }}>
                  <IconButton color="secondary" onClick={() => zoomIn()}>
                    <ZoomInOutlined style={{ fontSize: '1.15rem' }} />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => zoomOut()}>
                    <ZoomOutOutlined style={{ fontSize: '1.15rem' }} />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => resetTransform()}>
                    <RedoOutlined style={{ fontSize: '1.15rem' }} />
                  </IconButton>
                </Stack>
              </>
            )}
          </TransformWrapper>
          <IconButton
            color="secondary"
            sx={{ ml: 'auto', position: 'absolute', top: 5, right: 5, '&:hover': { bgcolor: 'transparent' } }}
            onClick={addToFavourite}
          >
            {wishlisted ? (
              <HeartFilled style={{ fontSize: '1.15rem', color: theme.palette.error.main }} />
            ) : (
              <HeartOutlined style={{ fontSize: '1.15rem' }} />
            )}
          </IconButton>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={2} lg={3} sx={{ height: '100%' }}>
        <Box
          sx={{
            '& .slick-slider': {
              display: 'flex',
              alignItems: 'center',
              mt: 2
            },
            ...(!downMD && {
              display: 'flex',
              height: '100%',
              '& .slick-slider': {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: { xs: 0, md: 3, lg: 1.25 },
                width: { xs: 72, lg: 100 }
              },
              '& .slick-arrow': {
                '&:hover': { bgcolor: 'grey.A200' },
                position: 'initial',
                color: 'grey.500',
                bgcolor: 'grey.A200',
                p: 0,
                transform: 'rotate(90deg)',
                borderRadius: '50%',
                height: 17,
                width: 19
              }
            })
          }}
        >
          <Slider {...settings}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item, index) => (
              <Box key={index} onClick={() => setSelected(`/assets/images/e-commerce/prod-${item}.png`)} sx={{ p: 1 }}>
                <Avatar
                  size={upLG ? 'xl' : 'md'}
                  src={`/assets/images/e-commerce/thumbs/prod-${item}.png`}
                  variant="rounded"
                  sx={{ m: '0 auto', cursor: 'pointer', bgcolor: 'grey.0', border: '1px solid', borderColor: 'grey.200' }}
                />
              </Box>
            ))}
          </Slider>
        </Box>
      </Grid>
    </Grid>
  );
}
