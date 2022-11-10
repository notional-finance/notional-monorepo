import { Story, Meta } from '@storybook/react';
import { PortfolioIcon, PortfolioIconProps } from './portfolio-chart-icon';

export default {
  component: PortfolioIcon,
  title: 'PortfolioIcon',
} as Meta;

const Template: Story<PortfolioIconProps> = (args) => <PortfolioIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
