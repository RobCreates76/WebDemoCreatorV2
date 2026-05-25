function extractNextJsErrorMessage(html: string): string | null {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) return null;

  try {
    const data = JSON.parse(match[1]) as {
      err?: { message?: string };
      props?: { pageProps?: { err?: { message?: string } } };
    };
    return data.err?.message || data.props?.pageProps?.err?.message || null;
  } catch {
    return null;
  }
}

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
    const nextError = text.startsWith("<") ? extractNextJsErrorMessage(text) : null;
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 180);

    if (!res.ok) {
      if (nextError) {
        throw new Error(nextError);
      }
      throw new Error(
        snippet.startsWith("<")
          ? `Server error (${res.status}). Restart the dev server with: npm run dev`
          : snippet || `Request failed (${res.status})`
      );
    }
    throw new Error(nextError || `Invalid server response: ${snippet}`);
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
