import * as path from 'path';
import { statSync } from 'fs';
import { readdir } from 'fs/promises';

import { hasProperty } from './has-property.js';

interface FileMeta<T extends object> {
  itemName: string;
  fileName: string;
  fullPath: string;
  content: T;
}

type FileMetaWithoutContent<T extends object> = Omit<FileMeta<T>, 'content'>;

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
        let fullPath: string;
        if (isDir) {
          itemName = fullPathStr.split('/').at(-1)!;
          fileName = 'index.js';
          fullPath = path.join(fullPathStr, 'index.js');
        } else {
          itemName = dirContentItem.split('.').at(0)!;
          fileName = dirContentItem;
          fullPath = fullPathStr;
        }

        const newFileMeta: FileMetaWithoutContent<T> = {
          itemName,
          fileName,
          fullPath
        };
        return [...acc, newFileMeta];
      },
      []
    );

  const fileMetas: FileMeta<T>[] = [];
  for (const { fileName, fullPath, itemName } of fileMetasWithoutContent) {
    const module = (await import(fullPath)) as unknown;

    if (
      typeof module !== 'object' ||
      module === null ||
      !hasProperty(module, 'default')
    ) {
      throw new Error(`${fullPath} needs to default export`);
    }

    fileMetas.push({
      content: module.default as T,
      itemName,
      fileName,
      fullPath
    });
  }

  return fileMetas;
}
