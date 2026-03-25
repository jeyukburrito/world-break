import { readFile } from "node:fs/promises";
import { join } from "node:path";

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: 400 | 700;
};

async function readBundledOgFonts(): Promise<LoadedFont[]> {
  const fontDir = join(process.cwd(), "public", "fonts");
  const [regular, bold] = await Promise.all([
    readFile(join(fontDir, "NotoSansKR-Regular.ttf")),
    readFile(join(fontDir, "NotoSansKR-Bold.ttf")),
  ]);

  return [
    { name: "Noto Sans KR", data: regular.buffer, style: "normal", weight: 400 },
    { name: "Noto Sans KR", data: bold.buffer, style: "normal", weight: 700 },
  ];
}

let fontPromise: Promise<LoadedFont[]> | null = null;

export async function loadMatchOgFonts(): Promise<LoadedFont[]> {
  if (!fontPromise) {
    fontPromise = readBundledOgFonts().catch((error) => {
      fontPromise = null;
      throw error;
    });
  }

  return fontPromise;
}
