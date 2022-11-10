import ReactCountUp from 'react-countup';

/* eslint-disable-next-line */
export interface CountUpProps {
  value?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}

export function CountUp({
  value = 0,
  suffix = '',
  prefix = '',
  duration = 0.65,
  decimals = 3,
}: CountUpProps) {
  if (value !== undefined || value !== null) {
    return (
      <ReactCountUp
        end={value}
        duration={duration || 0.65}
        decimals={decimals}
        delay={0}
        suffix={suffix}
        prefix={prefix}
        separator=","
        preserveValue
      />
    );
  }

  return null;
}

export default CountUp;
