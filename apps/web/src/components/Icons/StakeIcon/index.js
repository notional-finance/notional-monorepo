import React from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'

const IconSizes = {
  sm: '1rem',
  md: '2rem',
  lg: '3rem'
}

export const StakeIcon = ({ color, size }) => {
  return (
    <StyledSVG
      width={IconSizes[size]}
      height={IconSizes[size]}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.735 0.680953L9.73499 0.680972L9.73903 0.683075L15.8891 3.88644L11.976 5.93175C11.1804 5.27254 10.1373 4.8704 9.00001 4.8704C7.86255 4.8704 6.81926 5.27269 6.02364 5.9321L2.11131 3.89448L8.26146 0.682832L8.26147 0.682846L8.26502 0.680953C8.71811 0.439682 9.28191 0.439682 9.735 0.680953ZM7.50001 13.1428V17.1752L1.26131 13.9201L1.25932 13.919C1.02306 13.7971 0.830293 13.6197 0.698194 13.4088C0.566291 13.1982 0.498832 12.9608 0.500021 12.7213V12.7189V6.32702L4.55599 8.44447C4.51735 8.67044 4.50002 8.89981 4.50002 9.12921C4.50002 10.9966 5.76296 12.5653 7.50001 13.1428ZM16.7415 13.9186L16.7387 13.9201L10.5 17.1752V13.1428C12.2371 12.5653 13.5 10.9966 13.5 9.12921C13.5 8.89981 13.4827 8.67044 13.444 8.44447L17.5 6.32702V12.7189C17.5 13.2096 17.2219 13.6717 16.7415 13.9186ZM7.50001 9.12921C7.50001 8.40052 8.14641 7.7498 9.00001 7.7498C9.85361 7.7498 10.5 8.40052 10.5 9.12921C10.5 9.8579 9.85361 10.5086 9.00001 10.5086C8.14641 10.5086 7.50001 9.8579 7.50001 9.12921Z"
        strokeWidth={1.1}
        fill="transparent"
        stroke={color}
      />
    </StyledSVG>
  )
}

StakeIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

StakeIcon.defaultProps = {
  color: '#000000',
  size: 'sm'
}

const StyledSVG = styled.svg``
