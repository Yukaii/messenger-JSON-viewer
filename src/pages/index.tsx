import {
  InformationCircleIcon,
  MoonIcon,
  RefreshIcon,
  SunIcon,
} from '@heroicons/react/outline';
import cx from 'classnames';
import randomColor from 'randomcolor';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import useTheme from '@/lib/hooks/useTheme';
import useThemeColor from '@/lib/hooks/useThemeColor';
import useToggle from '@/lib/hooks/useToggle';
import useWindowOverlay from '@/lib/hooks/useWindowOverlay';
import { findInboxFolder } from '@/lib/utils/file';
import {
  decodeString,
  getMyselfName,
  loadChats,
  useChatStatistics,
  useCurrentMessage,
  useGroupedMessages,
} from '@/lib/utils/message';

import Collapsible from '@/components/Collapsible';
import MessageComponent from '@/components/Message';
import OnboardingCarousel from '@/components/OnboardingCarousel';
import SearchInput from '@/components/SearchInput';

function StartScreen({ openDirPicker }: { openDirPicker: () => void }) {
  const contents = [
    <div
      key='step-1'
      className='flex w-full flex-col items-center justify-center'
    >
      <img src='/ios/100.png' alt='logo' width={100} height={100} />
      <h1 className='text-center text-2xl font-bold'>
        Welcome to Facebook Messenger exported JSON viewer
      </h1>
      <p className='mt-5'>Click next to continue</p>
    </div>,
    <div
      key='step-2'
      className='flex w-full flex-col items-center justify-center'
    >
      <img
        src='/images/step1.png'
        className='mb-5 w-full max-w-5xl'
        alt='step-1'
      />
      <h2 className='text-center text-xl font-bold'>
        Step 1: Export the messenger data as JSON from Facebook. Go to{' '}
        <a
          href='https://www.facebook.com/dyi'
          target='_blank'
          rel='noreferrer'
          className='underline'
        >
          Download Your Information
        </a>{' '}
        page.
      </h2>
    </div>,
    <div
      key='step-3'
      className='flex w-full flex-col items-center justify-center'
    >
      <img
        src='/images/step2.png'
        className='mb-5 w-full max-w-5xl'
        alt='step-2'
      />
      <h2 className='text-center text-xl font-bold'>
        Step 2: Make sure your folder looks like this.
      </h2>
    </div>,
    <div key='step-3'>
      <button
        className='rounded px-4 py-2 ring-1 hover:bg-blue-500 hover:text-white'
        onClick={openDirPicker}
      >
        Open Folder
      </button>
    </div>,
  ];

  return (
    <OnboardingCarousel className='flex h-full flex-col items-center justify-center overflow-hidden'>
      {contents}
    </OnboardingCarousel>
  );
}

