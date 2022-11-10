import { Tabs as MuiTabs, Tab, styled } from '@mui/material'
import { LEND_BORROW } from '@notional-finance/utils'
import { FormattedMessage } from 'react-intl'
import { updateLandingState, useLandingPageInput } from '../../store'

export const Tabs = () => {
  const { lendOrBorrow } = useLandingPageInput()
  const tabSelected = lendOrBorrow === LEND_BORROW.BORROW ? 0 : 1

  const handleChange = (_, newValue: number) => {
    const newLendOrBorrow = newValue === 0 ? LEND_BORROW.BORROW : LEND_BORROW.LEND
    updateLandingState({ lendOrBorrow: newLendOrBorrow })
  }

  return (
    <StyledTabs
      value={tabSelected}
      onChange={handleChange}
      aria-label="tabs"
      classes={{
        indicator: 'MuiTabs-indicator'
      }}
    >
      <Tab
        label={<FormattedMessage defaultMessage={'Borrow'} />}
        classes={{
          root: 'MuiTab-root',
          selected: 'MuiTab-selected'
        }}
      />
      <Tab
        label={<FormattedMessage defaultMessage={'Lend'} />}
        classes={{
          root: 'MuiTab-root',
          selected: 'MuiTab-selected'
        }}
      />
    </StyledTabs>
  )
}

const StyledTabs = styled(MuiTabs)(
  ({ theme }) => `
  background: ${theme.palette.common.black};
  border: 1px solid ${theme.palette.primary.dark};
  border-radius: 50px;
  max-width: 290px;
  margin: 30px auto;

  .MuiTabs-indicator {
    background: none;
  }

  .MuiTab-root {
    text-transform: capitalize;
    min-width: 145px;
    border-radius: 50px;
    color: ${theme.palette.common.white};
    font-size: 16px;
  }

  .MuiTab-selected,
  .Mui-selected {
    background: ${theme.gradient.landing};
    color: ${theme.palette.common.black} !important;
  }
`
)
