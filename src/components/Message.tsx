/* eslint-disable @next/next/no-img-element */
import cx from 'classnames';
import { SRLWrapper } from 'simple-react-lightbox';
import useSWR from 'swr';

import { getFileHandleRecursively } from '@/lib/utils/file';
import { decodeString } from '@/lib/utils/message';

import { Message, MessageType } from '../types';

function BaseMessage({
  children,
  isFirst,
  isLast,
  isMe,
}: {
  children?: React.ReactNode;
  isFirst: boolean;
  isLast: boolean;
  isMe: boolean;
}) {
  return (
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
        {children}
      </div>
    </div>
  );
}

export default function MessageComponent({
  message,
  isFirst,
  isLast,
  isMe,
  rootDir,
}: {
  message: Message;
  isFirst: boolean;
  isLast: boolean;
  isMe: boolean;
  rootDir: FileSystemDirectoryHandle;
}) {
  const content = decodeString(message.content || '');
  const { data: imageURIs } = useSWR(
    () =>
      message.type === MessageType.Generic && message.photos
        ? `/message/photo/${message.timestamp_ms}`
        : null,
    async () => {
      if (!(message.type === MessageType.Generic && message.photos)) {
        return [];
      }

      const images = await Promise.all(
        message.photos.map(async (photo) => {
          const uri = photo.uri.replace(/^messages\//, '');
          const fileHandle = await getFileHandleRecursively(rootDir, uri);
          if (!fileHandle) {
            return null;
          }
          const file = await fileHandle.getFile();
          const url = URL.createObjectURL(file);
          return url;
        })
      );

      return images.filter(Boolean) as string[];
    }
  );

  switch (message.type) {
    case MessageType.Generic: {
      if (message.photos) {
        return (
          <SRLWrapper>
            <BaseMessage isFirst={isFirst} isLast={isLast} isMe={isMe}>
              {imageURIs
                ? imageURIs.map((uri) => (
                    <a href={uri} key={uri}>
                      <img src={uri} alt={uri} />
                    </a>
                  ))
                : content}
            </BaseMessage>
          </SRLWrapper>
        );
      } else if (message.content) {
        return (
          <BaseMessage isFirst={isFirst} isLast={isLast} isMe={isMe}>
            {content}
          </BaseMessage>
        );
      } else {
        return null;
      }
    }
    default:
      return null;
  }
}
