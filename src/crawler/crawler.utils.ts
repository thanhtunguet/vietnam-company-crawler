// crawler.utils.ts
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await requestFn();
    } catch (err) {
      attempt++;
      console.warn(
        `[Retry] Attempt ${attempt} failed:`,
        (err as Error).message,
      );

      if (attempt >= maxRetries) {
        console.error(`[Retry] Max retries reached. Throwing error.`);
        throw err;
      }

      await delay(delayMs * Math.pow(2, attempt - 1)); // Exponential backoff
    }
  }

  throw new Error('Unexpected retry failure'); // Should not reach here
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
