import { pathToFileURL } from 'node:url';

const FILE_PATH = 'dist/assets/package.json';

export async function getPackageJson(): Promise<{
  homepage: string;
  version: string;
}> {
  const url = pathToFileURL(FILE_PATH);
  return (
    import(url.toString(), {
      assert: {
        type: 'json'
      }
    }) as Promise<{ default: { homepage: string; version: string } }>
  ).then((m) => m.default);
}
