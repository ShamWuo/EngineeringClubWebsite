import { revalidatePath as nextRevalidatePath, revalidateTag as nextRevalidateTag } from 'next/cache';

export function safeRevalidatePath(path: string, type?: 'layout' | 'page') {
  try {
    nextRevalidatePath(path, type);
  } catch {
    // Ignore when executed outside request scope (e.g. Vitest)
  }
}

export function safeRevalidateTag(tag: string) {
  try {
    nextRevalidateTag(tag);
  } catch {
    // Ignore when executed outside request scope
  }
}
