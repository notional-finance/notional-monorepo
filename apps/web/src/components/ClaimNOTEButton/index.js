import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import * as governanceActionCreators from '@notional-finance/core/actions/actions-governance';
import loadComponentNotionalReady from 'core/hocs/load-component-notional-ready';
import { Box, Button, styled } from '@mui/material';
import NoteTokenSVG from '@notional-finance/assets/icons/tokens/token-note-claim.svg';
import { countUp } from '@notional-finance/core';

class ClaimNOTEButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userNoteEarnedCountUp: 0,
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.governance.getUserNoteEarned();
  }

  componentDidUpdate(prevProps) {
    const { intervalId } = this.state;
    const { governance, wallet, actions } = this.props;

    if (
      prevProps.wallet.walletProvider?.account?.address !==
      wallet.walletProvider?.account?.address
    ) {
      // If the wallet has changed get the new note earned
      clearInterval(intervalId);
      actions.governance.getUserNoteEarned();
    }

    if (
      prevProps.governance.userNoteEarned !== governance.userNoteEarned ||
      prevProps.governance.userNoteEarnedPerSecond !==
        governance.userNoteEarnedPerSecond
    ) {
      if (governance.userNoteEarnedPerSecond > 0) {
        clearInterval(intervalId);
        // If there is a per second user note earned value then we set an interval to count up
        // every 100 ms to create a ticker effect.
        const newIntervalId = setInterval(() => {
          this.setState((prevState) => {
            return {
              userNoteEarnedCountUp:
                prevState.userNoteEarnedCountUp +
                0.1 * governance.userNoteEarnedPerSecond,
            };
          });
        }, 100);

        // Set this to the baseline user note earned so we count up from there
        this.setState({
          intervalId: newIntervalId,
          userNoteEarnedCountUp: governance.userNoteEarned,
        });
      } else {
        clearInterval(intervalId);
        this.setState({ userNoteEarnedCountUp: governance.userNoteEarned });
      }
    }
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  claimNoteToken = () => {
    const { actions } = this.props;
    actions.governance.claimIncentives();
  };

  render() {
    const { userNoteEarnedCountUp } = this.state;

    return (
      <StyledButton>
        <Button
          classes={{ disabled: 'claim-note-disabled' }}
          onClick={this.claimNoteToken}
          onKeyPress={this.claimNoteToken}
          disabled={userNoteEarnedCountUp === 0}
        >
          <img src={NoteTokenSVG} width="32px" alt="claim note token" />
          <span>
            <FormattedMessage defaultMessage={'Claim'} />
            &nbsp;
            {userNoteEarnedCountUp === 0
              ? 'NOTE'
              : countUp(userNoteEarnedCountUp, ' NOTE', 0.1)}
          </span>
        </Button>
      </StyledButton>
    );
  }
}

const StyledButton = styled(Box)(
  ({ theme }) => `
  .MuiButton-root {
    background-color: ${theme.palette.background.default};
    padding: 8px 12px;
    width: 260px;
    border: 1px solid #E7E8F2;
    box-shadow: 0px 4px 10px 0px #142A4A12;

    &.claim-note-disabled {
      span {
        color: ${theme.palette.typography.light};
      }
    }
    &:hover {
      border: 1px solid transparent;
      background-color: ${theme.palette.primary.main};

      span {
        color: ${theme.palette.background.default};
      }
    }

    img {
      margin-right: .5rem;
    }

    span {
      color: ${theme.palette.primary.main};
      font-size: 1rem;
      text-transform: capitalize;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
    }
  }
`
);

function mapStateToProps(state) {
  return {
    wallet: state.wallet,
    governance: state.governance,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      governance: bindActionCreators(governanceActionCreators, dispatch),
    },
  };
}

ClaimNOTEButton.propTypes = {
  actions: PropTypes.shape({
    governance: PropTypes.shape({
      getUserNoteEarned: PropTypes.func.isRequired,
      claimIncentives: PropTypes.func.isRequired,
    }),
  }).isRequired,
  wallet: PropTypes.shape({
    walletProvider: PropTypes.shape({
      account: PropTypes.shape({
        address: PropTypes.string,
      }),
    }),
  }).isRequired,
  governance: PropTypes.shape({
    userNoteEarned: PropTypes.number,
    userNoteEarnedPerSecond: PropTypes.number,
  }),
};

ClaimNOTEButton.defaultProps = {
  governance: {
    userNoteEarned: 0,
    userNoteEarnedPerSecond: 0,
  },
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  loadComponentNotionalReady()
)(ClaimNOTEButton);
