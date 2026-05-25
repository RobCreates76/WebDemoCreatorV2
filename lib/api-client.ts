/** Safely parse fetch responses that may be HTML/plain-text error pages. */
export async function parseApiResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!text) {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status} ${res.statusText})`);
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 180);
    if (!res.ok) {
      throw new Error(
        snippet.startsWith("<")
          ? `Server error (${res.status}). Restart the dev server with: npm run dev`
          : snippet || `Request failed (${res.status})`
      );
    }
    throw new Error(`Invalid server response: ${snippet}`);
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}
