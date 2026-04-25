import { getEnv, hasSupabaseEnv } from "@/lib/env";

export function isOwnerUsername(username: string | null | undefined) {
  if (!hasSupabaseEnv()) {
    return false;
  }

  return username?.toLowerCase() === getEnv().GITHUB_OWNER_USERNAME.toLowerCase();
}
