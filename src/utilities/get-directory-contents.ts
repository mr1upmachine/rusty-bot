import * as path from 'node:path';
import { statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { hasProperty } from './has-property.js';

interface FileMeta<T extends object> {
  itemName: string;
  content: T;
}

type FileMetaWithoutContent<T extends object> = Omit<FileMeta<T>, 'content'> & {
  fileName: string;
  url: string;
};

export async function getDirectoryContents<T extends object>(
  dirPath: string
): Promise<readonly FileMeta<T>[]> {
  const dirContentFileNames = await readdir(dirPath);
  const fileMetasWithoutContent: readonly FileMetaWithoutContent<T>[] =
    dirContentFileNames.reduce<FileMetaWithoutContent<T>[]>(
      (acc, dirContentItem) => {
        const fullPathStr = path.join(dirPath, dirContentItem);
        const isDir = statSync(fullPathStr).isDirectory();

        let itemName: string;
        let fileName: string;
        let url = pathToFileURL(fullPathStr).toString();
        if (isDir) {
          itemName = url.split('/').at(-1) ?? '';
          fileName = 'index.js';
          url = pathToFileURL(path.join(fullPathStr, fileName)).toString();
        } else {
          itemName = path.basename(url).split('.').at(0) ?? '';
          fileName = dirContentItem;
        }

        const newFileMeta: FileMetaWithoutContent<T> = {
          itemName,
          fileName,
          url
        };
        return [...acc, newFileMeta];
      },
      []
    );

  const fileMetas: FileMeta<T>[] = [];
  for (const { url, itemName } of fileMetasWithoutContent) {
    const module = (await import(url)) as unknown;

    if (
      typeof module !== 'object' ||
      module === null ||
      !hasProperty(module, 'default')
    ) {
      throw new Error(`${url} needs to default export`);
    }

    fileMetas.push({ content: module.default as T, itemName });
  }

  return fileMetas;
}
