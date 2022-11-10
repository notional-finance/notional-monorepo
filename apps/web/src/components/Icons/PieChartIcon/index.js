import React from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'

const IconSizes = {
  sm: '1rem',
  md: '2rem',
  lg: '3rem'
}

export const PieChartIcon = ({ color, size }) => {
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
        d="M7 0.25C3.27815 0.25 0.25 3.27815 0.25 7C0.25 10.7218 3.27815 13.75 7 13.75C10.7218 13.75 13.75 10.7218 13.75 7C13.75 3.27815 10.7218 0.25 7 0.25ZM6.41587 1.32117C6.43819 1.3191 6.45844 1.32273 6.48077 1.32117V7.21081L6.62667 7.37333L10.6668 11.3974C9.67767 12.2245 8.39569 12.7115 7 12.7115C3.83996 12.7115 1.28846 10.16 1.28846 7C1.28669 5.58606 1.8104 4.22192 2.75791 3.17241C3.70541 2.12291 5.00911 1.46295 6.41587 1.32065V1.32117ZM7.51923 1.32117C8.84776 1.43981 10.0924 2.0215 11.0356 2.9646C11.9788 3.90771 12.5606 5.15225 12.6793 6.48077H7.51923V1.32117ZM8.26588 7.51923H12.6793C12.5713 8.70983 12.1212 9.80125 11.3968 10.6673L8.26588 7.51923Z"
        fill={color}
      />
    </StyledSVG>
  )
}

PieChartIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

PieChartIcon.defaultProps = {
  color: '#000000',
  size: 'sm'
}

const StyledSVG = styled.svg``
