import { defineMessage, FormattedMessage } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import immunifiLogoSvg from '@notional-finance/assets/images/logos/logo-immunefi.svg';
import { Button, H1, Label, H3, Paragraph } from '@notional-finance/mui';
import { Box, useTheme, styled } from '@mui/material';

const auditLinks = [
  {
    name: defineMessage({
      defaultMessage: 'Code Arena, Staked NOTE | Mar 10, 2022',
      description: 'security audit link',
    }),
    route: 'https://code4rena.com/reports/2022-01-notional/',
  },
  {
    name: defineMessage({
      defaultMessage: 'Consensys Diligence, Notional v2.1 | Mar 9, 2021',
      description: 'security audit link',
    }),
    route:
      'https://consensys.net/diligence/audits/2022/03/notional-protocol-v2.1/',
  },
  {
    name: defineMessage({
      defaultMessage: 'ABDK Consulting | Nov 01, 2021',
      description: 'security audit link',
    }),
    route:
      'https://github.com/notional-finance/contracts-v2/tree/master/audits',
  },
  {
    name: defineMessage({
      defaultMessage: 'Certora Formal Verification | Nov 1, 2021',
      description: 'security audit link',
    }),
    route:
      'https://github.com/notional-finance/contracts-v2/blob/master/audits/Certora%20-%20Formal%20Verfication%20Report%2C%20Nov%201%202021.pdf',
  },
  {
    name: defineMessage({
      defaultMessage: 'Code Arena | Oct 10, 2021',
      description: 'security audit link',
    }),
    route: 'https://code423n4.com/reports/2021-08-notional/',
  },
  {
    name: defineMessage({
      defaultMessage: 'Open Zeppelin, Governance Contracts | Jun 10, 2021',
      description: 'security audit link',
    }),
    route:
      'https://blog.openzeppelin.com/notional-v2-audit-governance-contracts',
  },
];
const MultidisciplinarySecurityApproach = () => {
  const theme = useTheme();
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    triggerOnce: true,
  });
  const inViewClassName = inView ? 'fade-in' : 'hidden';

  return (
    <StyledView
      ref={ref}
      sx={{
        background: theme.palette.common.black,
        color: theme.palette.common.white,
      }}
    >
      <Box id="section-7" className={`section ${inViewClassName}`}>
        <Box id="section-7-container">
          <Box id="section-7-top-container">
            <H1 contrast marginBottom={theme.spacing(2)}>
              <FormattedMessage
                defaultMessage="A Multidisciplinary Approach to Security"
                description="landing section heading"
              />
            </H1>
            <Paragraph contrast fontWeight="light">
              <FormattedMessage
                defaultMessage={
                  'We invest in thorough testing and auditing of our smart contracts. Our contracts are open source so developers can <a>review our code</a> and we have an active bug bounty. Contact the security team at {mailToLink}.'
                }
                values={{
                  a: (chunk: React.ReactNode) => (
                    <Paragraph
                      inline
                      accent
                      href="https://github.com/notional-finance/contracts-v2"
                    >
                      {chunk}
                    </Paragraph>
                  ),
                  mailToLink: (
                    <Paragraph
                      inline
                      accent
                      href="mailto:security@notional.finance"
                    >
                      security@notional.finance
                    </Paragraph>
                  ),
                }}
              />
            </Paragraph>
          </Box>
          <Box id="section-7-middle-container">
            <Box id="section-7-middle-left">
              <H3
                accent
                fontWeight="light"
                uppercase
                marginBottom={theme.spacing(2)}
              >
                <FormattedMessage
                  description="landing section heading"
                  defaultMessage="Recent Audits"
                />
              </H3>
              <ul className="content">
                {auditLinks.map(({ name, route }, i) => {
                  return (
                    <li key={i}>
                      <Label contrast href={route}>
                        <FormattedMessage {...name} />
                      </Label>
                    </li>
                  );
                })}
              </ul>
            </Box>
            <Box id="section-7-middle-right">
              <H3
                accent
                fontWeight="light"
                uppercase
                marginBottom={theme.spacing(2)}
              >
                <FormattedMessage defaultMessage="Bug Bounty" />
                <img
                  id="immunefi-logo"
                  src={immunifiLogoSvg}
                  alt="Immunefi logo"
                />
              </H3>
              <Box className="content">
                <Box>
                  <div id="bounty-amount">
                    <strong>$500,000</strong>
                  </div>
                  <Button
                    variant="contained"
                    color="info"
                    size="large"
                    sx={{
                      marginTop: '2.7rem',
                    }}
                    href="https://immunefi.com/bounty/notional/"
                  >
                    <FormattedMessage defaultMessage="View Bounty" />
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box id="section-7-bottom">
            <H3
              accent
              fontWeight="light"
              uppercase
              marginBottom={theme.spacing(2)}
            >
              <FormattedMessage
                defaultMessage={'Economic Risk'}
                description={'landing section heading'}
              />
            </H3>
            <Paragraph
              contrast
              fontWeight="light"
              marginBottom={theme.spacing(4)}
            >
              <FormattedMessage
                defaultMessage="We run rigorous simulations to ensure that Notional remains secure and functions properly through all market conditions. Contact the risk team at {mailToLink}."
                values={{
                  mailToLink: (
                    <Paragraph
                      accent
                      inline
                      href="mailto:risk@notional.finance"
                    >
                      risk@notional.finance
                    </Paragraph>
                  ),
                }}
              />
            </Paragraph>
            <Button
              variant="contained"
              size="large"
              color="info"
              href="https://docs.notional.finance/governance/"
            >
              <FormattedMessage
                defaultMessage="Notional Economic Analysis"
                description={'button link'}
              />
            </Button>
          </Box>
        </Box>
      </Box>
    </StyledView>
  );
};

