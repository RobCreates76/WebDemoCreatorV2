/** Per LLM call — two calls run sequentially in agent mode. */
export const AGENT_AI_TIMEOUT_MS = 240_000;

export function isAbortTimeoutError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "TimeoutError") return true;
  if (error instanceof Error) {
    return (
      error.name === "TimeoutError" ||
      error.message.includes("aborted due to timeout") ||
      error.message.includes("The operation was aborted")
    );
  }
  return false;
}

export function agentTimeoutMessage(context: string): string {
  return `${context} timed out after ${Math.round(AGENT_AI_TIMEOUT_MS / 60_000)} minutes. Agent builds usually finish in 2–4 minutes — try again, or pick a faster model in Agent Settings (e.g. gpt-oss:20b).`;
}
