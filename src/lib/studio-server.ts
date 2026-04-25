import { NextResponse } from "next/server";
import { isOwnerUsername } from "@/lib/auth";
import { createServerSupabaseClient, getServerViewer } from "@/lib/supabase/server";

export async function getOwnerSupabaseOrResponse() {
  const viewer = await getServerViewer();

  if (!viewer || !isOwnerUsername(viewer.user_metadata.user_name)) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase: null,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      response: NextResponse.json(
        { error: "Supabase environment is not configured." },
        { status: 503 },
      ),
      supabase: null,
    };
  }

  return {
    response: null,
    supabase,
  };
}

export function parseTagList(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => String(value).trim())
      .filter(Boolean);
  }

  if (typeof raw !== "string") {
    return [] as string[];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseListText(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => String(value).trim())
      .filter(Boolean);
  }

  if (typeof raw !== "string") {
    return [] as string[];
  }

  return raw
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function ensureSlug(value: unknown, fallbackTitle: unknown) {
  const candidate =
    typeof value === "string" && value.trim()
      ? value
      : typeof fallbackTitle === "string"
        ? fallbackTitle
        : "";

  return candidate
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
