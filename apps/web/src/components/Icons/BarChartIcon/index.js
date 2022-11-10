import React from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'

const IconSizes = {
  sm: '1rem',
  md: '2rem',
  lg: '3rem'
}

export const BarChartIcon = ({ color, size }) => {
  return (
    <StyledSVG
      width={IconSizes[size]}
      height={IconSizes[size]}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        // eslint-disable-next-line max-len
        d="M2.38158 9.8421L0.25 11.9311V5.93421H2.38158V9.8421ZM5.93421 8.53474L4.81868 7.58263L3.80263 8.52053V3.09211H5.93421V8.53474ZM9.48684 7.35526L7.35526 9.48684V0.25H9.48684V7.35526ZM11.4834 7.22026L10.1974 5.93421H13.75V9.48684L12.4782 8.215L7.35526 13.2953L4.88974 11.1495L2.20395 13.75H0.25L4.84711 9.24526L7.35526 11.3626"
        fill={color}
      />
    </StyledSVG>
  )
}

BarChartIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

BarChartIcon.defaultProps = {
  color: '#000000',
  size: 'sm'
}

const StyledSVG = styled.svg``
