import { styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import notionalLogo from '@notional-finance/assets/images/logos/Notional_logo_for_dark_background.svg';
import { HeadingSubtitle, Label } from '@notional-finance/mui';

export const LandingFooter = () => {
  return (
    <StyledFooter>
      <div id="footer" className="section">
        <div id="footer-container">
          <img id="footer-logo" src={notionalLogo} alt="Notional logo" />
          <div id="footer-lists">
            <ul>
              <li>
                <Label accent uppercase>
                  <FormattedMessage defaultMessage="App" />
                </Label>
              </li>
              <li>
                <HeadingSubtitle contrast to="/lend-fixed">
                  <FormattedMessage defaultMessage="Lend" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle contrast to="/borrow-fixed">
                  <FormattedMessage defaultMessage="Borrow" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle contrast to="/liquidity-variable">
                  <FormattedMessage defaultMessage="Provide Liquidity" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://docs.notional.finance/notional-v3"
                >
                  <FormattedMessage defaultMessage="User Documentation" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://docs.notional.finance/v3-technical-docs/deployed-contracts/notional-v3"
                >
                  <FormattedMessage defaultMessage="Developer Documentation" />
                </HeadingSubtitle>
              </li>
            </ul>
            <ul>
              <li className="heading">
                <Label accent uppercase>
                  <FormattedMessage defaultMessage="About" />
                </Label>
              </li>
              <li>
                <HeadingSubtitle contrast to="/about">
                  <FormattedMessage defaultMessage="About Notional" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://docs.notional.finance/v3-risk-parameters/"
                >
                  <FormattedMessage defaultMessage="Governance Parameters" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://github.com/notional-finance/contracts-v2/tree/master/audits"
                >
                  <FormattedMessage defaultMessage="Security" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle contrast to="/privacy">
                  <FormattedMessage defaultMessage="Privacy Policy" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle contrast to="/terms">
                  <FormattedMessage defaultMessage="Terms & Conditions" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://github.com/notional-finance/media-kit"
                >
                  <FormattedMessage defaultMessage="Media Kit" />
                </HeadingSubtitle>
              </li>
            </ul>
            <ul>
              <li>
                <Label accent uppercase>
                  <FormattedMessage defaultMessage="Social" />
                </Label>
              </li>
              <li>
                <HeadingSubtitle contrast href="https://blog.notional.finance/">
                  <FormattedMessage defaultMessage="Blog" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://discord.notional.finance"
                >
                  <FormattedMessage defaultMessage="Discord" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://github.com/notional-finance/contracts-v2"
                >
                  <FormattedMessage defaultMessage="Github" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://twitter.com/NotionalFinance"
                >
                  <FormattedMessage defaultMessage="Twitter" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://www.youtube.com/channel/UC3JxsK1mTxPxRZs6TtGDo5g"
                >
                  <FormattedMessage defaultMessage="YouTube" />
                </HeadingSubtitle>
              </li>
              <li>
                <HeadingSubtitle
                  contrast
                  href="https://forum.notional.finance/"
                >
                  <FormattedMessage defaultMessage="Forum" />
                </HeadingSubtitle>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </StyledFooter>
  );
};

const StyledFooter = styled('div')(
  ({ theme }) => `
  #footer {
    background: ${theme.palette.background.accentDefault};

    .heading {
      text-transform: uppercase;
      font-size: 14px;
    }

    #footer-container {
      padding: 100px 170px;
      text-align: left;
    }

    #footer-lists {
      display: flex
    }

    #footer-logo {
      margin-bottom: 100px;
    }

    ul {
      float: left;
      margin-right: 15%;

      &:first-of-type. {
        margin-left: 0px;
      }
    }

    li {
      font-size: 18px;
      color: $white;
      margin-bottom: 36px;

      &:first-of-type. {
        color: ${theme.palette.info.main};
      }
    }
  }

  @media (max-width: 1240px) {
    #footer {
      #footer-container {
        display: block;
        padding: 60px 20px;

      }

      #footer-lists {
        display: block;
      }

      ul {
        float: none;
        margin-bottom: 60px;
        margin-right: 0%;
      }
    }
  }
`
);

export default LandingFooter;
