import { readFileSync } from "node:fs";

type ViteManifest = Record<string, { file: string; css?: string[] }>;

export function renderViteAssets() {
  if (process.env.NODE_ENV !== "production") {
    return (
      <>
        <script type="module" src="/@vite/client"></script>
        <script type="module" src="/src/client.ts"></script>
      </>
    );
  }

  const manifest = JSON.parse(
    readFileSync(new URL("../public/assets/.vite/manifest.json", import.meta.url), "utf8"),
  ) as ViteManifest;
  const entry = manifest["src/client.ts"];

  return (
    <>
      {entry.css?.map((href) => <link rel="stylesheet" href={`/assets/${href}`} />)}
      <script type="module" src={`/assets/${entry.file}`}></script>
    </>
  );
}
