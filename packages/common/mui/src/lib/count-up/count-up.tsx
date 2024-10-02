import ReactCountUp from 'react-countup';

 
export interface CountUpProps {
  value?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  delay?: number;
}

export function CountUp({
  value = 0,
  suffix = '',
  prefix = '',
  duration = 0.65,
  decimals = 2,
  delay = 0,
}: CountUpProps) {
  if (value !== undefined || value !== null) {
    return (
      <ReactCountUp
        end={value}
        duration={duration}
        decimals={decimals}
        delay={delay}
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