export default function HomePage() {
  const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );
  const [inboxDir, setInboxDir] = useState<FileSystemDirectoryHandle | null>(
    null
  );
  const [search, setSearch] = useState('');
  const [infoPanelOpen, , toggleInfoPanel] = useToggle(false);
  const [chatMembersInfoExpanded, , toggleChatMembersInfo] = useToggle(false);
  const [messageCountExpanded, , toggleMessageCount] = useToggle(false);
  const [chatInfoExpanded, , toggleChatInfo] = useToggle(false);

  const [folderName, setFolderName] = useState<string | null>(null);
  const currentMessage = useCurrentMessage(folderName);
  const groupedMessages = useGroupedMessages(currentMessage);
  const chatStatistic = useChatStatistics(currentMessage);
  const { windowControlsOverlayEnable, windowControlsOverlayRect } =
    useWindowOverlay();

  const { dark, toggleTheme, theme } = useTheme();
  useThemeColor({
    dark: '#121212',
    light: '#ffffff',
  });

  const { data } = useSWR(
    () => inboxDir?.name && ['chats', inboxDir?.name],
    () => loadChats(inboxDir)
  );
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

    return data
      .sort((a, b) => b.lastSent - a.lastSent)
      .filter((c) => c.title.includes(search) || c.dirName.includes(search));
  }, [data, search]);

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
      <div
        className='flex h-full'
        style={{
          paddingTop: windowControlsOverlayRect?.height ?? 0,
        }}
      >
        {windowControlsOverlayEnable && (
          <div
            className='fixed z-50 flex items-center'
            style={{
              width: windowControlsOverlayRect?.width || 0,
              height: windowControlsOverlayRect?.height || 0,
              top: windowControlsOverlayRect?.top || 0,
              left: windowControlsOverlayRect?.left || 0,
              WebkitAppRegion: 'drag',
            }}
          >
            <div className='px-4' style={{ maxWidth: 300 }}>
              <SearchInput
                className='rounded-sm py-0.5 px-4'
                style={{
                  WebkitAppRegion: 'no-drag',
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search for user...'
              />
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div
          className='flex h-full max-h-full w-full flex-col border-r border-solid dark:border-gray-600'
          style={{ maxWidth: 350 }}
        >
          <div className='flex flex-col items-start justify-center border-b border-solid px-4 py-4 dark:border-gray-600'>
            <div className='flex w-full items-center justify-between'>
              <h3 className='select-none text-lg font-semibold'>
                {myName}&#39;s chat history
              </h3>

              <div className='flex gap-2'>
                <button
                  className='rounded-full border-none p-2 hover:bg-gray-100 hover:dark:bg-gray-600'
                  onClick={toggleTheme}
                  title='Toggle Theme'
                >
                  {dark ? <MoonIcon width={18} /> : <SunIcon width={18} />}
                </button>

                <button
                  className='rounded-full border-none p-2 hover:bg-gray-100 hover:dark:bg-gray-600'
                  title='Start Over'
                  onClick={() => {
                    setDirectory(null);
                    setInboxDir(null);
                    setFolderName(null);
                  }}
                >
                  <RefreshIcon width={18} />
                </button>
              </div>
            </div>

            {!windowControlsOverlayEnable && (
              <SearchInput
                className='mt-4 rounded-lg py-2 px-4'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search for user...'
              />
            )}
          </div>

          {chats.length > 0 && (
            <div className='overflow-y-auto overflow-x-hidden'>
              {chats.map((chat) => (
                <div
                  className='max-w-full cursor-default px-1 py-1.5'
                  key={chat.dirName}
                >
                  <div
                    className={cx(
                      'flex items-center gap-2 rounded-lg py-3 px-5 hover:bg-gray-100 hover:dark:bg-gray-600',
                      {
                        'bg-gray-100 dark:bg-gray-600':
                          folderName === chat.dirName,
                      }
                    )}
                    onClick={() => {
                      setFolderName(chat.dirName);
                    }}
                  >
                    <div
                      className='flex h-9 w-9 select-none items-center justify-center rounded-full text-xl text-white'
                      style={{
                        minWidth: '2.25rem',
                        minHeight: '2.25rem',
                        backgroundColor: randomColor({
                          luminosity: 'dark',
                          seed: chat.dirName,
                        }),
                      }}
                    >
                      {chat.title[0]}
                    </div>

                    <div className='flex max-w-full flex-col'>
                      <span className='mb-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap'>
                        {chat.title}
                      </span>
                      <small className='max-w-full overflow-hidden text-ellipsis text-gray-400'>
                        {chat.dirName}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {chats.length === 0 && (
            <div className='flex h-full w-full select-none justify-center'>
              <div className='pt-6 text-gray-600 dark:text-gray-500'>
                No results
              </div>
            </div>
          )}
        </div>

        {/* Message boxes */}
        <div className='flex flex-1 flex-col'>
          <div className='flex w-full items-center justify-between border-b py-4 px-4 dark:border-gray-600'>
            <h3 className='select-none text-lg font-semibold'>
              {currentMessage
                ? decodeString(currentMessage.title)
                : 'Please select chat to view'}
            </h3>

            <button
              className='rounded-full border-none p-2 hover:bg-gray-100 hover:dark:bg-gray-600'
              onClick={toggleInfoPanel}
            >
              <InformationCircleIcon width={18} />
            </button>
          </div>

          <div className='flex flex-1 flex-col gap-5 overflow-y-auto break-all px-4 py-4'>
            {groupedMessages.map((messages, groupIdx) => {
              const sectionSenderName = decodeString(messages[0].sender_name);
              const color = randomColor({
                seed: sectionSenderName,
                luminosity: theme,
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
                      maxWidth: '65%',
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
                        <MessageComponent
                          rootDir={directory!}
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

        {/* Info Panel */}
        {infoPanelOpen && currentMessage && (
          <div
            className='flex h-full w-full flex-col overflow-y-auto border-l py-4 px-4 dark:border-gray-600'
            style={{ maxWidth: 350 }}
          >
            <h3 className='mb-4 select-none text-center text-lg font-semibold'>
              {decodeString(currentMessage.title)}
            </h3>

            <Collapsible
              title='Chat Members'
              containerClassName='flex flex-col gap-4 py-4 px-5'
              isExpanded={chatMembersInfoExpanded}
              onToggle={toggleChatMembersInfo}
            >
              {currentMessage.participants.map((part) => {
                const color = randomColor({
                  seed: part.name,
                  luminosity: theme,
                });

                return (
                  <div className='flex gap-2' key={part.name}>
                    <div
                      style={{
                        backgroundColor: color,
                      }}
                      className='h-6 w-6 rounded-full'
                    />

                    <span className='text-base'>{decodeString(part.name)}</span>
                  </div>
                );
              })}
            </Collapsible>

            {chatStatistic && (
              <Collapsible
                title='Chat Information'
                containerClassName='flex flex-col gap-4 py-4 px-5'
                isExpanded={chatInfoExpanded}
                onToggle={toggleChatInfo}
              >
                <div className='flex justify-between'>
                  <span className='text-base font-medium'>Messages Count</span>

                  <span className='text-right text-base text-gray-500'>
                    {currentMessage.messages.length}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-base font-medium'>Members Count</span>

                  <span className='text-base text-gray-500'>
                    {currentMessage.participants.length}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-base font-medium'>Created At</span>

                  <span className='text-right text-base text-gray-500'>
                    {new Date(chatStatistic.createdAt).toLocaleString()}
                  </span>
                </div>
              </Collapsible>
            )}

            {chatStatistic && (
              <Collapsible
                title='Messages Count'
                isExpanded={messageCountExpanded}
                onToggle={toggleMessageCount}
                containerClassName='flex flex-col gap-4 py-4 px-5'
              >
                {Object.entries(chatStatistic.countInfo)
                  .sort(([, aCount], [, bCount]) => bCount - aCount)
                  .map(([senderName, count]) => (
                    <div key={senderName} className='flex justify-between'>
                      <span className='text-base'>
                        {decodeString(senderName)}
                      </span>

                      <span className='ml-2 text-base text-gray-500'>
                        (
                        {(
                          (count / currentMessage.messages.length) *
                          100
                        ).toFixed(1)}
                        % ) {count}
                      </span>
                    </div>
                  ))}

                <div className='flex justify-between'>
                  <span className='text-base font-medium'>Total</span>

                  <span className='ml-2 text-base text-gray-500'>
                    {currentMessage.messages.length}
                  </span>
                </div>
              </Collapsible>
            )}
          </div>
        )}
      </div>
    );
  }
}
