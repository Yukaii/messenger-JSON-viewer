import { useMemo } from 'react';

import { getSubDirs, readAutofillInformation, readMessageJSON } from './file';

import { Chat, Message, MessageData } from '@/types';

const decoder = new TextDecoder('utf-8');

export function decodeString(str: string) {
  return decoder.decode(
    new Uint8Array(str.split('').map((s) => s.charCodeAt(0)))
  );
}

export async function getMyselfName(
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

export async function loadChats(
  inboxDir: FileSystemDirectoryHandle | null
): Promise<Chat[]> {
  if (!inboxDir) {
    return [];
  }

  const subDirs = await getSubDirs(inboxDir);
  return Promise.all(
    subDirs.map(async (dir) => {
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

export function useCurrentMessage(folderName: string | null) {
  return useMemo<MessageData | null>(() => {
    if (!folderName) {
      return null;
    }

    if (chatCache.has(folderName)) {
      return JSON.parse(chatCache.get(folderName) as string);
    } else {
      return null;
    }
  }, [folderName]);
}

// Group message by consecutive sender name
export function useGroupedMessages(currentMessage: MessageData | null) {
  return useMemo<Message[][]>(() => {
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
}
