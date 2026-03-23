type FontWeight = 400 | 700;

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: FontWeight;
};

const FONT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const NOTO_SPIKE_THRESHOLD_MS = 500;

const fontCache = new Map<string, Promise<LoadedFont[]>>();

function buildGoogleFontCssUrl(family: string, weight: FontWeight, text: string) {
  const encodedFamily = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weight}&text=${encodeURIComponent(text)}&display=swap`;
}

async function fetchGoogleFont(family: string, weight: FontWeight, text: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

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

async function loadFontFamily(family: string, text: string) {
  const startedAt = Date.now();
  const [regular, bold] = await Promise.all([
    fetchGoogleFont(family, 400, text),
    fetchGoogleFont(family, 700, text),
  ]);

  return {
    elapsedMs: Date.now() - startedAt,
    fonts: [
      { name: family, data: regular, style: "normal" as const, weight: 400 as const },
      { name: family, data: bold, style: "normal" as const, weight: 700 as const },
    ],
  };
}

async function loadFontFallbackChain(text: string) {
  try {
    const noto = await loadFontFamily("Noto Sans KR", text);

    // Spike decision: only keep Noto when the subset fetch stays within the latency budget.
    if (noto.elapsedMs <= NOTO_SPIKE_THRESHOLD_MS) {
      return noto.fonts;
    }
  } catch {
    // Fall through to Inter.
  }

  try {
    const inter = await loadFontFamily("Inter", text);
    return inter.fonts;
  } catch {
    return [];
  }
}

export async function loadMatchOgFonts(text: string) {
  const cacheKey = text || "WorldBreak";

  if (!fontCache.has(cacheKey)) {
    fontCache.set(cacheKey, loadFontFallbackChain(cacheKey));
  }

  return fontCache.get(cacheKey)!;
}
