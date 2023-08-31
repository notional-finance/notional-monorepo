import { Box, styled } from '@mui/material';
import { useState } from 'react';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { ProgressIndicator } from '@notional-finance/mui';
import betaPassGif from '../../assets/beta-pass.gif';
import lockImg from '../../assets/lock.svg';
import { useNftContract, BETA_ACCESS } from '../../hooks';

export const ContestNftPass = () => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const betaAccess = useNftContract();

  return (
    <Container>
      {betaAccess !== BETA_ACCESS.CONFIRMED && (
        <OverlayContainer>
          <img
            src={lockImg}
            alt="lock"
            style={{
              height: '48px',
              width: '48px',
            }}
          />
          <OverlayText>
            <FormattedMessage defaultMessage={'CURRENTLY LOCKED'} />
          </OverlayText>
        </OverlayContainer>
      )}
      <img
        src={betaPassGif}
        alt="beta pass gif"
        onLoad={() => setImgLoaded(true)}
      />

      {!imgLoaded && <ProgressIndicator />}
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    min-width: 275px;
    min-height: 550px;
    ${theme.breakpoints.down('md')} {
      display: flex;
      justify-content: center;
    }
      `
);

const OverlayContainer = styled(Box)(
  ({ theme }) => `
  background: rgba(4, 29, 46, 0.7);
  position: absolute;
  z-index: 4;
  width: 275px;
  height: 459px;
  border-radius: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
    ${theme.breakpoints.down('md')} {
      height: 550px;
    }
      `
);

const OverlayText = styled(Box)(
  ({ theme }) => `
  font-family: Kunst;
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 2.939px;
  color: ${colors.neonTurquoise};
  width: 180px;
  text-align: center;
  margin-top: ${theme.spacing(2)};
      `
);

export default ContestNftPass;
