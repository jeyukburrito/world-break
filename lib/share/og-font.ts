type FontWeight = 400 | 700;

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: FontWeight;
};

const FONT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
// Total budget for font loading: if exceeded, return empty fonts and render without custom font
const FONT_BUDGET_MS = 3000;
// Per-request timeout for each Google Fonts fetch
const FETCH_TIMEOUT_MS = 1500;

const fontCache = new Map<string, Promise<LoadedFont[]>>();

function buildGoogleFontCssUrl(family: string, weight: FontWeight, text: string) {
  const encodedFamily = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weight}&text=${encodeURIComponent(text)}&display=swap`;
}

async function fetchGoogleFont(family: string, weight: FontWeight, text: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const cssResponse = await fetch(buildGoogleFontCssUrl(family, weight, text), {
      headers: { "User-Agent": FONT_USER_AGENT },
      cache: "force-cache",
      signal: controller.signal,
    });

    if (!cssResponse.ok) {
      throw new Error(`Failed to load ${family} CSS`);
    }

    const css = await cssResponse.text();
    const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype|woff2|woff)'\)/);

    if (!match) {
      throw new Error(`Font file URL missing for ${family}`);
    }

    const fontResponse = await fetch(match[1], {
      cache: "force-cache",
      signal: controller.signal,
    });

    if (!fontResponse.ok) {
      throw new Error(`Failed to download ${family} font`);
    }

    return fontResponse.arrayBuffer();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadFontFamily(family: string, text: string): Promise<LoadedFont[]> {
  const [regular, bold] = await Promise.all([
    fetchGoogleFont(family, 400, text),
    fetchGoogleFont(family, 700, text),
  ]);

  return [
    { name: family, data: regular, style: "normal" as const, weight: 400 as const },
    { name: family, data: bold, style: "normal" as const, weight: 700 as const },
  ];
}

async function loadFontFallbackChain(text: string): Promise<LoadedFont[]> {
  const deadline = new Promise<LoadedFont[]>((resolve) =>
    setTimeout(() => resolve([]), FONT_BUDGET_MS),
  );

  const attempt = (async () => {
    try {
      return await loadFontFamily("Noto Sans KR", text);
    } catch {
      // Noto failed — try Inter
    }
    try {
      return await loadFontFamily("Inter", text);
    } catch {
      return [];
    }
  })();

  return Promise.race([attempt, deadline]);
}

export async function loadMatchOgFonts(text: string) {
  const cacheKey = text || "WorldBreak";

  if (!fontCache.has(cacheKey)) {
    fontCache.set(cacheKey, loadFontFallbackChain(cacheKey));
  }

  return fontCache.get(cacheKey)!;
}
