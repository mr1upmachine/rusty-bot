const ASSET_PATH = '../assets/package.json';

export async function getVersion(): Promise<string> {
  return (
    import(ASSET_PATH, {
      assert: {
        type: 'json'
      }
    }) as Promise<{ default: { version: string } }>
  ).then((m) => m.default.version);
}
