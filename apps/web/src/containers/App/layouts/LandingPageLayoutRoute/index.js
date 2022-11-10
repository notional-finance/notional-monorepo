import PropTypes from 'prop-types'
import { CompatRoute } from 'react-router-dom-v5-compat'
import { Box } from '@mui/material'
import { HeaderRenderer } from '../../HeaderRenderer'

const LandingPageLayoutRoute = ({ component: Component, path, routeKey }) => {
  return (
    <CompatRoute
      path={path}
      key={routeKey}
      render={(matchProps) => (
        <Box>
          <Box
            sx={{
              marginTop: { xs: '56px', sm: '64px', lg: '72px' }
            }}
          >
            <HeaderRenderer pageLayout="landing" />
            <Component {...matchProps} />
          </Box>
        </Box>
      )}
    />
  )
}

LandingPageLayoutRoute.propTypes = {
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  routeKey: PropTypes.string
}

LandingPageLayoutRoute.defaultProps = {
  routeKey: ''
}

export default LandingPageLayoutRoute
