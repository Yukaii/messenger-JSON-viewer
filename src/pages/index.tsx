import { useState } from 'react';
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

async function getSubdirs(dir: FileSystemDirectoryHandle) {
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

const chatCache = new Map<string, string>();

export default function HomePage() {
  const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );
  const [inboxDir, setInboxDir] = useState<FileSystemDirectoryHandle | null>(
    null
  );

  const { data } = useSWR('chats', async () => {
    if (!inboxDir) {
      return [];
    }

    const subdirs = await getSubdirs(inboxDir);
    return Promise.all(
      subdirs.map(async (dir) => {
        const messageJSON = await readMessageJSON(dir);
        if (messageJSON) {
          chatCache.set(dir.name, messageJSON);

          const message = JSON.parse(messageJSON);
          const name = decodeString(message.participants[0].name);

          const lastSent = message.messages.slice(-1)[0].timestamp_ms;

          return {
            name,
            dirName: dir.name,
            lastSent,
          };
        } else {
          return null;
        }
      })
    ).then((chats) => chats.filter(Boolean));
  });

  const openDirPicker = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();

      const inbox = await findInboxFolder(directoryHandle);

      if (inbox) {
        setInboxDir(inbox);
        setDirectory(directory);
      } else {
        window.alert('This is not a valid Messenger archive folder.');
      }
      // eslint-disable-next-line no-empty
    } catch {}
  };

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

      {data && data.length}

      {/* <div>{JSON.stringify(data, null, 2)}</div> */}
    </div>
  );
}
