import { pathToFileURL } from 'node:url';

const FILE_PATH = 'dist/assets/package.json';

export async function getVersion(): Promise<string> {
  const url = pathToFileURL(FILE_PATH);
  return (
    import(url.toString(), {
      assert: {
        type: 'json'
      }
    }) as Promise<{ default: { version: string } }>
  ).then((m) => m.default.version);
}
