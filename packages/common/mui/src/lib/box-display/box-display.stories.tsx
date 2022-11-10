import { Box } from '@mui/material';
import { Story, Meta } from '@storybook/react';
import { BoxDisplay, BoxDisplayProps } from './box-display';

export default {
  component: BoxDisplay,
  title: 'BoxDisplay',
} as Meta;

const Template: Story<BoxDisplayProps> = (args) => {
  return (
    <Box
      sx={{
        padding: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        width: '20rem',
        backgroundColor: '#F8FAFA',
      }}
    >
      <BoxDisplay {...args} />
    </Box>
  );
};

export const Light = Template.bind({});
Light.args = {
  title: 'Total at Maturity',
  value: 1.006,
  symbol: 'ETH',
};

export const Dark = Template.bind({});
Dark.args = {
  title: 'Variable Yield',
  symbol: 'APY',
  value: 3.511,
  valueSuffix: '%',
};
