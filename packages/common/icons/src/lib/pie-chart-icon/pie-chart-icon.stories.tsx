import { Story, Meta } from '@storybook/react';
import { PieChartIcon, PieChartIconProps } from './pie-chart-icon';

export default {
  component: PieChartIcon,
  title: 'PieChartIcon',
} as Meta;

const Template: Story<PieChartIconProps> = (args) => <PieChartIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
