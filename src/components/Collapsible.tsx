import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import cx from 'clsx';

export default function Collapsible({
  isExpanded = false,
  title = '',
  children,
  onToggle,
  containerClassName,
}: {
  children?: React.ReactNode;
  isExpanded?: boolean;
  title: string;
  onToggle?: () => void;
  containerClassName: string;
}) {
  return (
    <div className={cx('flex flex-col')}>
      <div
        className='flex cursor-default select-none justify-between rounded-md px-2 py-3 pr-4 ring-blue-500 hover:bg-slate-100 active:ring-1 dark:hover:bg-slate-600'
        onClick={onToggle}
      >
        <span className='text-base font-semibold'>{title}</span>

        {isExpanded ? (
          <ChevronUpIcon width={18} />
        ) : (
          <ChevronDownIcon width={18} />
        )}
      </div>

      <div
        className={cx(containerClassName, {
          hidden: !isExpanded,
        })}
      >
        {children}
      </div>
    </div>
  );
}
