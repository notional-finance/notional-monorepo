import { Story, Meta } from '@storybook/react';
import { TabToggle, TabToggleProps } from './tab-toggle';

export default {
  component: TabToggle,
  title: 'TabToggle',
} as Meta;

const Template: Story<TabToggleProps> = (args) => <TabToggle {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  selectedTabIndex: 0,
  tabLabels: ['Tab 1', 'Tab 2'],
  tabPanels: ['Tab Panel 1', 'Tab Panel 2'],
};
