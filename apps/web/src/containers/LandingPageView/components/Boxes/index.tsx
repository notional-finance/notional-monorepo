import { useLandingPageInput } from '../../store/use-landing-page-input'
import { FormattedMessage } from 'react-intl'
import { styled } from '@mui/material'

export const Boxes = () => {
  const { maturity, slippage, hasError } = useLandingPageInput()
  let slippageValue: React.ReactNode
  if (hasError) {
    slippageValue = (
      <span className="error">
        <FormattedMessage defaultMessage="Amount Too Large" />
      </span>
    )
  } else {
    slippageValue = <span className="value">{slippage || '--'}</span>
  }

  return (
    <BoxStyleContainer>
      <div className="boxes">
        <div className="box">
          <span className="heading">
            <FormattedMessage defaultMessage={'Maturity'} />
          </span>
          <span className="value">{maturity}</span>
        </div>
        <div className="box">
          <span className="heading">
            <FormattedMessage defaultMessage={'Slippage'} />
          </span>
          {slippageValue}
        </div>
      </div>
    </BoxStyleContainer>
  )
}

const BoxStyleContainer = styled('div')(
  ({ theme }) => `
  color: ${theme.palette.common.white};

  .boxes {
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .box {
      border-radius: ${theme.shape.borderRadius()};
      padding: 25px;
      width: 48%;
      background: ${theme.palette.background.accentDefault};
      border: 1px solid ${theme.palette.primary.dark};
      margin-bottom: 20px;
      text-align: left;
    }

    .heading,
    .value,
    .error {
      display: block;
      background: ${theme.gradient.landing};
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
    }

    .heading {
      font-size: 12px;
      text-transform: capitalize;
    }

    .value {
      font-size: 22px;
    }

    .error {
      font-size: 22px;
    }
  }

  @media (max-width: 400px) {
    .boxes {
      display: block;

      .box {
        width: 100%;
        padding: 10px 0 5px 5px;

        .value {
          font-size: 18px;
        }
      }
    }
  }
`
)
