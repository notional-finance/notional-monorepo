import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Box, styled } from '@mui/material';
import panteraSvg from '@notional-finance/assets/marketing/partners/pantera.svg';
import spartanSvg from '@notional-finance/assets/marketing/partners/spartan.svg';
import ideoCoLabSvg from '@notional-finance/assets/marketing/partners/ideo-colab.svg';
import oneCSvg from '@notional-finance/assets/marketing/partners/1c.svg';
import coinbaseVenturesSvg from '@notional-finance/assets/marketing/partners/coinbase-ventures.svg';
import parafiSvg from '@notional-finance/assets/marketing/partners/parafi.svg';
import nascentSvg from '@notional-finance/assets/marketing/partners/nascent.svg';

export const ImageSlider = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: 'linear',
    arrows: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <SliderContainer>
      <SliderShadows
        sx={{
          background:
            'linear-gradient(90deg, #012E3A 47.07%, rgba(1, 46, 58, 0) 100%)',
          marginRight: '-100px',
        }}
      ></SliderShadows>
      <StyledSlider {...settings}>
        <SliderImgContainer>
          <img src={panteraSvg} alt="slide1" />
        </SliderImgContainer>

        <SliderImgContainer>
          <img src={spartanSvg} alt="slide2" />
        </SliderImgContainer>

        <SliderImgContainer>
          <img src={ideoCoLabSvg} alt="slide3" />
        </SliderImgContainer>

        <SliderImgContainer>
          <img src={oneCSvg} alt="slide4" />
        </SliderImgContainer>

        <SliderImgContainer>
          <img src={coinbaseVenturesSvg} alt="slide5" />
        </SliderImgContainer>

        <SliderImgContainer>
          <img src={parafiSvg} alt="slide6" />
        </SliderImgContainer>

        <SliderImgContainer>
          <img src={nascentSvg} alt="slide7" />
        </SliderImgContainer>
      </StyledSlider>
      <SliderShadows
        sx={{
          background:
            'linear-gradient(270deg, #012E3A 47.07%, rgba(1, 46, 58, 0) 100%)',
          marginLeft: '-100px',
        }}
      />
    </SliderContainer>
  );
};

const SliderContainer = styled(Box)(
  ({ theme }) => `
  width: ${theme.spacing(160)};
  display: flex;
  margin: auto;
  justify-content: center;
  padding-bottom: ${theme.spacing(15)};

  ${theme.breakpoints.down(1280)} {
    width: 90%;
  }
    `
);

const StyledSlider = styled(Slider)(`width: 100%;`);

const SliderImgContainer = styled(Box)(
  ({ theme }) => `
  display: flex !important;
  align-items: center;
  justify-content: center;
  height: ${theme.spacing(11.25)};
    `
);
const SliderShadows = styled(Box)(
  ({ theme }) => `
  height: ${theme.spacing(12.5)};
  position: relative;
  width: ${theme.spacing(12.5)};
  z-index: 2;
    `
);

export default ImageSlider;
