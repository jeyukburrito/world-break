function normalizeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = normalized.length % 4;

  if (paddingLength === 0) {
    return normalized;
  }

  return normalized + "=".repeat(4 - paddingLength);
}

export function encodeUtf8Base64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeUtf8Base64Url(value: string) {
  const binary = atob(normalizeBase64Url(value));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function encodeJsonBase64Url(value: Record<string, string>) {
  return encodeUtf8Base64Url(JSON.stringify(value));
}

export function decodeJsonBase64Url(value: string) {
  return JSON.parse(decodeUtf8Base64Url(value));
}