const StyledView = styled(Box)(
  ({ theme }) => `

  #section-7 {
    #section-7-container {
      padding: 100px 170px;

      #section-7-top-container,
      #section-7-bottom {
        max-width: 860px;
        p { font-size: 22px; }

        a {
          text-decoration: none;
          color: ${theme.palette.info.main};
          &.btn {
            color: ${theme.palette.common.black};
            :hover {
              text-decoration: none;
            }
          }
        }

        a:hover {
          text-decoration: underline;
        }
      }

      #section-7-middle-container {
        display: flex;
        justify-content: space-between;
        margin-top: 60px;
        margin-bottom: 120px;

        #section-7-middle-left,
        #section-7-middle-right {
          width: 46%;
          color: ${theme.palette.common.white};

          .content {
            padding: 20px;
            mix-blend-mode: normal;
            border-radius: 6px;
          }
        }

        #section-7-middle-left {
          .content {
            background: linear-gradient(to right, rgb(17, 107, 117) 0%, rgb(29, 82, 106) 100%);
          }

          ul {
            li {
              margin-bottom: 30px;
              background: url('/assets/icons/icon-arrow-right-white-large.svg') no-repeat center right;

              a {
                text-decoration: none;
                color: ${theme.palette.background.default};
              }

              a:hover {
                text-decoration: none;
                color: ${theme.palette.info.main};
              }

              &:last-child {
                margin-bottom: 0px;
              }
            }
          }
        }

        #section-7-middle-right {
          display: flex;
          flex-direction: column;
          .heading {
            // Align top of box with the one on the left
            margin-bottom: 15px;
          }

          #immunefi-logo {
            position: relative;
            top: 4px;
            margin-left: 12px;
          }

          .content {
            background: linear-gradient(93deg, rgb(17, 107, 117) 0%, rgb(28, 84, 107) 100%);
            text-align: center;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            a {
              text-decoration: none;
            }

            a:hover {
              text-decoration: none;
            }

            #bounty-amount {
              font-size: 56px;
            }

          }
        }
      }
    }


  }

  @media (max-width: 1250px) {
    #section-7 {
      #section-7-container {
        h3 {
          text-align: center;
          font-size: 42px;
        }

        padding: 60px 20px;

        #section-7-top-container,
        #section-7-bottom {
          max-width: 860px;
          p { font-size: 18px; }
        }

        #section-7-middle-container {
          display: block;

          a.btn { width: 100%; }

          #section-7-middle-left {
            margin-bottom: 50px;
          }

          #section-7-middle-right {
            .content #bounty-amount {
              font-size: 48px;
            }
          }

          #section-7-middle-left,
          #section-7-middle-right {
            width: 100%;
          }
        }
      }
    }
  }

  @media (max-width: 500px) {
    #section-7 #section-7-container #section-7-middle-container #section-7-middle-left ul li {
      background: none;
    }
  }
`
);

export default MultidisciplinarySecurityApproach;
