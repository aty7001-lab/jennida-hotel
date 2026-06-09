"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLanguage(lang: "en" | "th") {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", lang, { path: "/" });
  revalidatePath("/", "layout");
}
