import { RefreshIcon, SearchIcon } from '@heroicons/react/outline';
import cx from 'classnames';
import randomColor from 'randomcolor';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

async function findInboxFolder(dir: FileSystemDirectoryHandle) {
  const dirs: FileSystemDirectoryHandle[] = [];
  for await (const entry of dir.values()) {
    if (entry.kind === 'directory') {
      dirs.push(entry);
    }
  }

  const inbox = dirs.find((dir) => dir.name === 'inbox');
  if (inbox) {
    return inbox;
  }
}

async function getSubDirs(dir: FileSystemDirectoryHandle) {
  const entries: FileSystemDirectoryHandle[] = [];

  for await (const entry of dir.values()) {
    if (entry.kind === 'directory') {
      entries.push(entry);
    }
  }

  return entries;
}

const decoder = new TextDecoder('utf-8');

function decodeString(str: string) {
  return decoder.decode(
    new Uint8Array(str.split('').map((s) => s.charCodeAt(0)))
  );
}

async function readMessageJSON(dir: FileSystemDirectoryHandle) {
  try {
    const file = await dir.getFileHandle('message_1.json');

    return (await file.getFile()).text();
  } catch (e) {
    return null;
  }
}

async function readAutofillInformation(dir: FileSystemDirectoryHandle) {
  try {
    const file = await dir.getFileHandle('autofill_information.json');

    return (await file.getFile()).text();
  } catch (e) {
    return null;
  }
}

async function getMyselfName(
  dir: FileSystemDirectoryHandle
): Promise<string | null> {
  const json = await readAutofillInformation(dir);
  if (json) {
    const autofill = JSON.parse(json);
    return decodeString(
      autofill['autofill_information_v2']?.['FULL_NAME']?.[0]
    ) as string;
  } else {
    return null;
  }
}

const chatCache = new Map<string, string>();

type Chat = {
  name: string;
  dirName: string;
  lastSent: number;
  title: string;
};

async function loadChats(
  inboxDir: FileSystemDirectoryHandle | null
): Promise<Chat[]> {
  if (!inboxDir) {
    return [];
  }

  const subdirs = await getSubDirs(inboxDir);
  return Promise.all(
    subdirs.map(async (dir) => {
      const messageJSON = await readMessageJSON(dir);
      if (messageJSON) {
        chatCache.set(dir.name, messageJSON);

        const message = JSON.parse(messageJSON);
        const name = decodeString(message.participants[0].name);

        const lastSent = message.messages.slice(-1)[0].timestamp_ms as number;

        return {
          name,
          dirName: dir.name,
          lastSent,
          title: decodeString(message.title),
        } as Chat;
      } else {
        return null;
      }
    })
  ).then((chats) => chats.filter(Boolean)) as Promise<Chat[]>;
}

enum MessageType {
  Generic = 'Generic',
  Unsubscribe = 'Unsubscribe',
  Subscribe = 'Subscribe',
  Call = 'Call',
  Share = 'Share',
}

type Message = (
  | {
      type: MessageType.Unsubscribe | MessageType.Unsubscribe;
      users: {
        name: string;
      }[];
    }
  | {
      type: MessageType.Call;
      call_duration: number;
    }
  | {
      type: MessageType.Share;
      share: {
        link: string;
      };
    }
  | {
      type: MessageType.Generic;

      // TODO:
      // photos:
    }
) & {
  sender_name: string;
  timestamp_ms: number;
  content: string;
  is_unsent: boolean;
};

type MessageData = {
  messages: Message[];
  participants: {
    name: string;
  }[];
  title: string;
  is_still_participant: boolean;
  // TODO:
  thread_type: string;
  thread_path: string;
};

export default function HomePage() {
  const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );
  const [inboxDir, setInboxDir] = useState<FileSystemDirectoryHandle | null>(
    null
  );

  const [folderName, setFolderName] = useState<string | null>(null);

  const currentMessage = useMemo<MessageData | null>(() => {
    if (!folderName) {
      return null;
    }

    if (chatCache.has(folderName)) {
      return JSON.parse(chatCache.get(folderName) as string);
    } else {
      return null;
    }
  }, [folderName]);

  const messagesGroupedByConsecutiveSender = useMemo<Message[][]>(() => {
    if (!currentMessage) {
      return [];
    }

    const messages = currentMessage.messages.sort(
      (a, b) => a.timestamp_ms - b.timestamp_ms
    );

    const groupedMessages: Message[][] = [];

    let currentGroup: Message[] = [];
    let currentSender = messages[0].sender_name;

    for (const message of messages) {
      if (message.sender_name === currentSender) {
        currentGroup.push(message);
      } else {
        groupedMessages.push(currentGroup);
        currentGroup = [message];
        currentSender = message.sender_name;
      }
    }

    groupedMessages.push(currentGroup);

    return groupedMessages;
  }, [currentMessage]);

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
            {messagesGroupedByConsecutiveSender.map((messages, groupIdx) => {
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

                      const content = decodeString(message.content || '');

                      return content ? (
                        <div
                          key={`message_${message.sender_name}_${groupIdx}_${i}`}
                          className={cx('flex', {
                            'justify-end': isMe,
                          })}
                        >
                          <div
                            className={cx(
                              'whitespace-pre-wrap rounded-2xl px-4 py-2',
                              {
                                'rounded-r-md bg-blue-400 text-white': isMe,
                                'rounded-l-md bg-gray-200': !isMe,
                                'rounded-tl-2xl': isFirst && !isMe,
                                'rounded-bl-2xl': isLast && !isMe,
                                'rounded-tr-2xl': isFirst && isMe,
                                'rounded-br-2xl': isLast && isMe,
                              }
                            )}
                          >
                            {content}
                          </div>
                        </div>
                      ) : null;
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
