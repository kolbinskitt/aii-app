import { Table as AntTable } from 'antd';
import type { TableProps } from 'antd';

export function Table<T>(props: TableProps<T>) {
  return (
    <div className="rounded-md overflow-hidden shadow-md">
      <AntTable {...props} pagination={false} />
    </div>
  );
}
