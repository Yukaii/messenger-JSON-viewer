import { RefreshIcon, SearchIcon } from '@heroicons/react/outline';
import cx from 'classnames';
import randomColor from 'randomcolor';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { findInboxFolder } from '@/lib/utils/file';
import {
  decodeString,
  getMyselfName,
  loadChats,
  useCurrentMessage,
  useGroupedMessages,
} from '@/lib/utils/message';

import Message from '@/components/Message';

function StartScreen({ openDirPicker }: { openDirPicker: () => void }) {
  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <div>
        <button
          className='rounded px-4 py-2 ring-1 hover:bg-indigo-500 hover:text-white'
          onClick={openDirPicker}
        >
          Select Messenger archived folder
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );
  const [inboxDir, setInboxDir] = useState<FileSystemDirectoryHandle | null>(
    null
  );

  const [folderName, setFolderName] = useState<string | null>(null);
  const currentMessage = useCurrentMessage(folderName);
  const groupedMessages = useGroupedMessages(currentMessage);

  const { data } = useSWR('chats', () => loadChats(inboxDir));
  const { data: myName = null } = useSWR(
    () => (directory ? 'myName' : false),
    () => {
      return getMyselfName(directory!);
    }
  );

  const chats = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return data.sort((a, b) => b.lastSent - a.lastSent);
  }, [data]);

  const openDirPicker = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();

      const inbox = await findInboxFolder(directoryHandle);

      if (inbox) {
        setInboxDir(inbox);
        setDirectory(directoryHandle);
      } else {
        window.alert('This is not a valid Messenger archive folder.');
      }
      // eslint-disable-next-line no-empty
    } catch {}
  };

  if (!data || data.length === 0) {
    return <StartScreen openDirPicker={openDirPicker} />;
  } else {
    return (
      <div className='flex h-full'>
        {/* Sidebar */}
        <div
          className='flex h-full max-h-full flex-col border-r border-solid'
          style={{ maxWidth: 350 }}
        >
          <div className='flex flex-col items-start justify-center border-b border-solid px-4 py-4'>
            <div className='mb-4 flex w-full items-center justify-between'>
              <h3 className='select-none text-lg font-semibold'>
                Viewing {myName}&#39;s chat history
              </h3>

              <button className='rounded-full border-none p-2 hover:bg-gray-100'>
                <RefreshIcon width={18} />
              </button>
            </div>

            <label className='relative w-full flex-1'>
              <input
                placeholder='Search for user...'
                className='w-full rounded-lg border-none bg-gray-100 py-2 px-4 pl-8 text-sm text-gray-500 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-200'
              />
              <SearchIcon
                className='absolute top-0 left-2.5 h-full stroke-gray-500'
                width={16}
                height={16}
              />
            </label>
          </div>

          <div className='overflow-y-auto overflow-x-hidden'>
            {chats.map((chat) => (
              <div
                className='max-w-full cursor-default px-1 py-1.5'
                key={chat.dirName}
              >
                <div
                  className={cx(
                    'flex flex-col rounded-lg py-3 px-5 hover:bg-gray-100',
                    {
                      'bg-gray-100': folderName === chat.dirName,
                    }
                  )}
                  onClick={() => {
                    setFolderName(chat.dirName);
                  }}
                >
                  <span className='mb-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap'>
                    {chat.title}
                  </span>
                  <small className='max-w-full overflow-hidden text-ellipsis text-gray-400'>
                    {chat.dirName}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message boxes */}
        <div className='flex flex-1 flex-col'>
          <div className='flex w-full items-center border-b py-4 px-4'>
            <h3 className='select-none text-lg font-semibold'>
              {currentMessage
                ? decodeString(currentMessage.title)
                : 'Please select chat to view'}
            </h3>
          </div>

          <div className='flex flex-1 flex-col gap-5 overflow-y-auto break-all px-4 py-4'>
            {groupedMessages.map((messages, groupIdx) => {
              const sectionSenderName = decodeString(messages[0].sender_name);
              const color = randomColor({
                seed: sectionSenderName,
              });
              const isMe = sectionSenderName === myName;

              return (
                <div
                  className={cx('flex gap-2', {
                    'flex-row-reverse': isMe,
                  })}
                  key={groupIdx}
                >
                  {/* Avatar */}
                  {!isMe && (
                    <div className='flex flex-col items-center justify-end'>
                      <div
                        style={{
                          backgroundColor: color,
                        }}
                        className='h-8 w-8 rounded-full'
                      />
                    </div>
                  )}

                  {/* Messages */}
                  <div
                    className='item flex flex-col justify-between gap-0.5'
                    style={{
                      maxWidth: '75%',
                    }}
                  >
                    {!isMe && (
                      <small className='select-none pl-2 text-gray-400'>
                        {sectionSenderName}
                      </small>
                    )}

                    {messages.map((message, i) => {
                      const isFirst = i === 0;
                      const isLast = i === messages.length - 1;

                      return (
                        <Message
                          message={message}
                          key={`message_${message.sender_name}_${groupIdx}_${i}`}
                          isFirst={isFirst}
                          isLast={isLast}
                          isMe={isMe}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
