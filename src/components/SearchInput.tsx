import { SearchIcon } from '@heroicons/react/outline';
import cx from 'classnames';
import { InputHTMLAttributes } from 'react';

export default function SearchInput(
  _props: InputHTMLAttributes<HTMLInputElement>
) {
  const { className = '', ...props } = _props;

  return (
    <label className='relative w-full flex-1'>
      <input
        className={cx(
          'w-full select-none border-none bg-gray-100 pl-8 text-sm text-gray-500 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-200 dark:bg-slate-600 dark:text-white dark:ring-gray-500 dark:placeholder:text-gray-400 dark:focus:ring-blue-300',
          className
        )}
        {...props}
      />
      <SearchIcon
        className='absolute top-0 left-2.5 h-full stroke-gray-500 dark:stroke-gray-400'
        width={16}
        height={16}
      />
    </label>
  );
}
