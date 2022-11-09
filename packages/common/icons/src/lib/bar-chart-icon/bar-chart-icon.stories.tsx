import { Story, Meta } from '@storybook/react';
import { BarChartIcon, BarChartIconProps } from './bar-chart-icon';

export default {
  component: BarChartIcon,
  title: 'BarChartIcon',
} as Meta;

const Template: Story<BarChartIconProps> = (args) => <BarChartIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
