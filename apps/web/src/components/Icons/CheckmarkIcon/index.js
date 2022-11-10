import React from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'

const IconSizes = {
  sm: '1rem',
  md: '2rem',
  lg: '3rem'
}

export const CheckmarkIcon = ({ color, size }) => {
  return (
    <StyledSVG
      width={IconSizes[size]}
      height={IconSizes[size]}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        // eslint-disable-next-line max-len
        d="M24 0C19.2533 0 14.6131 1.40758 10.6663 4.04473C6.71954 6.68188 3.6434 10.4302 1.8269 14.8156C0.0103988 19.201 -0.464881 24.0266 0.461164 28.6822C1.38721 33.3377 3.67299 37.6141 7.02945 40.9706C10.3859 44.327 14.6623 46.6128 19.3178 47.5388C23.9734 48.4649 28.799 47.9896 33.1844 46.1731C37.5698 44.3566 41.3181 41.2805 43.9553 37.3337C46.5924 33.3869 48 28.7467 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0Z"
        fill={color}
      />
      <path
        // eslint-disable-next-line max-len
        d="M20.5714 33.2813L12 24.7081L14.4223 22.2859L20.5714 28.4333L33.5743 15.4287L36 17.8544L20.5714 33.2813Z"
        fill="white"
      />
    </StyledSVG>
  )
}

CheckmarkIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

CheckmarkIcon.defaultProps = {
  color: '#1F9B99',
  size: 'sm'
}

const StyledSVG = styled.svg``
