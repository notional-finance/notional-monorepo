'use client';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// third-party
import Slider, { CustomArrowProps, Settings } from 'react-slick';

// project-imports
import MainCard from 'components/MainCard';

// assets
import RightOutlined from '@ant-design/icons/RightOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';

// ==============================|| STEPPER - CAROUSEL EFFECT ||============================== //

function SampleNextArrow({ className, style, onClick }: CustomArrowProps) {
  return (
    <Box className={className} sx={{ ...style, display: 'block', top: '87%', right: 64 }}>
      <Button onClick={onClick} endIcon={<RightOutlined size={14} />} sx={{ my: 2, mx: 1 }} size="small">
        Next
      </Button>
    </Box>
  );
}

function SamplePrevArrow({ className, style, onClick }: CustomArrowProps) {
  return (
    <Box className={className} sx={{ ...style, display: 'block', top: '87%', left: 0 }}>
      <Button onClick={onClick} startIcon={<LeftOutlined size={14} />} sx={{ my: 2, mx: 1 }} size="small">
        Back
      </Button>
    </Box>
  );
}

export default function CarouselEffectStepper() {
  const images = [
    {
      label: 'San Francisco',
      imgPath: 'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60'
    },
    {
      label: 'Bird',
      imgPath: 'https://images.unsplash.com/photo-1538032746644-0212e812a9e7?auto=format&fit=crop&w=400&h=250&q=60'
    },
    {
      label: 'Bali, Indonesia',
      imgPath: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&h=250&q=80'
    },
    {
      label: 'Goč, Serbia',
      imgPath: 'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&w=400&h=250&q=60'
    }
  ];

  const settings: Settings = {
    dots: true,
    autoplay: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />
  };

  return (
    <MainCard
      content={false}
      sx={{
        '& .slick-dots': { position: 'static', pt: 1, pb: 1.5 },
        '& .slick-prev:before': { display: 'none' },
        '& .slick-next:before': { display: 'none' }
      }}
    >
      <Slider {...settings}>
        {images.map((step, index) => (
          <Box key={index}>
            <Box sx={{ p: 1.75 }}>
              <Typography>{step.label}</Typography>
            </Box>
            <Box
              component="img"
              sx={{ height: 255, display: 'block', overflow: 'hidden', width: '100%' }}
              src={step.imgPath}
              alt={step.label}
            />
          </Box>
        ))}
      </Slider>
    </MainCard>
  );
}
