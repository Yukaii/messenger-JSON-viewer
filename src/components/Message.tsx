import cx from 'classnames';

import { decodeString } from '@/lib/utils/message';

import { Message } from '@/types';

export default function Message({
  message,
  isFirst,
  isLast,
  isMe,
}: {
  message: Message;
  isFirst: boolean;
  isLast: boolean;
  isMe: boolean;
}) {
  const content = decodeString(message.content || '');

  return content ? (
    <div
      className={cx('flex', {
        'justify-end': isMe,
      })}
    >
      <div
        className={cx('whitespace-pre-wrap rounded-2xl px-4 py-2', {
          'rounded-r-md bg-blue-400 text-white': isMe,
          'rounded-l-md bg-gray-200': !isMe,
          'rounded-tl-2xl': isFirst && !isMe,
          'rounded-bl-2xl': isLast && !isMe,
          'rounded-tr-2xl': isFirst && isMe,
          'rounded-br-2xl': isLast && isMe,
        })}
      >
        {content}
      </div>
    </div>
  ) : null;
}
