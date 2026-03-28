type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: 400 | 700;
};

export async function loadMatchOgFonts(baseUrl: string): Promise<LoadedFont[]> {
  const [regular, bold] = await Promise.all([
    fetch(new URL("/fonts/NotoSansKR-Regular.woff2", baseUrl)).then((r) => r.arrayBuffer()),
    fetch(new URL("/fonts/NotoSansKR-Bold.woff2", baseUrl)).then((r) => r.arrayBuffer()),
  ]);

  return [
    { name: "Noto Sans KR", data: regular, style: "normal", weight: 400 },
    { name: "Noto Sans KR", data: bold, style: "normal", weight: 700 },
  ];
}
