'use client';

import { Tabs as AntdTabs } from 'antd';
import type { TabsProps as AntdTabsProps } from 'antd';
import clsx from 'clsx';
import { ReactNode, FC } from 'react';

export type TabsTab = {
  key: string;
  label: ReactNode;
  children: ReactNode;
  forceRender?: boolean;
  disabled?: boolean;
};

type Props = Omit<AntdTabsProps, 'items'> & {
  tabs: TabsTab[];
  className?: string;
};

export const Tabs: FC<Props> = ({ tabs, className, ...rest }) => {
  const items: AntdTabsProps['items'] = tabs.map(tab => ({
    key: tab.key,
    label: tab.label,
    children: tab.children,
    forceRender: tab.forceRender,
    disabled: tab.disabled,
  }));

  return (
    <AntdTabs
      className={clsx('rounded-md shadow-sm bg-background p-2', className)}
      items={items}
      {...rest}
    />
  );
};

export default Tabs;
