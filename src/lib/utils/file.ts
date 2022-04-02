export async function findInboxFolder(dir: FileSystemDirectoryHandle) {
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
export async function getSubDirs(dir: FileSystemDirectoryHandle) {
  const entries: FileSystemDirectoryHandle[] = [];

  for await (const entry of dir.values()) {
    if (entry.kind === 'directory') {
      entries.push(entry);
    }
  }

  return entries;
}

export async function readMessageJSON(dir: FileSystemDirectoryHandle) {
  try {
    const file = await dir.getFileHandle('message_1.json');

    return (await file.getFile()).text();
  } catch (e) {
    return null;
  }
}

export async function readAutofillInformation(dir: FileSystemDirectoryHandle) {
  try {
    const file = await dir.getFileHandle('autofill_information.json');

    return (await file.getFile()).text();
  } catch (e) {
    return null;
  }
}

export async function getFileHandleRecursively(
  root: FileSystemDirectoryHandle,
  path: string
): Promise<FileSystemFileHandle | null> {
  const parts = path.split('/');

  if (parts.length === 0) {
    return null;
  } else if (parts.length === 1) {
    return root.getFileHandle(parts[0]);
  } else {
    const dir = await root.getDirectoryHandle(parts[0]);
    return getFileHandleRecursively(dir, parts.slice(1).join('/'));
  }
}
