import { cookies } from "next/headers";

export async function getActiveBranchId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get("active_branch")?.value || undefined;
}
