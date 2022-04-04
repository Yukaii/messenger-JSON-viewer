import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';
import cx from 'classnames';
import { useState } from 'react';

export default function OnboardingCarousel({
  children,
  className,
}: {
  children?: React.ReactNode[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!children) return null;

  const hasNext = activeIndex < children.length - 1;
  const hasPrev = activeIndex > 0;

  const next = () => {
    if (!hasNext) return;
    setActiveIndex(activeIndex + 1);
  };

  const prev = () => {
    if (!hasPrev) return;
    setActiveIndex(activeIndex - 1);
  };

  return (
    <div className={cx('relative h-full px-5', className)}>
      <div className='flex h-full w-full items-center justify-between'>
        {hasPrev ? (
          <button
            className='mr-2 rounded-full p-3 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600'
            onClick={prev}
          >
            <ChevronLeftIcon width={30} />
          </button>
        ) : (
          <div />
        )}

        {children?.[activeIndex]}

        {hasNext ? (
          <button
            className='ml-2 rounded-full p-3 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600'
            onClick={next}
          >
            <ChevronRightIcon width={30} />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
