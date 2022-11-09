import { Story, Meta } from '@storybook/react';
import { PageLoading, PageLoadingProps } from './page-loading';

export default {
  component: PageLoading,
  title: 'PageLoading',
} as Meta;

const Template: Story<PageLoadingProps> = (args) => <PageLoading {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
