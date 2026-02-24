// Define a reusable Result type
export type Result<T, E = Error> = [T, null] | [null, E];

// Generic tryCatch function
export default async function tryCatch<T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await fn();
    return [data, null];
  } catch (error) {
    return [null, error as E];
  }
}